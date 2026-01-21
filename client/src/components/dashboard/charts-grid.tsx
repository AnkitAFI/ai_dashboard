
// import { useEffect, useState } from "react";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Doughnut } from "react-chartjs-2";
// import { useFilters } from "@/components/dashboard/FiltersContext";
// import { useAISummary } from "@/hooks/useAISummary";
 
// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
 
// interface ChartCardProps {
//   title: string;
//   children: React.ReactNode;
//   isLoading?: boolean;
//   summary?: string;
//   summaryLoading?: boolean;
// }
 
// function ChartCard({ title, children, isLoading, summary, summaryLoading }: ChartCardProps) {
//   return (
//     <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between pb-4">
//         <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//         <Badge variant="secondary" className="text-xs">
//           Live Data
//         </Badge>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="chart-container relative h-80 w-full">
//           {isLoading ? <Skeleton className="w-full h-full" /> : children}
//         </div>
//         {summaryLoading ? (
//           <div className="mt-3 text-sm text-muted-foreground italic">
//             Generating Smart summary...
//           </div>
//         ) : summary ? (
//           <div className="mt-3 text-sm font-medium p-3 bg-muted/50 rounded-lg">
//             {summary}
//           </div>
//         ) : null}
//       </CardContent>
//     </Card>
//   );
// }
 
// export default function ChartsGrid({ selectedSource }: { selectedSource: string }) {
//   const BASE_URL = "https://api.insydz.com";
//   const { filters } = useFilters();
//   const [, setLocation] = useLocation();
 
//   const [flipkartProducts, setFlipkartProducts] = useState<any[]>([]);
//   const [amazonProducts, setAmazonProducts] = useState<any[]>([]);
//   const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
//   const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
//   const [ratings, setRatings] = useState<any[]>([]);
//   const [sentiments, setSentiments] = useState<any[]>([]);
//   const [rapidApiProducts, setRapidApiProducts] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
 
//   const buildQueryParams = (table: string) => {
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
//     const fetchAll = async () => {
//       setIsLoading(true);
//       try {
//         const table = filters.table || selectedSource;
//         const queryParams = buildQueryParams(table);
//         const topN = filters.topN || 10; // Use topN from filters
       
//         if (selectedSource === "both" || table === "both") {
//           const flipkartParams = buildQueryParams("flipkart");
//           const amazonParams = buildQueryParams("amazon_reviews");
         
//           const [
//             flipkartRes,
//             amazonRes,
//             flipkartCatRes,
//             amazonCatRes,
//             ratingsRes,
//             sentimentRes,
//             rapidApiRes,
//           ] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=flipkart&n=${topN}&${flipkartParams}`),
//             fetch(`${BASE_URL}/top?table=amazon_reviews&n=${topN}&${amazonParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${amazonParams}`),
//           ]);
 
//           const [
//             flipkartJson,
//             amazonJson,
//             flipkartCatJson,
//             amazonCatJson,
//             ratingsJson,
//             sentimentJson,
//             rapidApiJson,
//           ] = await Promise.all([
//             flipkartRes.json(),
//             amazonRes.json(),
//             flipkartCatRes.json(),
//             amazonCatRes.json(),
//             ratingsRes.json(),
//             sentimentRes.json(),
//             rapidApiRes.json(),
//           ]);
 
//           setFlipkartProducts(flipkartJson.data || []);
//           setAmazonProducts(amazonJson.data || []);
//           setFlipkartCategories(flipkartCatJson || []);
//           setAmazonCategories(amazonCatJson || []);
//           setRatings(ratingsJson || []);
//           setSentiments(sentimentJson || []);
//           setRapidApiProducts(rapidApiJson.data || []);
//         } else if (table === "amazon_reviews") {
//           const [productsRes, categoriesRes, ratingsRes, sentimentRes, rapidApiRes] =
//             await Promise.all([
//               fetch(`${BASE_URL}/top?table=amazon_reviews&n=${topN}&${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`),
//             ]);
 
//           const [productsJson, categoriesJson, ratingsJson, sentimentJson, rapidApiJson] =
//             await Promise.all([
//               productsRes.json(),
//               categoriesRes.json(),
//               ratingsRes.json(),
//               sentimentRes.json(),
//               rapidApiRes.json(),
//             ]);
 
//           setFlipkartProducts([]);
//           setAmazonProducts(productsJson.data || []);
//           setFlipkartCategories([]);
//           setAmazonCategories(categoriesJson || []);
//           setRatings(ratingsJson || []);
//           setSentiments(sentimentJson || []);
//           setRapidApiProducts(rapidApiJson.data || []);
//         } else {
//           const [productsRes, categoryRes] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=flipkart&n=${topN}&${queryParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${queryParams}`),
//           ]);
 
//           const [productsJson, categoryJson] = await Promise.all([
//             productsRes.json(),
//             categoryRes.json(),
//           ]);
 
//           setFlipkartProducts(productsJson.data || []);
//           setAmazonProducts([]);
//           setFlipkartCategories(categoryJson || []);
//           setAmazonCategories([]);
//           setRatings([]);
//           setSentiments([]);
//           setRapidApiProducts([]);
//         }
//       } catch (error) {
//         console.error("Error fetching chart data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
 
//     fetchAll();
//   }, [selectedSource, filters]);
 
//   // 🔹 AI Summaries
//   const { summary: flipkartProductsSummary, loading: flipkartProductsLoading } =
//     useAISummary("Summarize Flipkart top products by rating", "flipkart", flipkartProducts, flipkartProducts.length, filters);
 
//   const { summary: flipkartReviewsSummary, loading: flipkartReviewsLoading } =
//     useAISummary("Summarize Flipkart products with most reviews", "flipkart", flipkartProducts, flipkartProducts.length, filters);
 
//   const { summary: flipkartCategoriesSummary, loading: flipkartCategoriesLoading } =
//     useAISummary("Summarize Flipkart category distribution", "flipkart", flipkartCategories, flipkartCategories.length, filters);
 
//   const { summary: amazonCategoriesSummary, loading: amazonCategoriesLoading } =
//     useAISummary("Summarize Amazon category distribution", "rapidapi_amazon_products", amazonCategories, amazonCategories.length, filters);
 
//   const { summary: ratingsSummary, loading: ratingsLoading } =
//     useAISummary("Summarize rating distribution", "rapidapi_amazon_products", ratings, ratings.length, filters);
 
//   const { summary: sentimentsSummary, loading: sentimentsLoading } =
//     useAISummary("Summarize sentiment distribution", "rapidapi_amazon_products", sentiments, sentiments.length, filters);
 
//   const { summary: rapidApiSalesSummary, loading: rapidApiSalesLoading } =
//     useAISummary("Summarize top selling products by daily sales volume from RapidAPI data", "rapidapi_amazon_products", rapidApiProducts, rapidApiProducts.length, filters);
 
//   // 🔹 Click Handlers for Navigation
//   const handleFlipkartProductClick = (index: number) => {
//     const product = flipkartProducts[index];
//     if (product && product.title) {
//       const productName = encodeURIComponent(product.title);
//       console.log("Navigating to Flipkart product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=flipkart`);
//     }
//   };
 
//   const handleFlipkartCategoryClick = (index: number) => {
//     const category = flipkartCategories[index];
//     if (category && category.category) {
//       const categoryName = encodeURIComponent(category.category);
//       console.log("Navigating to Flipkart category:", categoryName);
//       setLocation(`/category-products/flipkart/${categoryName}?page=1&from=dashboard`);
//     }
//   };
 
//   const handleAmazonCategoryClick = (index: number) => {
//     const category = amazonCategories[index];
//     if (category && (category.category || category.category_name)) {
//       const categoryName = encodeURIComponent(category.category || category.category_name);
//       console.log("Navigating to Amazon category:", categoryName);
//       setLocation(`/category-products/amazon/${categoryName}?page=1&from=dashboard`);
//     }
//   };
 
//   const handleRapidApiProductClick = (index: number) => {
//     const product = rapidApiProducts[index];
//     if (product && product.product_title) {
//       const productName = encodeURIComponent(product.product_title);
//       console.log("Navigating to Amazon product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=amazon`);
//     }
//   };
 
//   // 🔹 Common Chart Options with Click Events
//   const createBarOptions = (clickHandler: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: true, position: "bottom" as const },
//       tooltip: {
//         callbacks: {
//           afterLabel: () => "Click to view details"
//         }
//       }
//     },
//     onClick: (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         clickHandler(index);
//       }
//     },
//     onHover: (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     }
//   });
 
