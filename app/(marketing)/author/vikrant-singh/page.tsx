"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  BarChart3,
  Users,
  Twitter,
  Linkedin,
} from "lucide-react";

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
    id: "28",
    title: "Amazon India Repricing Strategy 2026",
    excerpt:
      "In competitive categories on Amazon India, your Buy Box is won or lost multiple times a day. Sellers who reprice manually, or not at all, are giving it away. This is the 2026 playbook for margin-safe, rule-based repricing that holds your position without racing to the bottom.",
    category: "Pricing Strategy",
    readTime: "12 min read",
    image: "/amazon-repricing-strategy-india-image0.png",
    route: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
    popular: true,
  },
  {
    id: "27",
    title: "Analyze Amazon Reviews India Content",
    excerpt:
      "Amazon reviews are goldmines of information. Discover how to analyze Amazon reviews in India to find hidden patterns and improve your product. Learn the best practices for sentiment analysis, theme extraction, and product improvement.",
    category: "Review Intelligence Pillar",
    readTime: "12 min read",
    image: "/Analyze 500+ Reviews for Product Opportunities.png",
    route: "/resources/expert-blog/analyze-amazon-reviews-india-content",
    popular: true,
  },
  {
    id: "26",
    title: "Switch From Excel to SellerApp",
    excerpt:
      "Use this step-by-step template to migrate from Excel to SellerApp in under 30 minutes. Automate keyword tracking, competitor monitoring, and listing analytics.",
    category: "Seller Tools & Strategy",
    readTime: "10 min read",
    image: "/Excel to AI Competitor Tracker on Amazon India_ 30 Days.png",
    route: "/resources/expert-blog/switch-excel-ai-amazon-india",
    popular: true,
  },
  {
    id: "25",
    title: "Top Amazon India Sellers Habits",
    excerpt:
      "Discover the habits, strategies, and daily practices followed by top Amazon India sellers to increase rankings, improve conversions, and build sustainable ecommerce businesses.",
    category: "Seller Tools & Strategy",
    readTime: "11 min read",
    image: "/Habits of Top Amazon India Sellers.png",
    route: "/resources/expert-blog/top-amazon-india-sellers-habits",
    popular: true,
  },
  {
    id: "24",
    title: "Prime Day India 2026: Seller Questions Answered",
    excerpt:
      "Prime Day 2026 lasts 48 hours. The sellers who win it spend 6 to 8 weeks preparing. The sellers who lose it start the week before. This guide covers everything you need to do right now.",
    category: "Festive Trends",
    readTime: "13 min read",
    image: "/prime-day-india-2026-seller-questions.png",
    route: "/resources/expert-blog/prime-day-india-2026-seller-questions",
    popular: true,
  },
  {
    id: "23",
    title: "Negative Reviews Impact Amazon India Sales",
    excerpt:
      "Negative Amazon reviews are killing your sales—and you’re probably responding the wrong way. Learn how to convert 1-star complaints into more revenue.",
    category: "Review Intelligence",
    readTime: "11 min read",
    image: "/How Negative Reviews Are Killing Your Amazon India Sales.png",
    route: "/resources/expert-blog/negative-reviews-amazon-india",
    popular: true,
  },
  {
    id: "22",
    title: "Amazon Listing Not Ranking in India? Fix It in 2026",
    excerpt:
      "Your Amazon India listing is live but not ranking? Learn the real reasons products fail to rank and the practical fixes that improve visibility in 2026.",
    category: "SEO & Keyword Intelligence",
    readTime: "12 min read",
    image: "/Amazon India Listing Not Ranking.png",
    route: "/resources/expert-blog/amazon-listing-not-ranking-india",
    popular: true,
  },
  {
    id: "21",
    title: "Find Competitor Keywords Amazon India",
    excerpt:
      "Discover exactly which keywords your Amazon India competitors rank for and use that gap to outrank them in 2026. Reverse ASIN research made practical.",
    category: "Seller Tools & Strategy",
    readTime: "12 min read",
    image: "/How to Find Competitor Keywords.png",
    route: "/resources/expert-blog/find-competitor-keywords-amazon-india",
    popular: true,
  },
  {
    id: "20",
    title: "Amazon Zero Referral Fee India",
    excerpt:
      "Learn how zero-fee on Amazon India can help sellers save up to ₹50,000/month, improve profitability, increase visibility, and maintain competitive pricing—and if it’s the right move for your brand.",
    category: "Pricing Strategy",
    readTime: "12 min read",
    image: "/Amazon India Zero Referral Fee.png",
    route: "/resources/expert-blog/amazon-zero-referral-fee",
    popular: true,
  },
  {
    id: "19",
    title: "Competitor Undercutting on Amazon India",
    excerpt:
      "Learn why your Amazon sales might drop and how to recover them in 2026. From product research to sourcing and building a D2C brand.",
    category: "Seller Tools & Strategy",
    readTime: "12 min read",
    image: "/Detect Competitor Price Undercutting on Amazon India.png",
    route: "/resources/expert-blog/competitor-undercutting-amazon-india",
    popular: true,
  },
  {
    id: "18",
    title: "Amazon Sales Drop in 2026: The Complete Guide",
    excerpt:
      "Learn why your Amazon sales might drop and how to recover them in 2026. From product research to sourcing and building a D2C brand.",
    category: "Seller Tools & Strategy",
    readTime: "12 min read",
    image: "/Amazon India Sales Drop.png",
    route: "/resources/expert-blog/amazon-sales-drop",
    popular: true,
  },
  {
    id: "17",
    title: "Flipkart Seller Analytics Tool India: The Complete Guide (2026)",
    excerpt:
      "Learn how to use Flipkart Seller Analytics Tools in India to grow your business, track competitors, and improve your ranking in 2026.",
    category: "Flipkart Seller Tools & Strategy",
    readTime: "12 min read",
    image: "/Flipkart Analytics Tool.png",
    route: "/resources/expert-blog/best-flipkart-analytics-tool",
    popular: true,
  },
  {
    id: "16",
    title:
      "Amazon Private Label Guide for Indian Sellers in 2026: The Complete Guide",
    excerpt:
      "Learn how to start and scale an Amazon Private Label business in India in 2026. From product research to sourcing and building a D2C brand.",
    category: "Seller Tools & Strategy",
    readTime: "12 min read",
    image: "/private label on amazon india.png",
    route: "/resources/expert-blog/amazon-private-label-india-2026",
    popular: true,
  },
  {
    id: "15",
    title:
      "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost?",
    excerpt:
      "Learn the flat fee per ASIN, enrollment criteria, and strategic benefits of Amazon Vine India in 2026. Get 30 verified reviews and boost your launch velocity.",
    category: "Seller Tools & Strategy",
    readTime: "11 min read",
    image: "/Amazon Vine Program India.png",
    route: "/resources/expert-blog/amazon-vine-program-india-2026",
    popular: true,
  },
  {
    id: "14",
    title:
      "Insydz vs SellerApp: Which Amazon Seller Tool Actually Works for the Indian Market?",
    excerpt:
      "A practitioner's comparison for ₹5L–50L/month Indian sellers — INR pricing vs USD billing, Flipkart-native vs Amazon-only. Read before you commit.",
    category: "Tool Comparison & Reviews",
    readTime: "10 min read",
    image: "/Insydz-vs-SellerApp.png",
    route: "/resources/expert-blog/insydz-vs-sellerapp-india",
    featured: true,
    popular: true,
  },
  {
    id: "13",
    title:
      "Analyze Amazon Reviews Tool: The Complete Guide for Indian Sellers (2026)",
    excerpt:
      "AI-powered Amazon review analysis for Indian D2C sellers — sentiment clustering, Hinglish support, RTO signals, and WhatsApp alerts.",
    category: "Review Intelligence",
    readTime: "12 min read",
    image: "/Analyze Amazon Reviews.png",
    route: "/resources/expert-blog/amazon-review-analysis-guide-india",
    popular: true,
  },
  {
    id: "12",
    title: "Manual vs Automated Competitor Tracking: What Works in 2026?",
    excerpt:
      "Indian ecommerce sellers spend 3–5 hours daily tracking competitor prices in Excel — and still react 24 hours too late.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/Manual-vs-Automated.png",
    route:
      "/resources/expert-blog/manual-vs-automated-competitor-tracking-tool",
    popular: true,
  },
  {
    id: "11",
    title: "Amazon vs Flipkart: Which Marketplace is Better in India? (2026)",
    excerpt:
      "Most Indian sellers are bleeding margin by choosing the wrong platform without running the numbers first. See how successful D2C brands evaluate fees, traffic, and competition data to decide where every rupee of inventory should go.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/Amazon vs Flipkart India Sellers.png",
    route: "/resources/expert-blog/amazon-vs-flipkart-india-seller",
    popular: true,
  },
  {
    id: "10",
    title:
      "Flipkart Keyword Research Tool & SEO Optimization Guide for Sellers (2026)",
    excerpt:
      "Your listings are invisible to lakhs of Flipkart shoppers because you're targeting the wrong keywords. Discover how India's top Flipkart sellers use AI-powered keyword research to dominate search rankings and multiply their organic traffic.",
    category: "Flipkart SEO & Seller Strategy",
    readTime: "9 min read",
    image: "/Flipkart Keyword Research Tool.png",
    route: "/resources/expert-blog/flipkart-keyword-research-tool",
  },
  {
    id: "8",
    title:
      "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
    excerpt:
      "Find buyer-intent keywords your competitors are ranking for on Amazon.in and win the search result before they know you're there.",
    category: "Seller Tools & Strategy",
    readTime: "6 min read",
    image: "/Amazon-SEO-Tool-India.png",
    route: "/resources/expert-blog/best-amazon-keyword-research-tool-india",
  },
  {
    id: "7",
    title:
      "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
    excerpt:
      "Your customers are telling you exactly what to fix and why they're switching to a competitor inside every review.",
    category: "D2C Growth & Brand Intelligence",
    readTime: "14 min read",
    image: "/Best-Review-Analysis-Tools.png",
    route: "/resources/expert-blog/review-analysis-guide-india",
  },
  {
    id: "6",
    title:
      "Amazon Competitor Price Tracking Tool India: Complete Guide for Sellers (2026)",
    excerpt:
      "Track competitor prices on Amazon.in, Flipkart in real time. Discover how Indian sellers use AI-powered tools to protect margins.",
    category: "Seller Tools & Strategy",
    readTime: "8 min read",
    image: "/Amazon Competitor Price Tracking Tool India.png",
    route: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
    popular: true,
  },
  {
    id: "5",
    title:
      "Amazon SEO Tool India: Keyword Research & Rank Tracking Guide for Sellers (2026)",
    excerpt:
      "Discover how an Amazon SEO tool built for India helps sellers rank higher, find buying keywords, and grow sales on Amazon.in.",
    category: "SEO & Keyword Intelligence",
    readTime: "12 min read",
    image: "/Amazon-SEO-Tool-India.png",
    route: "/resources/expert-blog/amazon-seo-tool-india",
    popular: true,
  },
  {
    id: "4",
    title:
      "How to Rank on Page 1 of Amazon India: The Complete Guide for Sellers (2026)",
    excerpt:
      "Learn exactly how to rank on page 1 of Amazon India using the A9 algorithm, keyword optimization & competitor intelligence.",
    category: "The Complete Guide for Sellers (2026)",
    readTime: "15 min read",
    image: "/How-to-Rank-on-Page-1.png",
    route: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
    popular: true,
  },
  {
    id: "3",
    title:
      "Best Competitor Price Tracking Tools for Indian Sellers: The 2026 Guide",
    excerpt:
      "Your competitors are repricing in real time while you're still checking prices manually — and losing the Buy Box because of it. See how India's smartest marketplace sellers use automated price intelligence across Amazon, Flipkart, and Meesho to protect margin and win more sales.",
    category: "Tool Comparison & Reviews",
    readTime: "10 min read",
    image: "/Best-Competitor-Price-Tracking-Tools.png",
    route: "/resources/expert-blog/best-competitor-price-tracking-tools-india",
    popular: true,
  },
  {
    id: "2",
    title:
      "Insydz vs Helium 10: Which is the Right Amazon Intelligence Tool for Indian Sellers?",
    excerpt:
      "Helium 10 was built for Amazon US — not for the way Indian marketplaces actually work. Find out why thousands of Indian sellers are switching to a tool built specifically for Amazon India, Flipkart, and Meesho.",
    category: "Pricing + Compare",
    readTime: "7 min read",
    image: "/Insydz-vs-Helium-10.png",
    route: "/resources/expert-blog/insydz-vs-helium-10-india",
  },
  {
    id: "1",
    title:
      "AI Review Intelligence Tool for Amazon & Flipkart Sellers: The Complete Guide (2026)",
    excerpt:
      "Your customers are already telling you exactly what's broken and why they're switching to a competitor — inside every review. Learn how India's fastest-growing D2C brands use AI review analysis to cut returns, fix listings, and grow revenue.",
    category: "Review Intelligence Pillar",
    readTime: "11 min read",
    image: "/AI Review Intelligence Tool.png",
    route:
      "/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
  },
];

