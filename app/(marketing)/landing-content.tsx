​"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Menu, X, Facebook, Twitter, Instagram, BarChart3, Zap, Shield, Mail, Phone, MapPin, Check, Crown, Building2, Sun, Moon, Trophy, Target, DollarSign, Globe, BookOpen, Video, FileText, Users, Presentation, Linkedin, ChevronDown, ShoppingBag, TrendingDown, MessageCircle, Search, Package, Bell, Code, BarChart, Briefcase, Store, ShoppingCart, Flame, LayoutGrid, Star } from "lucide-react";
import { Button } from "@/components/ui/button";



// const testimonials = [
//   {
//     logo: "hulu",
//     logoColor: "text-[#1CE783]",
//     rating: "4.9",
//     text: "The progress tracker is fantastic. It's motivating to see how much I've improved over time. The app has a great mix of features.",
//     author: "Kate Davis",
//     handle: "friable_captain_8"
//   },
//   {
//     logo: "Disney+",
//     logoColor: "text-[#006E99]",
//     rating: "4.9",
//     text: "A game changer for my productivity. The insights provided are incredibly helpful and have allowed me to make better decisions.",
//     author: "Sanjay Sharma",
//     handle: "voracious_rainbows_68"
//   },
//   {
//     logo: "STARZ",
//     logoColor: "text-[#002D58] dark:text-white",
//     rating: "4.7",
//     text: "The community features are a great addition. It's wonderful to see others' progress and share my own journey with like-minded people.",
//     author: "Tawanna Afumba",
//     handle: "intransigent_toejam_15"
//   }
// ];

const testimonials = [
  {
    logo: "🛒",
    logoColor: "text-orange-500",
    rating: "4.9",
    text: "Insydz helped me identify which products were quietly losing margin. Within two weeks I restructured my pricing and saw a 22% improvement in net profit. I didn't need to guess anymore — the data was right there.",
    author: "Rahul Gupta",
    handle: "Electronics · 3 yrs on Amazon",
    role: "Amazon Seller · Delhi",
    badge: "Amazon India"
  },
  {
    logo: "🏷️",
    logoColor: "text-pink-500",
    rating: "5.0",
    text: "Competitor tracking on Insydz is a game changer. I used to spend hours manually checking prices — now it's all there every morning. Big Billion Days prep was so much smoother this year because of the alerts.",
    author: "Priya Sharma",
    handle: "Fashion & Apparel · 5 yrs on Flipkart",
    role: "Flipkart Seller · Mumbai",
    badge: "Flipkart"
  },
  {
    logo: "📊",
    logoColor: "text-blue-500",
    rating: "4.8",
    text: "Managing 4 brands across Amazon and Flipkart was a nightmare before Insydz. Now I have one dashboard and my clients get reports they can actually act on. It has genuinely changed how I run my agency.",
    author: "Aarav Kumar",
    handle: "Multi-brand Agency · Bengaluru",
    role: "Brand Manager · Bengaluru",
    badge: "Amazon + Flipkart"
  },
  {
    logo: "🔍",
    logoColor: "text-purple-500",
    rating: "4.7",
    text: "The AI keyword suggestions took my listings from page 4 to page 1 within a month. I was skeptical at first but the data doesn't lie — my organic sales doubled and my ad spend dropped 30%.",
    author: "Sneha Mehta",
    handle: "Home & Kitchen · 2 yrs on Amazon",
    role: "Amazon Seller · Pune",
    badge: "Amazon India"
  },
  {
    logo: "🏆",
    logoColor: "text-yellow-500",
    rating: "4.9",
    text: "Finally a tool built for Indian marketplaces, not just adapted from western tools. The Flipkart-specific insights are accurate and the support team actually understands our local market challenges.",
    author: "Vikram Reddy",
    handle: "Sports & Fitness · 4 yrs on Flipkart",
    role: "Flipkart Seller · Hyderabad",
    badge: "Flipkart"
  },
  {
    logo: "🚀",
    logoColor: "text-pink-500",
    rating: "4.8",
    text: "We onboarded 12 new clients after showing them Insydz reports during pitches. The data precision and India-specific market intelligence gives us an edge no other tool provides. Our clients love the dashboards.",
    author: "Nidhi Joshi",
    handle: "E-commerce Agency · 12 clients",
    role: "E-commerce Agency · Ahmedabad",
    badge: "Amazon + Flipkart"
  }
];