//   const createDoughnutOptions = (clickHandler?: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: true, position: "bottom" as const },
//       tooltip: clickHandler ? {
//         callbacks: {
//           afterLabel: () => "Click to view details"
//         }
//       } : undefined
//     },
//     onClick: clickHandler ? (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         clickHandler(index);
//       }
//     } : undefined,
//     onHover: clickHandler ? (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     } : undefined
//   });
 
//   const truncateName = (name: string) => {
//     const cleaned = name.replace(/"/g, "");
//     return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
//   };
 
//   const flipkartProductsChart = {
//     labels: flipkartProducts.map((p) => truncateName(p.title || "Unknown")),
//     datasets: [
//       {
//         label: "Flipkart Rating",
//         data: flipkartProducts.map((p) => p.rating || 0),
//         backgroundColor: "hsl(142,76%,36%)",
//       },
//     ],
//   };
 
//   const flipkartReviewsChart = {
//     labels: flipkartProducts.map((p) => truncateName(p.title || "Unknown")),
//     datasets: [
//       {
//         label: "Flipkart Reviews",
//         data: flipkartProducts.map((p) => p.reviews || 0),
//         backgroundColor: "hsl(221,83%,53%)",
//       },
//     ],
//   };
 
//   const flipkartCategoriesChart = {
//     labels: flipkartCategories.map((c) => c.category || "Unknown"),
//     datasets: [
//       {
//         label: "Flipkart Products",
//         data: flipkartCategories.map((c) => c.count || 0),
//         backgroundColor: "hsl(142,76%,36%)",
//       },
//     ],
//   };
 
//   const amazonCategoriesChart = {
//     labels: amazonCategories.map((c) => c.category || c.category_name || "Unknown"),
//     datasets: [
//       {
//         label: "Amazon Products",
//         data: amazonCategories.map((c) => c.count || c.product_count || 0),
//         borderRadius: 8,
//         backgroundColor: "rgba(245, 158, 11, 0.7)",
//       },
//     ],
//   };
 
//   const ratingsChart = {
//     labels: ratings.map((r) => `${r.rating}★`),
//     datasets: [
//       {
//         label: "Number of Products",
//         data: ratings.map((r) => r.count || 0),
//         backgroundColor: "rgba(59,130,246,0.7)",
//       },
//     ],
//   };
 
//   const sentimentsChart = {
//     labels: sentiments.map((s) => s.sentiment || "Unknown"),
//     datasets: [
//       {
//         label: "Sentiment Count",
//         data: sentiments.map((s) => s.count || 0),
//         backgroundColor: [
//           "rgba(34,197,94,0.9)",
//           "rgba(234,179,8,0.9)",
//           "rgba(239,68,68,0.9)",
//         ],
//         borderColor: "rgba(255,255,255,1)",
//         borderWidth: 2,
//       },
//     ],
//   };
 
//   const rapidApiSalesChart = {
//     labels: rapidApiProducts.map((p) => truncateName(p.product_title || "Unknown")),
//     datasets: [
//       {
//         label: "Daily Sales",
//         data: rapidApiProducts.map((p) => p.daily_sales || 0),
//         backgroundColor: "rgba(59,130,246,0.8)",
//         borderRadius: 10,
//       },
//     ],
//   };
 
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//       {flipkartProducts.length > 0 && (
//         <>
//           <ChartCard
//             title="Top Flipkart Products by Rating"
//             isLoading={isLoading}
//             summary={flipkartProductsSummary}
//             summaryLoading={flipkartProductsLoading}
//           >
//             <Bar data={flipkartProductsChart} options={createBarOptions(handleFlipkartProductClick)} />
//           </ChartCard>
 
//           <ChartCard
//             title="Flipkart Products with Most Reviews"
//             isLoading={isLoading}
//             summary={flipkartReviewsSummary}
//             summaryLoading={flipkartReviewsLoading}
//           >
//             <Bar data={flipkartReviewsChart} options={createBarOptions(handleFlipkartProductClick)} />
//           </ChartCard>
 
//           <ChartCard
//             title="Flipkart Categories Distribution"
//             isLoading={isLoading}
//             summary={flipkartCategoriesSummary}
//             summaryLoading={flipkartCategoriesLoading}
//           >
//             <Bar data={flipkartCategoriesChart} options={createBarOptions(handleFlipkartCategoryClick)} />
//           </ChartCard>
//         </>
//       )}
 
//       {amazonCategories.length > 0 && (
//         <ChartCard
//           title="Amazon Categories Distribution"
//           isLoading={isLoading}
//           summary={amazonCategoriesSummary}
//           summaryLoading={amazonCategoriesLoading}
//         >
//           <Bar data={amazonCategoriesChart} options={createBarOptions(handleAmazonCategoryClick)} />
//         </ChartCard>
//       )}
 
//       {ratings.length > 0 && (
//         <ChartCard
//           title="Rating Distribution (Amazon)"
//           isLoading={isLoading}
//           summary={ratingsSummary}
//           summaryLoading={ratingsLoading}
//         >
//           <Bar data={ratingsChart} options={createBarOptions(() => {})} />
//         </ChartCard>
//       )}
 
//       {sentiments.length > 0 && (
//         <ChartCard
//           title="Sentiment Distribution (Amazon)"
//           isLoading={isLoading}
//           summary={sentimentsSummary}
//           summaryLoading={sentimentsLoading}
//         >
//           <Doughnut data={sentimentsChart} options={createDoughnutOptions()} />
//         </ChartCard>
//       )}
 
//       {rapidApiProducts.length > 0 && (
//         <ChartCard
//           title="Top Products by Daily Sales"
//           isLoading={isLoading}
//           summary={rapidApiSalesSummary}
//           summaryLoading={rapidApiSalesLoading}
//         >
//           <Bar data={rapidApiSalesChart} options={createBarOptions(handleRapidApiProductClick)} />
//         </ChartCard>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Doughnut } from "react-chartjs-2";
// import { useFilters } from "@/components/dashboard/FiltersContext";
// import { useAISummary } from "@/hooks/useAISummary";

// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// interface ChartCardProps {
//   title: string;
//   children: React.ReactNode;
//   isLoading?: boolean;
//   summary?: string;
//   summaryLoading?: boolean;
// }

// function ChartCard({ title, children, isLoading, summary, summaryLoading }: ChartCardProps) {
//   return (
//     <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between pb-4">
//         <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//         <Badge variant="secondary" className="text-xs">
//           Live Data
//         </Badge>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="chart-container relative h-80 w-full">
//           {isLoading ? <Skeleton className="w-full h-full" /> : children}
//         </div>
//         {summaryLoading ? (
//           <div className="mt-3 text-sm text-muted-foreground italic">
//             Generating Smart summary...
//           </div>
//         ) : summary ? (
//           <div className="mt-3 text-sm font-medium p-3 bg-muted/50 rounded-lg">
//             {summary}
//           </div>
//         ) : null}
//       </CardContent>
//     </Card>
//   );
// }

// export default function ChartsGrid({ selectedSource }: { selectedSource: string }) {
//   const BASE_URL = "https://api.insydz.com";
//   const { filters } = useFilters();
//   const [, setLocation] = useLocation();

//   const [flipkartProducts, setFlipkartProducts] = useState<any[]>([]);
//   const [amazonProducts, setAmazonProducts] = useState<any[]>([]);
//   const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
//   const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
//   const [flipkartRatings, setFlipkartRatings] = useState<any[]>([]);
//   const [amazonRatings, setAmazonRatings] = useState<any[]>([]);
//   const [flipkartSentiments, setFlipkartSentiments] = useState<any[]>([]);
//   const [amazonSentiments, setAmazonSentiments] = useState<any[]>([]);
//   const [flipkartSalesProducts, setFlipkartSalesProducts] = useState<any[]>([]);
//   const [amazonSalesProducts, setAmazonSalesProducts] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const buildQueryParams = (table: string) => {
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
//     const fetchAll = async () => {
//       setIsLoading(true);
//       try {
//         const table = filters.table || selectedSource;
//         const queryParams = buildQueryParams(table);
//         const topN = filters.topN || 10;
        
//         if (selectedSource === "both" || table === "both") {
//           // Fetch both Flipkart and Amazon data
//           const flipkartParams = buildQueryParams("rapidapi_flipkart_products");
//           const amazonParams = buildQueryParams("rapidapi_amazon_products");
          
//           const [
//             flipkartRes,
//             amazonRes,
//             flipkartCatRes,
//             amazonCatRes,
//             flipkartRatingsRes,
//             amazonRatingsRes,
//             flipkartSentimentRes,
//             amazonSentimentRes,
//             flipkartSalesRes,
//             amazonSalesRes,
//           ] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${flipkartParams}`),
//             fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${amazonParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${amazonParams}`),
//           ]);

