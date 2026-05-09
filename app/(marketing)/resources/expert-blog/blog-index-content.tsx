"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  MessageCircle,
  Package,
  Trophy,
  Zap,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Store,
  Briefcase,
  Users,
  Bell,
  Code,
  Globe,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  LayoutGrid,
  Flame,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";





// Types
type BlogCategory =
  | "All Articles"
  | "Competitor Tracking"
  | "Seller Tools & Strategy"
  | "The Complete Guide for Sellers (2026)"
  | "SEO & Keyword Intelligence"
  | "Pricing + Compare"
  | "Flipkart SEO & Seller Strategy"
  | "Flipkart Seller Tools & Strategy"
  | "Review Intelligence Pillar"
  | "D2C Growth & Brand Intelligence"
  | "Tool Comparison & Reviews"
  | "Product Research"
  | "Pricing Strategy"
  | "Amazon & Flipkart SEO"
  | "Review Intelligence"
  | "Festive Trends"
  | "Case Studies"
  | "Platform Updates";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  image: string;
  route: string;
  featured?: boolean;
  popular?: boolean;
};

// Sample articles data
const articles: Article[] = [
  {
    id: "15",
    title: "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost?",
    excerpt: "Learn the flat fee per ASIN, enrollment criteria, and strategic benefits of Amazon Vine India in 2026. Get 30 verified reviews and boost your launch velocity.",
    category: "Seller Tools & Strategy",
    readTime: "11 min read",
    image: "/manual_vs_automated.png",
    route: "/resources/expert-blog/amazon-vine-program-india-2026",
    popular: true
  },
  {
    id: "14",
    title: "Insydz vs SellerApp: Which Amazon Seller Tool Actually Works for the Indian Market?",
    excerpt: "A practitioner's comparison for ₹5L–50L/month Indian sellers — INR pricing vs USD billing, Flipkart-native vs Amazon-only. Read before you commit.",
    category: "Tool Comparison & Reviews",
    readTime: "10 min read",
    image: "/insydz-vs-sellerapp-hero.png",
    route: "/resources/expert-blog/insydz-vs-sellerapp-india",
    featured: true,
    popular: true
  },
  {
    id: "13",
    title: "Analyze Amazon Reviews Tool: The Complete Guide for Indian Sellers (2026)",
    excerpt: "AI-powered Amazon review analysis for Indian D2C sellers — sentiment clustering, Hinglish support, RTO signals, and WhatsApp alerts.",
    category: "Review Intelligence",
    readTime: "12 min read",
    image: "/amazon-review-analysis-hero.png",
    route: "/resources/expert-blog/amazon-review-analysis-guide-india",
    popular: true
  },
  {
    id: "12",
    title: "Manual vs Automated Competitor Tracking: What Works in 2026?",
    excerpt: "Indian ecommerce sellers spend 3–5 hours daily tracking competitor prices in Excel — and still react 24 hours too late.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/manual_vs_automated.png", // ✅ only this article has the image
    // image: "/manual-vs-automated-hero.png", // ✅ only this article has the image
    route: "/resources/expert-blog/manual-vs-automated-competitor-tracking-tool",
    popular: true
  },
  {
    id: "11",
    title: "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
    excerpt: "Most Indian sellers are bleeding margin by choosing the wrong platform without running the numbers first. See how successful D2C brands evaluate fees, traffic, and competition data to decide where every rupee of inventory should go.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/amazon-vs-flipkart-hero-metrics.png", // ✅ only this article has the image
    route: "/resources/expert-blog/amazon-vs-flipkart-india-seller",
    popular: true
  },
  {
    id: "10",
    title: "Flipkart Keyword Research Tool & SEO Optimization Guide for Sellers (2026)",
    excerpt: "Your listings are invisible to lakhs of Flipkart shoppers because you're targeting the wrong keywords. Discover how India's top Flipkart sellers use AI-powered keyword research to dominate search rankings and multiply their organic traffic.",
    category: "Flipkart SEO & Seller Strategy",
    readTime: "9 min read",
    image: "/01_hero_banner.png",
    route: "/resources/expert-blog/flipkart-keyword-research-tool"
  },
  {
    id: "9",
    title: "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
    excerpt: "Stop flying blind on Flipkart. The right analytics tool surfaces which competitor keywords are stealing your rank, which SKUs are losing the Buy Box.",
    // and exactly what to fix before the next Big Billion Days window closes on you.",
    category: "Flipkart Seller Tools & Strategy",
    readTime: "9 min read",
    image: "/flipkart-analytics.png",
    route: "/resources/expert-blog/best-flipkart-analytics-tool"
  },
  {
    id: "7",
    title: "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
    excerpt: "Your customers are telling you exactly what to fix and why they're switching to a competitor inside every review.",
    // Discover how India's top D2C brands use AI review intelligence to reduce returns and grow revenue.",
    category: "D2C Growth & Brand Intelligence",
    readTime: "14 min read",
    image: "/review-analysis-hero (1).png",
    route: "/resources/expert-blog/review-analysis-guide-india",
  },
  {
    id: "8",
    title: "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
    excerpt: "Find buyer-intent keywords your competitors are ranking for on Amazon.in and win the search result before they know you're there.", 
    // India's definitive guide to keyword gap analysis, search volume tracking, and rank monitoring.",
    category: "Seller Tools & Strategy",
    readTime: "6 min read",
    image: "/keyword-research-hero.png",
    route: "/resources/expert-blog/best-amazon-keyword-research-tool-india",
  },
  {
    id: "1",
    title: "Amazon Competitor Price Tracking Tool India: Complete Guide for Sellers (2026)",
    excerpt: "Track competitor prices on Amazon.in, Flipkart in real time. Discover how Indian sellers use AI-powered tools to protect margins.",
    // , win the Buy Box, and outsell rivals with a complete 2026 playbook.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/one.png", // ✅ only this article has the image
    route: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
    featured: true,
    popular: true
  },
  {
    id: "2",
    title: "Amazon SEO Tool India: Keyword Research & Rank Tracking Guide for Sellers (2026)",
    excerpt: "Discover how an Amazon SEO tool built for India helps sellers rank higher, find buying keywords, and grow sales on Amazon.in.",
    // with India-specific keyword data, daily rank tracking, and AI-powered listing recommendations.",
    category: "SEO & Keyword Intelligence",
    readTime: "12 min read",
    image: "/Amazon_SEO_Tool-Blog3_image1.png",
    route: "/resources/expert-blog/amazon-seo-tool-india",
    popular: true
  },
  {
    id: "3",
    title: "How to Rank on Page 1 of Amazon India: The Complete Guide for Sellers (2026)",
    excerpt: "Learn exactly how to rank on page 1 of Amazon India using the A9 algorithm, keyword optimization & competitor intelligence.",
    // An actionable 4-phase guide for Indian sellers.",
    category: "The Complete Guide for Sellers (2026)",
    readTime: "15 min read",
    image: "/twenty three.png",
    route: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
    popular: true
  },
  {
    id: "4",
    title: "Best Competitor Price Tracking Tools for Indian Sellers: The 2026 Guide",
    excerpt: "Your competitors are repricing in real time while you're still checking prices manually — and losing the Buy Box because of it. See how India's smartest marketplace sellers use automated price intelligence across Amazon, Flipkart, and Meesho to protect margin and win more sales.",
    category: "Tool Comparison & Reviews",
    readTime: "10 min read",
    image: "/Best_Price_Tracer-blog2_image1.png?v=1",
    route: "/resources/expert-blog/best-competitor-price-tracking-tools-india",
    popular: true
  },
  {
    id: "5",
    title: "Insydz vs Helium 10: Which is the Right Amazon Intelligence Tool for Indian Sellers?",
    excerpt: "Helium 10 was built for Amazon US — not for the way Indian marketplaces actually work. Find out why thousands of Indian sellers are switching to a tool built specifically for Amazon India, Flipkart, and Meesho.",
    category: "Pricing + Compare",
    readTime: "7 min read",
    image: "/thirteen.png",
    route: "/resources/expert-blog/insydz-vs-helium-10-india",
  },
  {
    id: "6",
    title: "AI Review Intelligence Tool for Amazon & Flipkart Sellers: The Complete Guide (2026)",
    excerpt: "Your customers are already telling you exactly what's broken and why they're switching to a competitor — inside every review. Learn how India's fastest-growing D2C brands use AI review analysis to cut returns, fix listings, and grow revenue.",
    category: "Review Intelligence Pillar",
    readTime: "11 min read",
    image: "/eighteen.png",
    route: "/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
  },
  // {
  //   id: "9",
  //   title: "Competitor Price Tracking: Advanced Tactics for Market Leaders",
  //   excerpt: "Go beyond basic monitoring. Learn how to predict competitor moves and automate pricing responses in real-time.",
  //   category: "Competitor Tracking",
  //   readTime: "9 min read",
  //   image: "",
  //   route: "/resources/blog/amazon-buy-box"
  // }
];