export default function LandingContent() {
  const router = useRouter();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handlePlanSelect = (planId: string) => {
    router.push("/login");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden">

      {/* Hero Section */}
      <section
        id="Home"
        className="relative min-h-[65vh] lg:h-[78vh] flex items-center justify-center pt-16 lg:pt-20 pb-12 lg:pb-16 bg-gradient-to-br from-purple-50/40 via-white to-pink-50/20 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col space-y-3 lg:space-y-4 text-left mt-2 lg:mt-0">
              {/* Pill */}
              <h1 className="inline-flex w-max items-center px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold shadow-sm">
                Ecommerce Analytics Software
              </h1>

              {/* Platforms */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
                <span>Works with</span>
                <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100 font-semibold">Amazon India</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-semibold">Flipkart</span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
                <span className="block mb-1 text-gray-900">Stop Guessing.</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                  Make Selling Decisions <br className="hidden sm:inline" /> Better & Faster
                </span>
              </h1>

              {/* Paragraphs */}
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed">
                <p>
                  Insydz helps Amazon and Flipkart sellers understand their data and grow their business. Our <span className="font-semibold text-gray-900 dark:text-white">seller analytics platform</span> shows you exactly which products make money, what competitors are doing, and where you lose sales.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <Link href="/signup"
                  className="inline-flex justify-center items-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all shadow-md hover:shadow-purple-500/20 transform hover:-translate-y-0.5"
                >
                  Start Free. No Card Needed.
                </Link>

                {/* Mobile-only Login button */}
                <Link href="/login"
                  className="sm:hidden inline-flex justify-center items-center px-6 py-3 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-400 hover:bg-purple-100 rounded-full transition-all shadow-sm"
                >
                  Login
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 mt-1 border-t border-purple-100/50 dark:border-gray-800">
                <div>
                  <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5,000+</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">Sellers trust Insydz</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2.5L+</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">Reviews analysed</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">Live market data</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Mockup */}
            <div className="relative w-full max-w-md mx-auto lg:ml-auto xl:max-w-lg mt-12 lg:mt-0 lg:pl-6 hidden lg:block scale-[0.8] xl:scale-[0.85] origin-right">
              {/* Floating elements */}
              <div className="absolute -top-4 -right-2 z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl shadow-purple-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                Sales up 18% this week
              </div>
              
              <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 bg-white border border-purple-200 text-purple-600 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="block text-gray-900 mb-0.5">Competitor dropped price</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">on 3 of your products</span>
              </div>

              {/* Browser Window Mockup */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* Browser Header */}
                <div className="bg-[#1C1C28] px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto bg-background opacity-100 rounded px-3 py-1 text-[10px] text-white/50 w-48 text-center truncate font-medium">
                    insydz.com/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">Good morning, Rahul</h3>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">22 Apr 2026</div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-2 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-[9px] text-gray-500 mb-0.5 font-medium">Revenue Today</div>
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white">₹48,200</div>
                      <div className="text-[8px] text-green-500 mt-0.5 font-bold">+12% vs yesterday</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-2 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-[9px] text-gray-500 mb-0.5 font-medium">Orders</div>
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white">143</div>
                      <div className="text-[8px] text-green-500 mt-0.5 font-bold">+8 orders</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-2 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-[9px] text-gray-500 mb-0.5 font-medium">Returns</div>
                      <div className="font-extrabold text-sm text-gray-900 dark:text-white">4</div>
                      <div className="text-[8px] text-red-500 mt-0.5 font-bold">Review needed</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 shadow-sm bg-white dark:bg-gray-900">
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2 font-semibold">Weekly Sales on Amazon India</div>
                    <div className="flex items-end gap-2 h-14">
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t h-[30%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t h-[40%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t h-[35%]"></div>
                      <div className="flex-1 bg-purple-100 dark:bg-purple-900/40 rounded-t h-[60%]"></div>
                      <div className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t h-[90%] relative"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t h-[50%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t h-[70%]"></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Video Masterclasses Section */}
      <section className="pt-6 pb-16 lg:pt-8 bg-gradient-to-br from-pink-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 uppercase tracking-wider mb-4">
                <span className="text-[10px]">▶</span> Video Masterclasses
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                Learn from India's <span className="bg-gradient-to-r from-purple-600 to-[#8B5CF6] bg-clip-text text-transparent">Top Sellers</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl font-medium">
                Free strategy walkthroughs on Amazon.in, Flipkart, PPC & festive prep — straight from real sellers.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link href="/resources/video-guides" 
                className="inline-flex items-center gap-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-bold px-6 py-2.5 rounded-full transition-all text-sm shadow-sm"
              >
                View all videos <span className="text-base font-normal">→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full group">
              <div 
                className="bg-gray-100 dark:bg-gray-900 aspect-video w-full relative flex items-center justify-center cursor-pointer bg-cover bg-center"
                style={{ backgroundImage: "url('/Insydz%20Feature%20-%20Opportunity%20Finder%20Cover%20Image.png')" }}
                onClick={() => setPlayingVideo("/videos/Insydz%20Feature%20-%20Opportunity%20Finder.mp4")}
              >
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5 fill-current text-[#4338ca] ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="absolute top-4 right-4 bg-black/50 text-white border border-white/20 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Product Research</span>
                <span className="absolute bottom-4 left-4 bg-black/75 text-white text-xs font-semibold px-2 py-0.5 rounded">06:12</span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 
                  className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-3 hover:text-purple-600 transition-colors cursor-pointer"
                  onClick={() => setPlayingVideo("/videos/Insydz%20Feature%20-%20Opportunity%20Finder.mp4")}
                >
                  Find Winning Product Opportunities with Insydz's Opportunity Finder
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium flex-grow">
                  Discover hidden market gaps on Amazon and Flipkart using Insydz Opportunity Finder. See competitor counts, revenue potential, pricing gaps, demand signals, and AI-powered insights all in seconds.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-bold text-gray-400 mt-auto">
                  <span className="flex items-center gap-1">👁 14.2K views</span>
                  <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.54 12 3.54 12 3.54s-7.522 0-9.388.516a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.46 12 20.46 12 20.46s7.522 0 9.388-.516a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837z"/></svg> YouTube
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full group">
              <div 
                className="bg-gray-100 dark:bg-gray-900 aspect-video w-full relative flex items-center justify-center cursor-pointer bg-cover bg-center"
                style={{ backgroundImage: "url('/Insydz%20-%20Navigation%20Guide%20Cover%20Image.png')" }}
                onClick={() => setPlayingVideo("/videos/Insydz%20-%20%20Complete%20Navigation%20Guide.mp4")}
              >
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5 fill-current text-[#0f766e] ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="absolute top-4 right-4 bg-black/50 text-white border border-white/20 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Getting Started</span>
                <span className="absolute bottom-4 left-4 bg-black/75 text-white text-xs font-semibold px-2 py-0.5 rounded">08:45</span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 
                  className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-3 hover:text-purple-600 transition-colors cursor-pointer"
                  onClick={() => setPlayingVideo("/videos/Insydz%20-%20%20Complete%20Navigation%20Guide.mp4")}
                >
                  Insydz - Complete Navigation Guide
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium flex-grow">
                  This step-by-step guide helps you set up your account and explore powerful seller tools, all in one place. Built for Amazon and Flipkart sellers who want smarter growth with data.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-bold text-gray-400 mt-auto">
                  <span className="flex items-center gap-1">👁 6.1K views</span>
                  <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.54 12 3.54 12 3.54s-7.522 0-9.388.516a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.46 12 20.46 12 20.46s7.522 0 9.388-.516a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837z"/></svg> YouTube
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full group">
              <div 
                className="bg-gray-100 dark:bg-gray-900 aspect-video w-full relative flex items-center justify-center cursor-pointer bg-cover bg-center"
                style={{ backgroundImage: "url('/Insydz%E2%80%99s%20Market%20Visibility%20-%20Cover%20Image.png')" }}
                onClick={() => setPlayingVideo("/videos/Insydz’s%20Market%20Visibility.mp4")}
              >
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-5 h-5 fill-current text-[#9a3412] ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span className="absolute top-4 right-4 bg-black/50 text-white border border-white/20 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Competitor Analysis</span>
                <span className="absolute bottom-4 left-4 bg-black/75 text-white text-xs font-semibold px-2 py-0.5 rounded">05:30</span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 
                  className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-3 hover:text-purple-600 transition-colors cursor-pointer"
                  onClick={() => setPlayingVideo("/videos/Insydz’s%20Market%20Visibility.mp4")}
                >
                  Insydz’s Market Visibility
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium flex-grow">
                  Insydz's Market Visibility tool gives you a complete X-ray of your category, who's dominating, where the gaps are, and exactly how you can break in.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs font-bold text-gray-400 mt-auto">
                  <span className="flex items-center gap-1">👁 11.8K views</span>
                  <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.54 12 3.54 12 3.54s-7.522 0-9.388.516a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.46 12 20.46 12 20.46s7.522 0 9.388-.516a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837z"/></svg> YouTube
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section id="" className="py-16 bg-gradient-to-br from-white-50 to-white-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Built for Every E-commerce Growth Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Whether you're a solo Amazon seller or managing a portfolio of brands, Insydz is the marketplace analytics software that adapts to your needs. 
            </p>
          </div>

          {/* Comparison Cards — each card links to its solution page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Amazon Sellers */}
            <Link href="/solutions/amazon-sellers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Amazon Seller</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Win Buy Box, optimize keywords & pricing with AI-powered intelligence</span>
                </li>
              </ul>
            </Link>

            {/* Flipkart Sellers */}
            <Link href="/solutions/flipkart-sellers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Flipkart Sellers</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Track competitors & reviews effortlessly never get blindsided before Big Billion Days</span>
                </li>
              </ul>
            </Link>

            {/* E-commerce Agencies */}
            <Link href="/solutions/ecommerce-agencies" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">E-commerce Agencies</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Manage multiple clients with clarity prepare client reports in one click</span>
                </li>
              </ul>
            </Link>

            {/* Brand Managers */}
            <Link href="/solutions/brand-managers" className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Brand Managers</h3>
                  </div>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make confident data-backed decisions present real intelligence to leadership</span>
                </li>
              </ul>
            </Link>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section id="Compare" className="py-16 bg-gradient-to-br from-pink-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Indian Sellers Choose <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover how Insydz outperforms the competition across key metrics, from real time listing intelligence to competitor tracking, built specifically for Indian marketplaces.
            </p>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[
              { icon: <Target className="w-8 h-8" />, text: "Streamlined UX", color: "from-blue-500 to-blue-600" },
              { icon: <Zap className="w-8 h-8" />, text: "Superior AI Intelligence", color: "from-purple-500 to-purple-600" },
              { icon: <DollarSign className="w-8 h-8" />, text: "Exceptional Value", color: "from-green-500 to-green-600" },
              { icon: <Globe className="w-8 h-8" />, text: "India-First Expertise", color: "from-orange-500 to-orange-600" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white`}>
                  {item.icon}
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Insydz vs Helium 10 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-purple-200 dark:border-purple-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Helium 10</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Indian marketplace coverage Helium 10 can't match</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium features at a fraction of the cost</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">₹ denominated pricing intelligence built for India</span>
                </li>
              </ul>
              <Link href="/compare/insydzvshelium"
                className="w-full inline-block text-center border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>

            {/* Insydz vs Jungle Scout */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-blue-200 dark:border-blue-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Jungle Scout</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Amazon India + Flipkart in one dashboard</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Real time competitive intelligence for Indian markets</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI insights that understand Indian buyer behaviour</span>
                </li>
              </ul>
              <Link href="/compare/insydzvsjunglescout"
                className="w-full inline-block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>

            {/* Insydz vs Viral Launch */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-green-200 dark:border-green-900 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Insydz</h3>
                    <p className="text-sm text-gray-500">vs Viral Launch</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Agency optimized workflows for Indian businesses</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Superior data precision for marketplaces</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Localized market intelligence designed for how Indian businesses scale</span>
                </li>
              </ul>
              <Link href="/compare/insydzvsvirallaunch"
                className="w-full inline-block text-center border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold py-2 rounded-lg"
              >
                Show More →
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/login"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-10 py-4 text-lg rounded-full shadow-xl"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="Resources" className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Accelerate Your Growth With <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Access premium resources built for Indian e-commerce sellers from seller guides and success stories to video masterclasses and strategic playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Blog */}
            <Link href="/resources/expert-blog"
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-blue-200 dark:border-blue-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Expert Blog</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Cutting-edge strategies for Amazon India, Flipkart sellers written by practitioners, not theorists
              </p>
              <span className="text-blue-600 dark:text-blue-400 font-semibold mt-auto">
                Explore Articles →
              </span>
            </Link>

            {/* Case Studies */}
            <Link href="/resources/case-studies"
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-purple-200 dark:border-purple-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Success Stories</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Real numbers from real Indian sellers who used Insydz to solve real marketplace problems
              </p>
              <span className="text-purple-600 dark:text-purple-400 font-semibold mt-auto">
                View Case Studies →
              </span>
            </Link>

            {/* Video Tutorials */}
            <Link href="/resources/videos"
              className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-pink-200 dark:border-pink-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Video Masterclasses</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                Step-by-step platform walkthroughs, seller workshops, marketplace strategy sessions
              </p>
              <span className="text-pink-600 dark:text-pink-400 font-semibold mt-auto">
                Start Learning →
              </span>
            </Link>

            {/* E-commerce Guides */}
            <Link href="/resources/guides"
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-green-200 dark:border-green-800 block flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Strategic Playbooks</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                In-depth growth frameworks for festive season prep, Buy Box recovery, new product launches, and competitive repositioning
              </p>
              <span className="text-green-600 dark:text-green-400 font-semibold mt-auto">
                Access Guides →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="About" className="py-16 bg-background dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're democratizing ecommerce intelligence for the Indian market, building tools that empower the next generation of digital entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Seller Focused</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every feature we build starts with a conversation with a real seller navigating the Indian marketplace landscape.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Presentation className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Data Precision</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe in raw data accuracy. Our proprietary engine cleans and processes millions of data points specifically for marketplaces.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Beyond just tracking, we provide AI recommendations that help you act on data before your competitors do.
              </p>
          </div>
        </div>
      </div>
    </section>

      {/* Trust Indicators Section - Full Width */}
      <section className="py-16 bg-[#FDF4FF] dark:bg-gray-900/50 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              Building India's Most Trusted <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Seller Analytics Platform</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Supporting data driven decisions for Indian sellers across every marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { title: "Early", subtitle: "Product Stage" },
              { title: "India", subtitle: "Primary Market" },
              { title: "Multiple", subtitle: "Marketplaces Supported" },
              { title: "Growing", subtitle: "Seller Adoption" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800 flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
              >
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  {stat.title}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">
                  {stat.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="Testimonials" className="py-16 bg-slate-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Our trusted <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Clients</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium">
              Our mission is to drive progress and enhance the lives of our customers by delivering superior products and services that exceed expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 z-10"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`text-2xl font-black tracking-tighter uppercase ${t.logoColor || 'text-gray-900 dark:text-white'}`}>
                    {t.logo}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.rating}</span>
                    <Star className="w-4 h-4 text-green-500 fill-green-500" />
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 font-medium italic">
                  "{t.text}"
                </p>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{t.author}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}

      <section id="Pricing" className="py-16 bg-white dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#EC4899] bg-clip-text text-transparent">Subscription Plans</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription Plans That Grow With Your Business
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Transform raw marketplace data into actionable insights. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:border-purple-500 dark:hover:border-purple-400">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Free</h4>
              <div className="flex items-baseline mb-3">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹0</span>
                <span className="text-gray-400 text-base ml-1">/month</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 font-medium">Perfect for getting started</p>
              <ul className="space-y-4 mb-6 text-left w-full">
                {[
                  "Basic dashboard access",
                  "Up to 25 products tracking",
                  "Top 5 products filter",
                  "5 AI chat messages/month",
                  "5 notifications",
                  "Weekly reports"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all mt-auto"
              >
                Get Started Free
              </button>
            </div>

            {/* Basic Plan */}
            <div className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border-2 border-[#D946EF] shadow-[0_30px_60px_rgba(217,70,239,0.15)] flex flex-col items-center text-center transform lg:scale-105 z-10 transition-all hover:border-[#8B5CF6] hover:shadow-[0_40px_80px_rgba(217,70,239,0.2)]">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                Most Popular
              </div>
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-8">
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Basic</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹1,999</span>
                <span className="ml-2 text-xs font-medium">
                  <span className="text-gray-400 line-through">₹3,999</span>
                  <span className="text-gray-400">/month</span>
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 font-medium">Ideal for growing businesses</p>
              <ul className="space-y-4 mb-12 text-left w-full">
                {[
                  "All Free plan features",
                  "Up to 500 products tracking",
                  "Top 20 products filter",
                  "20 AI chat messages/month",
                  "15 notifications",
                  "AI Chart Summaries",
                  "Basic competitor alerts",
                  "Daily reports",
                  "Email support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanSelect('basic')}
                className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] rounded-xl font-bold text-white shadow-xl shadow-purple-500/20 hover:opacity-90 transition-opacity mt-auto"
              >
                Upgrade to Basic
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:border-purple-500 dark:hover:border-purple-400">
              <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center mb-8">
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Premium</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹2,999</span>
                <span className="ml-2 text-xs font-medium">
                  <span className="text-gray-400 line-through">₹7,999</span>
                  <span className="text-gray-400">/month</span>
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 font-medium">For serious professionals</p>
              <ul className="space-y-4 mb-12 text-left w-full">
                {[
                  "All Basic plan features",
                  "Unlimited product tracking",
                  "Top 100 products filter",
                  "Unlimited AI chat",
                  "Unlimited notifications",
                  "Advanced AI chatbot",
                  "Real-time data & alerts",
                  "Priority support",
                  "Advanced analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanSelect('premium')}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl font-bold text-white shadow-xl shadow-orange-500/20 hover:opacity-90 transition-opacity mt-auto"
              >
                Upgrade to Premium
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:border-purple-500 dark:hover:border-purple-400">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-8">
                <Building2 className="w-8 h-8 text-indigo-500" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Enterprise</h4>
              <div className="mb-4">
                <span className="text-xl font-black bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">Custom Pricing</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-10 font-medium">Tailored for SMBs & agencies</p>
              <ul className="space-y-4 mb-12 text-left w-full">
                {[
                  "All Premium plan features",
                  "White-label options",
                  "24/7 premium support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all mt-auto"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Full Width */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-pink-900 relative overflow-hidden shadow-2xl">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36 blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h3 className="text-4xl md:text-5xl font-black mb-8">Ready to dominate the marketplace?</h3>
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto font-medium">
            Join thousands of Indian sellers who use Insydz to grow their revenue and profit every single day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/login"
              className="bg-white text-purple-900 font-bold px-12 py-5 rounded-full shadow-2xl hover:bg-purple-50 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link href="/about/our-vision"
              className="border-2 border-white/40 hover:border-white text-white font-bold px-12 py-5 rounded-full transition-all hover:bg-white/5"
            >
              Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is handled by MarketingLayout */}

      {/* Video Modal Player Overlay */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Video element */}
            <div className="aspect-video w-full">
              <video 
                src={playingVideo} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