//           const [
//             flipkartJson,
//             amazonJson,
//             flipkartCatJson,
//             amazonCatJson,
//             flipkartRatingsJson,
//             amazonRatingsJson,
//             flipkartSentimentJson,
//             amazonSentimentJson,
//             flipkartSalesJson,
//             amazonSalesJson,
//           ] = await Promise.all([
//             flipkartRes.json(),
//             amazonRes.json(),
//             flipkartCatRes.json(),
//             amazonCatRes.json(),
//             flipkartRatingsRes.json(),
//             amazonRatingsRes.json(),
//             flipkartSentimentRes.json(),
//             amazonSentimentRes.json(),
//             flipkartSalesRes.json(),
//             amazonSalesRes.json(),
//           ]);

//           setFlipkartProducts(flipkartJson.data || []);
//           setAmazonProducts(amazonJson.data || []);
//           setFlipkartCategories(flipkartCatJson || []);
//           setAmazonCategories(amazonCatJson || []);
//           setFlipkartRatings(flipkartRatingsJson || []);
//           setAmazonRatings(amazonRatingsJson || []);
//           setFlipkartSentiments(flipkartSentimentJson || []);
//           setAmazonSentiments(amazonSentimentJson || []);
//           setFlipkartSalesProducts(flipkartSalesJson.data || []);
//           setAmazonSalesProducts(amazonSalesJson.data || []);
//         } else if (table === "rapidapi_amazon_products" || table === "amazon") {
//           // Amazon only
//           const [productsRes, categoriesRes, ratingsRes, sentimentRes, salesRes] =
//             await Promise.all([
//               fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`),
//             ]);

//           const [productsJson, categoriesJson, ratingsJson, sentimentJson, salesJson] =
//             await Promise.all([
//               productsRes.json(),
//               categoriesRes.json(),
//               ratingsRes.json(),
//               sentimentRes.json(),
//               salesRes.json(),
//             ]);

//           setFlipkartProducts([]);
//           setAmazonProducts(productsJson.data || []);
//           setFlipkartCategories([]);
//           setAmazonCategories(categoriesJson || []);
//           setFlipkartRatings([]);
//           setAmazonRatings(ratingsJson || []);
//           setFlipkartSentiments([]);
//           setAmazonSentiments(sentimentJson || []);
//           setFlipkartSalesProducts([]);
//           setAmazonSalesProducts(salesJson.data || []);
//         } else {
//           // Flipkart only (rapidapi_flipkart_products)
//           const [productsRes, categoryRes, ratingsRes, sentimentRes, salesRes] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${queryParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`),
//           ]);

//           const [productsJson, categoryJson, ratingsJson, sentimentJson, salesJson] = await Promise.all([
//             productsRes.json(),
//             categoryRes.json(),
//             ratingsRes.json(),
//             sentimentRes.json(),
//             salesRes.json(),
//           ]);

//           setFlipkartProducts(productsJson.data || []);
//           setAmazonProducts([]);
//           setFlipkartCategories(categoryJson || []);
//           setAmazonCategories([]);
//           setFlipkartRatings(ratingsJson || []);
//           setAmazonRatings([]);
//           setFlipkartSentiments(sentimentJson || []);
//           setAmazonSentiments([]);
//           setFlipkartSalesProducts(salesJson.data || []);
//           setAmazonSalesProducts([]);
//         }
//       } catch (error) {
//         console.error("Error fetching chart data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAll();
//   }, [selectedSource, filters]);

//   // 🔹 AI Summaries - Flipkart
//   const { summary: flipkartCategoriesSummary, loading: flipkartCategoriesLoading } =
//     useAISummary("Summarize Flipkart category distribution", "rapidapi_flipkart_products", flipkartCategories, flipkartCategories.length, filters);

//   const { summary: flipkartRatingsSummary, loading: flipkartRatingsLoading } =
//     useAISummary("Summarize Flipkart rating distribution", "rapidapi_flipkart_products", flipkartRatings, flipkartRatings.length, filters);

//   const { summary: flipkartSentimentsSummary, loading: flipkartSentimentsLoading } =
//     useAISummary("Summarize Flipkart sentiment distribution", "rapidapi_flipkart_products", flipkartSentiments, flipkartSentiments.length, filters);

//   const { summary: flipkartSalesSummary, loading: flipkartSalesLoading } =
//     useAISummary("Summarize top selling Flipkart products by daily sales volume", "rapidapi_flipkart_products", flipkartSalesProducts, flipkartSalesProducts.length, filters);

//   // 🔹 AI Summaries - Amazon
//   const { summary: amazonCategoriesSummary, loading: amazonCategoriesLoading } =
//     useAISummary("Summarize Amazon category distribution", "rapidapi_amazon_products", amazonCategories, amazonCategories.length, filters);

//   const { summary: amazonRatingsSummary, loading: amazonRatingsLoading } =
//     useAISummary("Summarize Amazon rating distribution", "rapidapi_amazon_products", amazonRatings, amazonRatings.length, filters);

//   const { summary: amazonSentimentsSummary, loading: amazonSentimentsLoading } =
//     useAISummary("Summarize Amazon sentiment distribution", "rapidapi_amazon_products", amazonSentiments, amazonSentiments.length, filters);

//   const { summary: amazonSalesSummary, loading: amazonSalesLoading } =
//     useAISummary("Summarize top selling Amazon products by daily sales volume", "rapidapi_amazon_products", amazonSalesProducts, amazonSalesProducts.length, filters);

//   // 🔹 Click Handlers for Navigation
//   const handleFlipkartCategoryClick = (index: number) => {
//     const category = flipkartCategories[index];
//     if (category && (category.category || category.category_name)) {
//       const categoryName = encodeURIComponent(category.category || category.category_name);
//       console.log("Navigating to Flipkart category:", categoryName);
//       setLocation(`/category-products/flipkart/${categoryName}?page=1&from=dashboard`);
//     }
//   };

//   const handleAmazonCategoryClick = (index: number) => {
//     const category = amazonCategories[index];
//     if (category && (category.category || category.category_name)) {
//       const categoryName = encodeURIComponent(category.category || category.category_name);
//       console.log("Navigating to Amazon category:", categoryName);
//       setLocation(`/category-products/amazon/${categoryName}?page=1&from=dashboard`);
//     }
//   };

//   const handleFlipkartSalesProductClick = (index: number) => {
//     const product = flipkartSalesProducts[index];
//     if (product && product.product_title) {
//       const productName = encodeURIComponent(product.product_title);
//       console.log("Navigating to Flipkart product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=flipkart`);
//     }
//   };

//   const handleAmazonSalesProductClick = (index: number) => {
//     const product = amazonSalesProducts[index];
//     if (product && product.product_title) {
//       const productName = encodeURIComponent(product.product_title);
//       console.log("Navigating to Amazon product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=amazon`);
//     }
//   };

//   // 🔹 Common Chart Options with Click Events
//   const createBarOptions = (clickHandler: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { 
//       legend: { display: true, position: "bottom" as const },
//       tooltip: {
//         callbacks: {
//           afterLabel: () => "Click to view details"
//         }
//       }
//     },
//     onClick: (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         clickHandler(index);
//       }
//     },
//     onHover: (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     }
//   });

//   const createDoughnutOptions = (clickHandler?: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { 
//       legend: { display: true, position: "bottom" as const },
//       tooltip: clickHandler ? {
//         callbacks: {
//           afterLabel: () => "Click to view details"
//         }
//       } : undefined
//     },
//     onClick: clickHandler ? (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         clickHandler(index);
//       }
//     } : undefined,
//     onHover: clickHandler ? (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     } : undefined
//   });

//   const truncateName = (name: string) => {
//     const cleaned = name.replace(/"/g, "");
//     return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
//   };

//   // 🔹 Chart Data - Flipkart
//   const flipkartCategoriesChart = {
//     labels: flipkartCategories.map((c) => c.category || c.category_name || "Unknown"),
//     datasets: [
//       {
//         label: "Flipkart Products",
//         data: flipkartCategories.map((c) => c.count || 0),
//         backgroundColor: "hsl(142,76%,36%)",
//         borderRadius: 8,
//       },
//     ],
//   };

//   const flipkartRatingsChart = {
//     labels: flipkartRatings.map((r) => `${r.rating}★`),
//     datasets: [
//       {
//         label: "Number of Products",
//         data: flipkartRatings.map((r) => r.count || 0),
//         backgroundColor: "rgba(34,197,94,0.7)",
//       },
//     ],
//   };

