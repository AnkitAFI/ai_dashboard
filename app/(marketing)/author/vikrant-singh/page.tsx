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
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
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




// Define types for menu items
type MenuItemWithBadge = {
  name: string;
  icon: JSX.Element;
  badge?: string;
  route?: string;
};

type NavigationMenu = {
  Solutions: MenuItemWithBadge[];
  "Use Cases": MenuItemWithBadge[];
  Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[];
  Resources: MenuItemWithBadge[];
  Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[];
  About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <DollarSign className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <DollarSign className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

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
    id: "12",
    title: "Manual vs Automated Competitor Tracking: What Works in 2026?",
    excerpt: "Indian ecommerce sellers spend 3–5 hours daily tracking competitor prices in Excel — and still react 24 hours too late.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/manual_vs_automated.png",
    route: "/resources/expert-blog/manual-vs-automated-competitor-tracking-tool",
    featured: true,
    popular: true
  },
  {
    id: "11",
    title: "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
    excerpt: "Most Indian sellers are bleeding margin by choosing the wrong platform without running the numbers first. See how successful D2C brands evaluate fees, traffic, and competition data to decide where every rupee of inventory should go.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/amazon-vs-flipkart-hero-metrics.png",
    route: "/resources/expert-blog/amazon-vs-flipkart-india-seller",
    featured: true,
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
    category: "Flipkart Seller Tools & Strategy",
    readTime: "9 min read",
    image: "/flipkart-analytics.png",
    route: "/resources/expert-blog/best-flipkart-analytics-tool"
  },
  {
    id: "7",
    title: "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
    excerpt: "Your customers are telling you exactly what to fix and why they're switching to a competitor inside every review.",
    category: "D2C Growth & Brand Intelligence",
    readTime: "14 min read",
    image: "/review-analysis-hero (1).png",
    route: "/resources/expert-blog/review-analysis-guide-india",
  },
  {
    id: "8",
    title: "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
    excerpt: "Find buyer-intent keywords your competitors are ranking for on Amazon.in and win the search result before they know you're there.",
    category: "Seller Tools & Strategy",
    readTime: "6 min read",
    image: "/keyword-research-hero.png",
    route: "/resources/expert-blog/best-amazon-keyword-research-tool-india",
  },
  {
    id: "1",
    title: "Amazon Competitor Price Tracking Tool India: Complete Guide for Sellers (2026)",
    excerpt: "Track competitor prices on Amazon.in, Flipkart in real time. Discover how Indian sellers use AI-powered tools to protect margins.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/one.png",
    route: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
    featured: true,
    popular: true
  },
  {
    id: "2",
    title: "Amazon SEO Tool India: Keyword Research & Rank Tracking Guide for Sellers (2026)",
    excerpt: "Discover how an Amazon SEO tool built for India helps sellers rank higher, find buying keywords, and grow sales on Amazon.in.",
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
];

export default function VikrantSinghAuthorPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      

      

      {/* Author Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <img
                src="/vikrant-singh-author.png"
                alt="Professional portrait of Vikrant Singh sitting at a desk in a modern office."
                className="h-40 w-40 sm:h-44 sm:w-44 rounded-full object-cover shadow-xl ring-4 ring-white dark:ring-gray-800"
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm border border-orange-200 dark:border-orange-900">
              <Users className="w-4 h-4" />
              <span>Author Profile</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Vikrant Singh
              </span>
            </h1>

            <p className="text-xl font-medium text-orange-600 dark:text-orange-500 mb-6">
              Expert E-commerce Strategist at Insydz
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
              Vikrant writes extensively about Amazon and Flipkart SEO, competitor intelligence, and scaling D2C brands in India. His insights help Indian sellers optimize pricing, uncover high-intent keywords, and dominate the buy box.
            </p>

            <div className="flex justify-center items-center gap-4">
               <a 
                 href="https://www.linkedin.com/in/singhvikrant?utm_source=share_via&utm_content=profile&utm_medium=member_ios" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-3 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                 <Linkedin className="w-5 h-5" />
               </a>
               <a 
                 href="https://x.com/vsingh_afi" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-3 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-full text-gray-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all"
                >
                 <Twitter className="w-5 h-5" />
               </a>
            </div>
            
          </div>
        </div>
      </section>

      {/* Articles by Author */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Articles by Vikrant
            </h2>
            <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">
              {articles.length} Posts
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={article.route}>
                <div
                  className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                >
                  <div className="w-100 aspect-[2.4/1] overflow-hidden bg-[#0A0F1A] flex items-center justify-center">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center p-4">
                        <BarChart3 className="w-24 h-24 text-orange-200 dark:text-orange-900 opacity-30" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      {article.category}
                    </div>

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

                      <Link href={article.route}>
                        <div className="flex items-center text-orange-600 dark:text-orange-500 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                          <span>Read More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
}