export default function VikrantSinghAuthorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16">
      {/* Author Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-8 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <img
                src="/vikrant-singh-author.png"
                alt="Professional portrait of Vikrant Singh sitting at a desk in a modern office."
                className="h-40 w-40 sm:h-44 sm:w-44 rounded-full object-cover shadow-xl ring-4 ring-white dark:ring-gray-800"
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-2 shadow-sm border border-orange-200 dark:border-orange-900">
              <Users className="w-4 h-4" />
              <span>Author Profile</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Vikrant Singh
              </span>
            </h1>

            <p className="text-xl font-medium text-orange-600 dark:text-orange-500 mb-2">
              Expert E-commerce Strategist at Insydz
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed max-w-2xl mx-auto">
              Vikrant writes extensively about Amazon and Flipkart SEO,
              competitor intelligence, and scaling D2C brands in India. His
              insights help Indian sellers optimize pricing, uncover high-intent
              keywords, and dominate the buy box.
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
      <section className="py-4 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Articles by Vikrant
            </h2>
            <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">
              {articles.length} Posts
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={article.route}>
                <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full">
                  <div className="blog-card-thumb relative">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      <div className="flex items-center justify-center p-4">
                        <BarChart3 className="w-24 h-24 text-orange-200 dark:text-orange-900 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-10">
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
                        <span className="text-sm font-medium">
                          {article.readTime}
                        </span>
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
        </div>
      </section>

      <style>{`
        .blog-card-thumb { position: relative; width:100%; aspect-ratio:1978 / 795; overflow:hidden; background:#0A0F1A; display:flex; align-items:center; justify-content:center; }
        .blog-card-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
      `}</style>
    </div>
  );
}