//   const flipkartSentimentsChart = {
//     labels: flipkartSentiments.map((s) => s.sentiment || "Unknown"),
//     datasets: [
//       {
//         label: "Sentiment Count",
//         data: flipkartSentiments.map((s) => s.count || 0),
//         backgroundColor: [
//           "rgba(34,197,94,0.9)",
//           "rgba(234,179,8,0.9)",
//           "rgba(239,68,68,0.9)",
//         ],
//         borderColor: "rgba(255,255,255,1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const flipkartSalesChart = {
//     labels: flipkartSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
//     datasets: [
//       {
//         label: "Daily Sales",
//         data: flipkartSalesProducts.map((p) => p.daily_sales || 0),
//         backgroundColor: "rgba(34,197,94,0.8)",
//         borderRadius: 10,
//       },
//     ],
//   };

//   // 🔹 Chart Data - Amazon
//   const amazonCategoriesChart = {
//     labels: amazonCategories.map((c) => c.category || c.category_name || "Unknown"),
//     datasets: [
//       {
//         label: "Amazon Products",
//         data: amazonCategories.map((c) => c.count || c.product_count || 0),
//         borderRadius: 8,
//         backgroundColor: "rgba(245, 158, 11, 0.7)",
//       },
//     ],
//   };

//   const amazonRatingsChart = {
//     labels: amazonRatings.map((r) => `${r.rating}★`),
//     datasets: [
//       {
//         label: "Number of Products",
//         data: amazonRatings.map((r) => r.count || 0),
//         backgroundColor: "rgba(59,130,246,0.7)",
//       },
//     ],
//   };

//   const amazonSentimentsChart = {
//     labels: amazonSentiments.map((s) => s.sentiment || "Unknown"),
//     datasets: [
//       {
//         label: "Sentiment Count",
//         data: amazonSentiments.map((s) => s.count || 0),
//         backgroundColor: [
//           "rgba(34,197,94,0.9)",
//           "rgba(234,179,8,0.9)",
//           "rgba(239,68,68,0.9)",
//         ],
//         borderColor: "rgba(255,255,255,1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const amazonSalesChart = {
//     labels: amazonSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
//     datasets: [
//       {
//         label: "Daily Sales",
//         data: amazonSalesProducts.map((p) => p.daily_sales || 0),
//         backgroundColor: "rgba(59,130,246,0.8)",
//         borderRadius: 10,
//       },
//     ],
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//       {/* Flipkart Charts */}
//       {flipkartCategories.length > 0 && (
//         <ChartCard 
//           title="Flipkart Categories Distribution" 
//           isLoading={isLoading}
//           summary={flipkartCategoriesSummary}
//           summaryLoading={flipkartCategoriesLoading}
//         >
//           <Bar data={flipkartCategoriesChart} options={createBarOptions(handleFlipkartCategoryClick)} />
//         </ChartCard>
//       )}

//       {flipkartRatings.length > 0 && (
//         <ChartCard 
//           title="Rating Distribution (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartRatingsSummary}
//           summaryLoading={flipkartRatingsLoading}
//         >
//           <Bar data={flipkartRatingsChart} options={createBarOptions(() => {})} />
//         </ChartCard>
//       )}

//       {flipkartSentiments.length > 0 && (
//         <ChartCard 
//           title="Sentiment Distribution (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartSentimentsSummary}
//           summaryLoading={flipkartSentimentsLoading}
//         >
//           <Doughnut data={flipkartSentimentsChart} options={createDoughnutOptions()} />
//         </ChartCard>
//       )}

//       {flipkartSalesProducts.length > 0 && (
//         <ChartCard 
//           title="Top Flipkart Products by Daily Sales" 
//           isLoading={isLoading}
//           summary={flipkartSalesSummary}
//           summaryLoading={flipkartSalesLoading}
//         >
//           <Bar data={flipkartSalesChart} options={createBarOptions(handleFlipkartSalesProductClick)} />
//         </ChartCard>
//       )}

//       {/* Amazon Charts */}
//       {amazonCategories.length > 0 && (
//         <ChartCard 
//           title="Amazon Categories Distribution" 
//           isLoading={isLoading}
//           summary={amazonCategoriesSummary}
//           summaryLoading={amazonCategoriesLoading}
//         >
//           <Bar data={amazonCategoriesChart} options={createBarOptions(handleAmazonCategoryClick)} />
//         </ChartCard>
//       )}

//       {amazonRatings.length > 0 && (
//         <ChartCard 
//           title="Rating Distribution (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonRatingsSummary}
//           summaryLoading={amazonRatingsLoading}
//         >
//           <Bar data={amazonRatingsChart} options={createBarOptions(() => {})} />
//         </ChartCard>
//       )}

//       {amazonSentiments.length > 0 && (
//         <ChartCard 
//           title="Sentiment Distribution (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonSentimentsSummary}
//           summaryLoading={amazonSentimentsLoading}
//         >
//           <Doughnut data={amazonSentimentsChart} options={createDoughnutOptions()} />
//         </ChartCard>
//       )}

//       {amazonSalesProducts.length > 0 && (
//         <ChartCard 
//           title="Top Amazon Products by Daily Sales" 
//           isLoading={isLoading}
//           summary={amazonSalesSummary}
//           summaryLoading={amazonSalesLoading}
//         >
//           <Bar data={amazonSalesChart} options={createBarOptions(handleAmazonSalesProductClick)} />
//         </ChartCard>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Bar, Doughnut } from "react-chartjs-2";
// import { useFilters } from "@/components/dashboard/FiltersContext";
// import { useAISummary } from "@/hooks/useAISummary";

// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// interface ChartCardProps {
//   title: string;
//   children: React.ReactNode;
//   isLoading?: boolean;
//   summary?: string;
//   summaryLoading?: boolean;
// }

// function ChartCard({ title, children, isLoading, summary, summaryLoading }: ChartCardProps) {
//   return (
//     <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between pb-4">
//         <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//         <Badge variant="secondary" className="text-xs">
//           Live Data
//         </Badge>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="chart-container relative h-80 w-full">
//           {isLoading ? <Skeleton className="w-full h-full" /> : children}
//         </div>
//         {summaryLoading ? (
//           <div className="mt-3 text-sm text-muted-foreground italic">
//             Generating Smart summary...
//           </div>
//         ) : summary ? (
//           <div className="mt-3 text-sm font-medium p-3 bg-muted/50 rounded-lg">
//             {summary}
//           </div>
//         ) : null}
//       </CardContent>
//     </Card>
//   );
// }

// export default function ChartsGrid({ selectedSource }: { selectedSource: string }) {
//   const BASE_URL = "https://api.insydz.com";
//   const { filters } = useFilters();
//   const [, setLocation] = useLocation();

//   const [flipkartProducts, setFlipkartProducts] = useState<any[]>([]);
//   const [amazonProducts, setAmazonProducts] = useState<any[]>([]);
//   const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
//   const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
//   const [flipkartRatings, setFlipkartRatings] = useState<any[]>([]);
//   const [amazonRatings, setAmazonRatings] = useState<any[]>([]);
//   const [flipkartSentiments, setFlipkartSentiments] = useState<any[]>([]);
//   const [amazonSentiments, setAmazonSentiments] = useState<any[]>([]);
//   const [flipkartSalesProducts, setFlipkartSalesProducts] = useState<any[]>([]);
//   const [amazonSalesProducts, setAmazonSalesProducts] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const buildQueryParams = (table: string) => {
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
//     const fetchAll = async () => {
//       setIsLoading(true);
//       try {
//         const table = filters.table || selectedSource;
//         const queryParams = buildQueryParams(table);
//         const topN = filters.topN || 10;
        
//         if (selectedSource === "both" || table === "both") {
//           const flipkartParams = buildQueryParams("rapidapi_flipkart_products");
//           const amazonParams = buildQueryParams("rapidapi_amazon_products");
          
//           const [
//             flipkartRes,
//             amazonRes,
//             flipkartCatRes,
//             amazonCatRes,
//             flipkartRatingsRes,
//             amazonRatingsRes,
//             flipkartSentimentRes,
//             amazonSentimentRes,
//             flipkartSalesRes,
//             amazonSalesRes,
//           ] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${flipkartParams}`),
//             fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${amazonParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${amazonParams}`),
//             fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${flipkartParams}`),
//             fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${amazonParams}`),
//           ]);