// Problem blocks data
const problemBlocks = [
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Losing Buy Box?",
    description: "Read competitor tracking guides",
    category: "Competitor Tracking" as BlogCategory,
    link: "/features/competitor-price-tracking-feature",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Not Ranking on Amazon?",
    description: "Explore SEO strategies",
    category: "Amazon & Flipkart SEO" as BlogCategory,
    link: "/use-cases/improve-seo",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Unsure What to Sell?",
    description: "Discover product research insights",
    category: "Product Research" as BlogCategory,
    link: "/features/product-research-feature",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Price Wars Hurting Margins?",
    description: "Learn smart pricing tactics",
    category: "Pricing Strategy" as BlogCategory,
    link: "/features/price-optimization-feature",
    color: "from-green-500 to-emerald-500"
  }
];

const ARTICLES_PER_PAGE = 9;

export default function ExpertBlog() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("All Articles");

  // Read initial page from URL query param
  const getPageFromUrl = (): number => {
    if (typeof window === 'undefined') return 1;
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1', 10);
    return isNaN(page) || page < 1 ? 1 : page;
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl);


  const categories: BlogCategory[] = [
    "All Articles",
    "Competitor Tracking",
    "Product Research",
    "Pricing Strategy",
    "Amazon & Flipkart SEO",
    "Review Intelligence",
    "Festive Trends",
    "Case Studies",
    "Platform Updates"
  ];

  const filteredArticles = selectedCategory === "All Articles"
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticle = articles.find(a => a.featured);
  const popularArticles = articles.filter(a => a.popular).slice(0, 4);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const latestArticles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Update URL with page query param (pushState so back button works)
    const url = new URL(window.location.href);
    if (page === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', String(page));
    }
    window.history.pushState({}, '', url.toString());
    // Scroll to the Latest Insights section
    const section = document.getElementById('latest-insights-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handleCategoryClick = (category: BlogCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when category changes
    // Clear page param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    window.history.replaceState({}, '', url.toString());
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };



  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Zap className="w-4 h-4" />
              <span>E-commerce Intelligence Hub</span>
            </div> */}

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                E-commerce Intelligence &
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Seller Growth Insights
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-3xl mx-auto">
              Actionable strategies, data-backed guides, and marketplace insights for Amazon and Flipkart sellers in India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* <Button
                onClick={() => router.push('/login')}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Free with Insydz
              </Button> */}

              <Button
                onClick={() => window.scrollTo({ top: 1670, behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:text-white"
              >
                Browse Topics
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="sticky top-0 z-40 bg-background opacity-100 dark:bg-gray-950/95 backdrop-blur-none border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto scrollbar-hide">
            {/* <div className="flex gap-2 py-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div> */}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED ARTICLE ===================== */}
      {featuredArticle && selectedCategory === "All Articles" && (
        <section className="py-10 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Insight</h2>
            </div>
            <div onClick={() => router.push(featuredArticle.route)} className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="grid md:grid-cols-2 gap-0 md:h-[500px]">

                {/* Featured image */}
                <div className="blog-card-thumb h-full">
                  {featuredArticle.image ? (
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                    />
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <BarChart3 className="w-32 h-32 text-orange-300 dark:text-orange-900 opacity-20" />
                    </div>
                  )}
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 w-fit">
                    {featuredArticle.category}
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{featuredArticle.readTime}</span>
                    </div>

                    <Button
                      onClick={() => router.push(featuredArticle.route)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full group"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== POPULAR ARTICLES ===================== */}
      {selectedCategory === "All Articles" && (
        <section className="py-14 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Most Read by Indian Sellers</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularArticles.map((article) => (
                <Link key={article.id} href={article.route}>
                  <div
                    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                  >
                    {/* Popular card image — standardized ratio */}
                    <div className="blog-card-thumb relative">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                        />
                      ) : (
                        <div className="flex items-center justify-center p-4">
                          <BarChart3 className="w-20 h-20 text-orange-200 dark:text-orange-900 opacity-30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors flex-grow">
                        {article.title}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 mt-auto">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== LATEST ARTICLES GRID ===================== */}
      <section id="latest-insights-section" className="py-10 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === "All Articles" ? "Latest Insights" : selectedCategory}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <Link key={article.id} href={article.route}>
                <div
                  className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                >
                  {/* Latest grid image — standardized ratio */}
                  <div className="blog-card-thumb relative">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                      />
                    ) : (
                      <div className="flex items-center justify-center p-4">
                        <BarChart3 className="w-24 h-24 text-orange-200 dark:text-orange-900 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">

                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{article.readTime}</span>
                      </div>

                      <div className="flex items-center text-orange-600 dark:text-orange-500 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ===================== PAGINATION ===================== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  currentPage === 1
                    ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, idx) => (
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-500 scale-105'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer bg-gray-50 dark:bg-gray-900'
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Problem-Based Content Block */}
      {selectedCategory === "All Articles" && (
        <section className="py-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Solve a Seller Problem
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Jump straight to the insights you need for your specific challenge
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {problemBlocks.map((block, index) => (
                <button
                  key={index}
                  onClick={() => router.push(block.link)}
                  className="group bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2 text-left"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${block.color} rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg`}>
                    {block.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {block.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {block.description}
                  </p>

                  <div className="flex items-center text-orange-600 dark:text-orange-500 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Plan CTA */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Learn. Apply. Grow.
          </h2>

          <p className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Lora', serif" }}>
            Every strategy you read here can be tested inside Insydz using your real product data. Connect your marketplace today.
          </p>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px 24px", marginBottom: 32 }}>
            {["Free forever plan", "No credit card", "Results in 5 min"].map(t => (
              <div key={t} className="text-blue-50 font-medium" style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Sora', sans-serif" }}>
                <span className="bg-background opacity-100 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-white" /></span> {t}
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-7 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 border-none"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started Free →
          </Button>

          <p className="text-sm text-blue-200 mt-6 font-medium" style={{ fontFamily: "'Sora', sans-serif" }}>
            Live in 30 min · No setup needed · No card required
          </p>
        </div>
      </section>

      {/* Footer */}
      

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .blog-card-thumb { position: relative; width:100%; aspect-ratio:2.4 / 1; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .blog-card-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
      `}</style>
    </div>
  );
}