//           const [
//             flipkartJson,
//             amazonJson,
//             flipkartCatJson,
//             amazonCatJson,
//             flipkartRatingsJson,
//             amazonRatingsJson,
//             flipkartSentimentJson,
//             amazonSentimentJson,
//             flipkartSalesJson,
//             amazonSalesJson,
//           ] = await Promise.all([
//             flipkartRes.json(),
//             amazonRes.json(),
//             flipkartCatRes.json(),
//             amazonCatRes.json(),
//             flipkartRatingsRes.json(),
//             amazonRatingsRes.json(),
//             flipkartSentimentRes.json(),
//             amazonSentimentRes.json(),
//             flipkartSalesRes.json(),
//             amazonSalesRes.json(),
//           ]);

//           setFlipkartProducts(flipkartJson.data || []);
//           setAmazonProducts(amazonJson.data || []);
//           setFlipkartCategories(flipkartCatJson || []);
//           setAmazonCategories(amazonCatJson || []);
//           setFlipkartRatings(flipkartRatingsJson || []);
//           setAmazonRatings(amazonRatingsJson || []);
//           setFlipkartSentiments(flipkartSentimentJson || []);
//           setAmazonSentiments(amazonSentimentJson || []);
//           setFlipkartSalesProducts(flipkartSalesJson.data || []);
//           setAmazonSalesProducts(amazonSalesJson.data || []);
//         } else if (table === "rapidapi_amazon_products" || table === "amazon") {
//           const [productsRes, categoriesRes, ratingsRes, sentimentRes, salesRes] =
//             await Promise.all([
//               fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`),
//               fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`),
//             ]);

//           const [productsJson, categoriesJson, ratingsJson, sentimentJson, salesJson] =
//             await Promise.all([
//               productsRes.json(),
//               categoriesRes.json(),
//               ratingsRes.json(),
//               sentimentRes.json(),
//               salesRes.json(),
//             ]);

//           setFlipkartProducts([]);
//           setAmazonProducts(productsJson.data || []);
//           setFlipkartCategories([]);
//           setAmazonCategories(categoriesJson || []);
//           setFlipkartRatings([]);
//           setAmazonRatings(ratingsJson || []);
//           setFlipkartSentiments([]);
//           setAmazonSentiments(sentimentJson || []);
//           setFlipkartSalesProducts([]);
//           setAmazonSalesProducts(salesJson.data || []);
//         } else {
//           const [productsRes, categoryRes, ratingsRes, sentimentRes, salesRes] = await Promise.all([
//             fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${queryParams}`),
//             fetch(`${BASE_URL}/flipkart/categories?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${queryParams}`),
//             fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`),
//           ]);

//           const [productsJson, categoryJson, ratingsJson, sentimentJson, salesJson] = await Promise.all([
//             productsRes.json(),
//             categoryRes.json(),
//             ratingsRes.json(),
//             sentimentRes.json(),
//             salesRes.json(),
//           ]);

//           setFlipkartProducts(productsJson.data || []);
//           setAmazonProducts([]);
//           setFlipkartCategories(categoryJson || []);
//           setAmazonCategories([]);
//           setFlipkartRatings(ratingsJson || []);
//           setAmazonRatings([]);
//           setFlipkartSentiments(sentimentJson || []);
//           setAmazonSentiments([]);
//           setFlipkartSalesProducts(salesJson.data || []);
//           setAmazonSalesProducts([]);
//         }
//       } catch (error) {
//         console.error("Error fetching chart data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAll();
//   }, [selectedSource, filters]);

//   // 🔹 AI Summaries - Flipkart
//   const { summary: flipkartCategoriesSummary, loading: flipkartCategoriesLoading } =
//     useAISummary("Summarize Flipkart category distribution", "rapidapi_flipkart_products", flipkartCategories, flipkartCategories.length, filters);

//   const { summary: flipkartRatingsSummary, loading: flipkartRatingsLoading } =
//     useAISummary("Summarize Flipkart rating distribution", "rapidapi_flipkart_products", flipkartRatings, flipkartRatings.length, filters);

//   const { summary: flipkartSentimentsSummary, loading: flipkartSentimentsLoading } =
//     useAISummary("Summarize Flipkart sentiment distribution", "rapidapi_flipkart_products", flipkartSentiments, flipkartSentiments.length, filters);

//   const { summary: flipkartSalesSummary, loading: flipkartSalesLoading } =
//     useAISummary("Summarize top selling Flipkart products by daily sales volume", "rapidapi_flipkart_products", flipkartSalesProducts, flipkartSalesProducts.length, filters);

//   // 🔹 AI Summaries - Amazon
//   const { summary: amazonCategoriesSummary, loading: amazonCategoriesLoading } =
//     useAISummary("Summarize Amazon category distribution", "rapidapi_amazon_products", amazonCategories, amazonCategories.length, filters);

//   const { summary: amazonRatingsSummary, loading: amazonRatingsLoading } =
//     useAISummary("Summarize Amazon rating distribution", "rapidapi_amazon_products", amazonRatings, amazonRatings.length, filters);

//   const { summary: amazonSentimentsSummary, loading: amazonSentimentsLoading } =
//     useAISummary("Summarize Amazon sentiment distribution", "rapidapi_amazon_products", amazonSentiments, amazonSentiments.length, filters);

//   const { summary: amazonSalesSummary, loading: amazonSalesLoading } =
//     useAISummary("Summarize top selling Amazon products by daily sales volume", "rapidapi_amazon_products", amazonSalesProducts, amazonSalesProducts.length, filters);

//   // 🔹 Click Handlers for Navigation
//   const handleFlipkartCategoryClick = (index: number) => {
//     const category = flipkartCategories[index];
//     if (category && (category.category || category.category_name)) {
//       const categoryName = encodeURIComponent(category.category || category.category_name);
//       console.log("Navigating to Flipkart category:", categoryName);
//       setLocation(`/category-products/flipkart/${categoryName}?page=1&from=dashboard`);
//     }
//   };

//   const handleAmazonCategoryClick = (index: number) => {
//     const category = amazonCategories[index];
//     if (category && (category.category || category.category_name)) {
//       const categoryName = encodeURIComponent(category.category || category.category_name);
//       console.log("Navigating to Amazon category:", categoryName);
//       setLocation(`/category-products/amazon/${categoryName}?page=1&from=dashboard`);
//     }
//   };

//   const handleFlipkartSalesProductClick = (index: number) => {
//     const product = flipkartSalesProducts[index];
//     if (product && product.product_title) {
//       const productName = encodeURIComponent(product.product_title);
//       console.log("Navigating to Flipkart product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=flipkart`);
//     }
//   };

//   const handleAmazonSalesProductClick = (index: number) => {
//     const product = amazonSalesProducts[index];
//     if (product && product.product_title) {
//       const productName = encodeURIComponent(product.product_title);
//       console.log("Navigating to Amazon product:", productName);
//       setLocation(`/product/${productName}?from=dashboard&source=amazon`);
//     }
//   };

//   // 🔹 Sentiment Click Handlers - NEW
//   const handleFlipkartSentimentClick = (index: number) => {
//     const sentiment = flipkartSentiments[index];
//     if (sentiment && sentiment.sentiment) {
//       const sentimentType = sentiment.sentiment.toLowerCase();
//       console.log("🎯 Navigating to Flipkart sentiment:", sentimentType);
//       setLocation(`/sentiment-products/flipkart/${sentimentType}`);
//     }
//   };

//   const handleAmazonSentimentClick = (index: number) => {
//     const sentiment = amazonSentiments[index];
//     if (sentiment && sentiment.sentiment) {
//       const sentimentType = sentiment.sentiment.toLowerCase();
//       console.log("🎯 Navigating to Amazon sentiment:", sentimentType);
//       setLocation(`/sentiment-products/amazon/${sentimentType}`);
//     }
//   };

//   // 🔹 Common Chart Options with Click Events
//   const createBarOptions = (clickHandler: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { 
//       legend: { display: true, position: "bottom" as const },
//       tooltip: {
//         callbacks: {
//           afterLabel: () => "Click to view details"
//         }
//       }
//     },
//     onClick: (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         clickHandler(index);
//       }
//     },
//     onHover: (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     }
//   });

//   const createDoughnutOptions = (clickHandler: (index: number) => void) => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { 
//       legend: { 
//         display: true, 
//         position: "bottom" as const,
//         labels: {
//           padding: 15,
//           font: {
//             size: 12,
//             weight: 'bold' as const
//           }
//         }
//       },
//       tooltip: {
//         callbacks: {
//           label: (context: any) => {
//             const label = context.label || '';
//             const value = context.parsed || 0;
//             return `${label}: ${value} products`;
//           },
//           afterLabel: () => "👆 Click to view products"
//         },
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         padding: 12,
//         titleFont: {
//           size: 14,
//           weight: 'bold' as const
//         },
//         bodyFont: {
//           size: 12
//         }
//       }
//     },
//     onClick: (_event: any, elements: any[]) => {
//       if (elements.length > 0) {
//         const index = elements[0].index;
//         console.log("🖱️ Doughnut clicked at index:", index);
//         clickHandler(index);
//       }
//     },
//     onHover: (event: any, elements: any[]) => {
//       const canvas = event.native?.target;
//       if (canvas) {
//         canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
//       }
//     },
//     animation: {
//       animateRotate: true,
//       animateScale: true
//     }
//   });

//   const truncateName = (name: string) => {
//     const cleaned = name.replace(/"/g, "");
//     return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
//   };

//   // 🔹 Chart Data - Flipkart
//   const flipkartCategoriesChart = {
//     labels: flipkartCategories.map((c) => c.category || c.category_name || "Unknown"),
//     datasets: [
//       {
//         label: "Flipkart Products",
//         data: flipkartCategories.map((c) => c.count || 0),
//         backgroundColor: "hsl(142,76%,36%)",
//         borderRadius: 8,
//       },
//     ],
//   };

//   const flipkartRatingsChart = {
//     labels: flipkartRatings.map((r) => `${r.rating}★`),
//     datasets: [
//       {
//         label: "Number of Products",
//         data: flipkartRatings.map((r) => r.count || 0),
//         backgroundColor: "rgba(34,197,94,0.7)",
//       },
//     ],
//   };

//   const flipkartSentimentsChart = {
//     labels: flipkartSentiments.map((s) => {
//       const sentiment = s.sentiment || "Unknown";
//       return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
//     }),
//     datasets: [
//       {
//         label: "Sentiment Count",
//         data: flipkartSentiments.map((s) => s.count || 0),
//         backgroundColor: [
//           "rgba(34,197,94,0.9)",
//           "rgba(234,179,8,0.9)",
//           "rgba(239,68,68,0.9)",
//         ],
//         borderColor: "rgba(255,255,255,1)",
//         borderWidth: 3,
//         hoverOffset: 15,
//         hoverBorderWidth: 4,
//       },
//     ],
//   };

//   const flipkartSalesChart = {
//     labels: flipkartSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
//     datasets: [
//       {
//         label: "Daily Sales",
//         data: flipkartSalesProducts.map((p) => p.daily_sales || 0),
//         backgroundColor: "rgba(34,197,94,0.8)",
//         borderRadius: 10,
//       },
//     ],
//   };

//   // 🔹 Chart Data - Amazon
//   const amazonCategoriesChart = {
//     labels: amazonCategories.map((c) => c.category || c.category_name || "Unknown"),
//     datasets: [
//       {
//         label: "Amazon Products",
//         data: amazonCategories.map((c) => c.count || c.product_count || 0),
//         borderRadius: 8,
//         backgroundColor: "rgba(245, 158, 11, 0.7)",
//       },
//     ],
//   };

//   const amazonRatingsChart = {
//     labels: amazonRatings.map((r) => `${r.rating}★`),
//     datasets: [
//       {
//         label: "Number of Products",
//         data: amazonRatings.map((r) => r.count || 0),
//         backgroundColor: "rgba(59,130,246,0.7)",
//       },
//     ],
//   };

//   const amazonSentimentsChart = {
//     labels: amazonSentiments.map((s) => {
//       const sentiment = s.sentiment || "Unknown";
//       return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
//     }),
//     datasets: [
//       {
//         label: "Sentiment Count",
//         data: amazonSentiments.map((s) => s.count || 0),
//         backgroundColor: [
//           "rgba(34,197,94,0.9)",
//           "rgba(234,179,8,0.9)",
//           "rgba(239,68,68,0.9)",
//         ],
//         borderColor: "rgba(255,255,255,1)",
//         borderWidth: 3,
//         hoverOffset: 15,
//         hoverBorderWidth: 4,
//       },
//     ],
//   };

//   const amazonSalesChart = {
//     labels: amazonSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
//     datasets: [
//       {
//         label: "Daily Sales",
//         data: amazonSalesProducts.map((p) => p.daily_sales || 0),
//         backgroundColor: "rgba(59,130,246,0.8)",
//         borderRadius: 10,
//       },
//     ],
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//       {/* Flipkart Charts */}
//       {flipkartCategories.length > 0 && (
//         <ChartCard 
//           title="Product Category Landscape (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartCategoriesSummary}
//           summaryLoading={flipkartCategoriesLoading}
//         >
//           <Bar data={flipkartCategoriesChart} options={createBarOptions(handleFlipkartCategoryClick)} />
//         </ChartCard>
//       )}

//       {flipkartRatings.length > 0 && (
//         <ChartCard 
//           title="Customer Rating Profile (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartRatingsSummary}
//           summaryLoading={flipkartRatingsLoading}
//         >
//           <Bar data={flipkartRatingsChart} options={createBarOptions(() => {})} />
//         </ChartCard>
//       )}

//       {flipkartSentiments.length > 0 && (
//         <ChartCard 
//           title="Voice of the Customer (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartSentimentsSummary}
//           summaryLoading={flipkartSentimentsLoading}
//         >
//           <Doughnut 
//             data={flipkartSentimentsChart} 
//             options={createDoughnutOptions(handleFlipkartSentimentClick)} 
//           />
//         </ChartCard>
//       )}

//       {flipkartSalesProducts.length > 0 && (
//         <ChartCard 
//           title="High-Velocity Products (Flipkart)" 
//           isLoading={isLoading}
//           summary={flipkartSalesSummary}
//           summaryLoading={flipkartSalesLoading}
//         >
//           <Bar data={flipkartSalesChart} options={createBarOptions(handleFlipkartSalesProductClick)} />
//         </ChartCard>
//       )}

//       {/* Amazon Charts */}
//       {amazonCategories.length > 0 && (
//         <ChartCard 
//           title="Product Category Landscape (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonCategoriesSummary}
//           summaryLoading={amazonCategoriesLoading}
//         >
//           <Bar data={amazonCategoriesChart} options={createBarOptions(handleAmazonCategoryClick)} />
//         </ChartCard>
//       )}

//       {amazonRatings.length > 0 && (
//         <ChartCard 
//           title="Customer Rating Profile (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonRatingsSummary}
//           summaryLoading={amazonRatingsLoading}
//         >
//           <Bar data={amazonRatingsChart} options={createBarOptions(() => {})} />
//         </ChartCard>
//       )}

//       {amazonSentiments.length > 0 && (
//         <ChartCard 
//           title="Voice of the Customer (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonSentimentsSummary}
//           summaryLoading={amazonSentimentsLoading}
//         >
//           <Doughnut 
//             data={amazonSentimentsChart} 
//             options={createDoughnutOptions(handleAmazonSentimentClick)} 
//           />
//         </ChartCard>
//       )}

//       {amazonSalesProducts.length > 0 && (
//         <ChartCard 
//           title="High-Velocity Products (Amazon)" 
//           isLoading={isLoading}
//           summary={amazonSalesSummary}
//           summaryLoading={amazonSalesLoading}
//         >
//           <Bar data={amazonSalesChart} options={createBarOptions(handleAmazonSalesProductClick)} />
//         </ChartCard>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useFilters } from "@/components/dashboard/FiltersContext";
import { useAISummary } from "@/hooks/useAISummary";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  summary?: string;
  summaryLoading?: boolean;
}

function ChartCard({ title, children, isLoading, summary, summaryLoading }: ChartCardProps) {
  const { canAccessFeature, currentTier } = useSubscriptionLimits();
  const hasAISummaries = canAccessFeature('hasChartAISummaries');

  return (
    <Card className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Badge variant="secondary" className="text-xs">
          Live Data
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="chart-container relative h-80 w-full">
          {isLoading ? <Skeleton className="w-full h-full" /> : children}
        </div>
        
        {/* AI Summary Section with Subscription Gates */}
        {hasAISummaries ? (
          summaryLoading ? (
            <div className="mt-3 text-sm text-muted-foreground italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
              Generating Smart summary...
            </div>
          ) : summary ? (
            <div className="mt-3 text-sm font-medium p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{summary}</span>
            </div>
          ) : null
        ) : (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-900">
                  🎯 AI Chart Insights Locked
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {currentTier === 'free' 
                    ? 'Upgrade to Basic for AI-powered chart summaries and deeper insights'
                    : 'Get instant AI analysis of your data patterns'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.location.href = "/subscription"}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade to {currentTier === 'free' ? 'Basic' : 'Premium'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChartsGrid({ selectedSource }: { selectedSource: string }) {
  const BASE_URL = "https://api.insydz.com";
  const { filters } = useFilters();
  const { canAccessFeature } = useSubscriptionLimits();
  const [, setLocation] = useLocation();

  const [flipkartProducts, setFlipkartProducts] = useState<any[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<any[]>([]);
  const [flipkartCategories, setFlipkartCategories] = useState<any[]>([]);
  const [amazonCategories, setAmazonCategories] = useState<any[]>([]);
  const [flipkartRatings, setFlipkartRatings] = useState<any[]>([]);
  const [amazonRatings, setAmazonRatings] = useState<any[]>([]);
  const [flipkartSentiments, setFlipkartSentiments] = useState<any[]>([]);
  const [amazonSentiments, setAmazonSentiments] = useState<any[]>([]);
  const [flipkartSalesProducts, setFlipkartSalesProducts] = useState<any[]>([]);
  const [amazonSalesProducts, setAmazonSalesProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildQueryParams = (table: string) => {
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
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const queryParams = buildQueryParams(table);
        const topN = filters.topN || 10;
        
        if (selectedSource === "both" || table === "both") {
          const flipkartParams = buildQueryParams("rapidapi_flipkart_products");
          const amazonParams = buildQueryParams("rapidapi_amazon_products");
          
          const [
            flipkartRes, amazonRes, flipkartCatRes, amazonCatRes,
            flipkartRatingsRes, amazonRatingsRes, flipkartSentimentRes,
            amazonSentimentRes, flipkartSalesRes, amazonSalesRes,
          ] = await Promise.all([
            fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${flipkartParams}`),
            fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${amazonParams}`),
            fetch(`${BASE_URL}/flipkart/categories?${flipkartParams}`),
            fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${amazonParams}`),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${flipkartParams}`),
            fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${amazonParams}`),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${flipkartParams}`),
            fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${amazonParams}`),
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${flipkartParams}`),
            fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${amazonParams}`),
          ]);

          const [
            flipkartJson, amazonJson, flipkartCatJson, amazonCatJson,
            flipkartRatingsJson, amazonRatingsJson, flipkartSentimentJson,
            amazonSentimentJson, flipkartSalesJson, amazonSalesJson,
          ] = await Promise.all([
            flipkartRes.json(), amazonRes.json(), flipkartCatRes.json(),
            amazonCatRes.json(), flipkartRatingsRes.json(), amazonRatingsRes.json(),
            flipkartSentimentRes.json(), amazonSentimentRes.json(),
            flipkartSalesRes.json(), amazonSalesRes.json(),
          ]);

          setFlipkartProducts(flipkartJson.data || []);
          setAmazonProducts(amazonJson.data || []);
          setFlipkartCategories(flipkartCatJson || []);
          setAmazonCategories(amazonCatJson || []);
          setFlipkartRatings(flipkartRatingsJson || []);
          setAmazonRatings(amazonRatingsJson || []);
          setFlipkartSentiments(flipkartSentimentJson || []);
          setAmazonSentiments(amazonSentimentJson || []);
          setFlipkartSalesProducts(flipkartSalesJson.data || []);
          setAmazonSalesProducts(amazonSalesJson.data || []);
        } else if (table === "rapidapi_amazon_products" || table === "amazon") {
          const [productsRes, categoriesRes, ratingsRes, sentimentRes, salesRes] =
            await Promise.all([
              fetch(`${BASE_URL}/top?table=rapidapi_amazon_products&n=${topN}&${queryParams}`),
              fetch(`${BASE_URL}/rapidapi_amazon_products/categories?${queryParams}`),
              fetch(`${BASE_URL}/rapidapi_amazon_products/ratings?${queryParams}`),
              fetch(`${BASE_URL}/rapidapi_amazon_products/sentiment?${queryParams}`),
              fetch(`${BASE_URL}/rapidapi/top-sales?limit=${topN}&${queryParams}`),
            ]);

          const [productsJson, categoriesJson, ratingsJson, sentimentJson, salesJson] =
            await Promise.all([
              productsRes.json(), categoriesRes.json(), ratingsRes.json(),
              sentimentRes.json(), salesRes.json(),
            ]);

          setFlipkartProducts([]);
          setAmazonProducts(productsJson.data || []);
          setFlipkartCategories([]);
          setAmazonCategories(categoriesJson || []);
          setFlipkartRatings([]);
          setAmazonRatings(ratingsJson || []);
          setFlipkartSentiments([]);
          setAmazonSentiments(sentimentJson || []);
          setFlipkartSalesProducts([]);
          setAmazonSalesProducts(salesJson.data || []);
        } else {
          const [productsRes, categoryRes, ratingsRes, sentimentRes, salesRes] = await Promise.all([
            fetch(`${BASE_URL}/top?table=rapidapi_flipkart_products&n=${topN}&${queryParams}`),
            fetch(`${BASE_URL}/flipkart/categories?${queryParams}`),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/ratings?${queryParams}`),
            fetch(`${BASE_URL}/rapidapi_flipkart_products/sentiment?${queryParams}`),
            fetch(`${BASE_URL}/rapidapi/flipkart/top-sales?limit=${topN}&${queryParams}`),
          ]);

          const [productsJson, categoryJson, ratingsJson, sentimentJson, salesJson] = await Promise.all([
            productsRes.json(), categoryRes.json(), ratingsRes.json(),
            sentimentRes.json(), salesRes.json(),
          ]);

          setFlipkartProducts(productsJson.data || []);
          setAmazonProducts([]);
          setFlipkartCategories(categoryJson || []);
          setAmazonCategories([]);
          setFlipkartRatings(ratingsJson || []);
          setAmazonRatings([]);
          setFlipkartSentiments(sentimentJson || []);
          setAmazonSentiments([]);
          setFlipkartSalesProducts(salesJson.data || []);
          setAmazonSalesProducts([]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [selectedSource, filters]);

  // 🔹 AI Summaries - Only fetch if user has access
  const hasAISummaries = canAccessFeature('hasChartAISummaries');

  const { summary: flipkartCategoriesSummary, loading: flipkartCategoriesLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Flipkart category distribution" : "", 
      "rapidapi_flipkart_products", 
      flipkartCategories, 
      flipkartCategories.length, 
      filters
    );

  const { summary: flipkartRatingsSummary, loading: flipkartRatingsLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Flipkart rating distribution" : "", 
      "rapidapi_flipkart_products", 
      flipkartRatings, 
      flipkartRatings.length, 
      filters
    );

  const { summary: flipkartSentimentsSummary, loading: flipkartSentimentsLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Flipkart sentiment distribution" : "", 
      "rapidapi_flipkart_products", 
      flipkartSentiments, 
      flipkartSentiments.length, 
      filters
    );

  const { summary: flipkartSalesSummary, loading: flipkartSalesLoading } =
    useAISummary(
      hasAISummaries ? "Summarize top selling Flipkart products by daily sales volume" : "", 
      "rapidapi_flipkart_products", 
      flipkartSalesProducts, 
      flipkartSalesProducts.length, 
      filters
    );

  const { summary: amazonCategoriesSummary, loading: amazonCategoriesLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Amazon category distribution" : "", 
      "rapidapi_amazon_products", 
      amazonCategories, 
      amazonCategories.length, 
      filters
    );

  const { summary: amazonRatingsSummary, loading: amazonRatingsLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Amazon rating distribution" : "", 
      "rapidapi_amazon_products", 
      amazonRatings, 
      amazonRatings.length, 
      filters
    );

  const { summary: amazonSentimentsSummary, loading: amazonSentimentsLoading } =
    useAISummary(
      hasAISummaries ? "Summarize Amazon sentiment distribution" : "", 
      "rapidapi_amazon_products", 
      amazonSentiments, 
      amazonSentiments.length, 
      filters
    );

  const { summary: amazonSalesSummary, loading: amazonSalesLoading } =
    useAISummary(
      hasAISummaries ? "Summarize top selling Amazon products by daily sales volume" : "", 
      "rapidapi_amazon_products", 
      amazonSalesProducts, 
      amazonSalesProducts.length, 
      filters
    );

  // Click handlers and chart options remain the same...
  const handleFlipkartCategoryClick = (index: number) => {
    const category = flipkartCategories[index];
    if (category && (category.category || category.category_name)) {
      const categoryName = encodeURIComponent(category.category || category.category_name);
      setLocation(`/category-products/flipkart/${categoryName}?page=1&from=dashboard`);
    }
  };

  const handleAmazonCategoryClick = (index: number) => {
    const category = amazonCategories[index];
    if (category && (category.category || category.category_name)) {
      const categoryName = encodeURIComponent(category.category || category.category_name);
      setLocation(`/category-products/amazon/${categoryName}?page=1&from=dashboard`);
    }
  };

  const handleFlipkartSalesProductClick = (index: number) => {
    const product = flipkartSalesProducts[index];
    if (product && product.product_title) {
      const productName = encodeURIComponent(product.product_title);
      setLocation(`/product/${productName}?from=dashboard&source=flipkart`);
    }
  };

  const handleAmazonSalesProductClick = (index: number) => {
    const product = amazonSalesProducts[index];
    if (product && product.product_title) {
      const productName = encodeURIComponent(product.product_title);
      setLocation(`/product/${productName}?from=dashboard&source=amazon`);
    }
  };

  const handleFlipkartSentimentClick = (index: number) => {
    const sentiment = flipkartSentiments[index];
    if (sentiment && sentiment.sentiment) {
      const sentimentType = sentiment.sentiment.toLowerCase();
      let url = `/sentiment-products/flipkart/${sentimentType}`;
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
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      setLocation(url);
    }
  };

  const handleAmazonSentimentClick = (index: number) => {
    const sentiment = amazonSentiments[index];
    if (sentiment && sentiment.sentiment) {
      const sentimentType = sentiment.sentiment.toLowerCase();
      let url = `/sentiment-products/amazon/${sentimentType}`;
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
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      setLocation(url);
    }
  };

  const createBarOptions = (clickHandler: (index: number) => void) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, position: "bottom" as const },
      tooltip: {
        callbacks: {
          afterLabel: () => "Click to view details"
        }
      }
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        clickHandler(index);
      }
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    }
  });

  const createDoughnutOptions = (clickHandler: (index: number) => void) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true, 
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} products`;
          },
          afterLabel: () => "👆 Click to view products"
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        }
      }
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        clickHandler(index);
      }
    },
    onHover: (event: any, elements: any[]) => {
      const canvas = event.native?.target;
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  });

  const truncateName = (name: string) => {
    const cleaned = name.replace(/"/g, "");
    return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
  };

  // Chart data configurations
  const flipkartCategoriesChart = {
    labels: flipkartCategories.map((c) => c.category || c.category_name || "Unknown"),
    datasets: [{
      label: "Flipkart Products",
      data: flipkartCategories.map((c) => c.count || 0),
      backgroundColor: "hsl(142,76%,36%)",
      borderRadius: 8,
    }],
  };

  const flipkartRatingsChart = {
    labels: flipkartRatings.map((r) => `${r.rating}★`),
    datasets: [{
      label: "Number of Products",
      data: flipkartRatings.map((r) => r.count || 0),
      backgroundColor: "rgba(34,197,94,0.7)",
    }],
  };

  const flipkartSentimentsChart = {
    labels: flipkartSentiments.map((s) => {
      const sentiment = s.sentiment || "Unknown";
      return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    }),
    datasets: [{
      label: "Sentiment Count",
      data: flipkartSentiments.map((s) => s.count || 0),
      backgroundColor: ["rgba(34,197,94,0.9)", "rgba(234,179,8,0.9)", "rgba(239,68,68,0.9)"],
      borderColor: "rgba(255,255,255,1)",
      borderWidth: 3,
      hoverOffset: 15,
      hoverBorderWidth: 4,
    }],
  };

  const flipkartSalesChart = {
    labels: flipkartSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
    datasets: [{
      label: "Daily Sales",
      data: flipkartSalesProducts.map((p) => p.daily_sales || 0),
      backgroundColor: "rgba(34,197,94,0.8)",
      borderRadius: 10,
    }],
  };

  const amazonCategoriesChart = {
    labels: amazonCategories.map((c) => c.category || c.category_name || "Unknown"),
    datasets: [{
      label: "Amazon Products",
      data: amazonCategories.map((c) => c.count || c.product_count || 0),
      borderRadius: 8,
      backgroundColor: "rgba(245, 158, 11, 0.7)",
    }],
  };

  const amazonRatingsChart = {
    labels: amazonRatings.map((r) => `${r.rating}★`),
    datasets: [{
      label: "Number of Products",
      data: amazonRatings.map((r) => r.count || 0),
      backgroundColor: "rgba(59,130,246,0.7)",
    }],
  };

  const amazonSentimentsChart = {
    labels: amazonSentiments.map((s) => {
      const sentiment = s.sentiment || "Unknown";
      return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    }),
    datasets: [{
      label: "Sentiment Count",
      data: amazonSentiments.map((s) => s.count || 0),
      backgroundColor: ["rgba(34,197,94,0.9)", "rgba(234,179,8,0.9)", "rgba(239,68,68,0.9)"],
      borderColor: "rgba(255,255,255,1)",
      borderWidth: 3,
      hoverOffset: 15,
      hoverBorderWidth: 4,
    }],
  };

  const amazonSalesChart = {
    labels: amazonSalesProducts.map((p) => truncateName(p.product_title || "Unknown")),
    datasets: [{
      label: "Daily Sales",
      data: amazonSalesProducts.map((p) => p.daily_sales || 0),
      backgroundColor: "rgba(59,130,246,0.8)",
      borderRadius: 10,
    }],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Flipkart Charts */}
      {flipkartCategories.length > 0 && (
        <ChartCard 
          title="Product Category Landscape (Flipkart)" 
          isLoading={isLoading}
          summary={flipkartCategoriesSummary}
          summaryLoading={flipkartCategoriesLoading}
        >
          <Bar data={flipkartCategoriesChart} options={createBarOptions(handleFlipkartCategoryClick)} />
        </ChartCard>
      )}

      {flipkartRatings.length > 0 && (
        <ChartCard 
          title="Customer Rating Profile (Flipkart)" 
          isLoading={isLoading}
          summary={flipkartRatingsSummary}
          summaryLoading={flipkartRatingsLoading}
        >
          <Bar data={flipkartRatingsChart} options={createBarOptions(() => {})} />
        </ChartCard>
      )}

      {flipkartSentiments.length > 0 && (
        <ChartCard 
          title="Voice of the Customer (Flipkart)" 
          isLoading={isLoading}
          summary={flipkartSentimentsSummary}
          summaryLoading={flipkartSentimentsLoading}
        >
          <Doughnut 
            data={flipkartSentimentsChart} 
            options={createDoughnutOptions(handleFlipkartSentimentClick)} 
          />
        </ChartCard>
      )}

      {flipkartSalesProducts.length > 0 && (
        <ChartCard 
          title="High-Velocity Products (Flipkart)" 
          isLoading={isLoading}
          summary={flipkartSalesSummary}
          summaryLoading={flipkartSalesLoading}
        >
          <Bar data={flipkartSalesChart} options={createBarOptions(handleFlipkartSalesProductClick)} />
        </ChartCard>
      )}

      {/* Amazon Charts */}
      {amazonCategories.length > 0 && (
        <ChartCard 
          title="Product Category Landscape (Amazon)" 
          isLoading={isLoading}
          summary={amazonCategoriesSummary}
          summaryLoading={amazonCategoriesLoading}
        >
          <Bar data={amazonCategoriesChart} options={createBarOptions(handleAmazonCategoryClick)} />
        </ChartCard>
      )}

      {amazonRatings.length > 0 && (
        <ChartCard 
          title="Customer Rating Profile (Amazon)" 
          isLoading={isLoading}
          summary={amazonRatingsSummary}
          summaryLoading={amazonRatingsLoading}
        >
          <Bar data={amazonRatingsChart} options={createBarOptions(() => {})} />
        </ChartCard>
      )}

      {amazonSentiments.length > 0 && (
        <ChartCard 
          title="Voice of the Customer (Amazon)" 
          isLoading={isLoading}
          summary={amazonSentimentsSummary}
          summaryLoading={amazonSentimentsLoading}
        >
          <Doughnut 
            data={amazonSentimentsChart} 
            options={createDoughnutOptions(handleAmazonSentimentClick)} 
          />
        </ChartCard>
      )}

      {amazonSalesProducts.length > 0 && (
        <ChartCard 
          title="High-Velocity Products (Amazon)" 
          isLoading={isLoading}
          summary={amazonSalesSummary}
          summaryLoading={amazonSalesLoading}
        >
          <Bar data={amazonSalesChart} options={createBarOptions(handleAmazonSalesProductClick)} />
        </ChartCard>
      )}
    </div>
  );
}