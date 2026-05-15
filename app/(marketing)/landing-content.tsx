"use client";

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
//     logo: "HBOMAX",
//     logoColor: "text-[#000000] dark:text-white",
//     rating: "4.8",
//     text: "I love how easy it is to keep track of my goals. The interface is clean and intuitive, making my daily routine much more efficient.",
//     author: "Martin Kazlauskas",
//     handle: "sartorial_statue_59"
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
//   },
//   {
//     logo: "VIX",
//     logoColor: "text-[#FF4B00]",
//     rating: "4.9",
//     text: "Excellent support and frequent updates. You can tell the team really cares about their users and is constantly working to improve the app.",
//     author: "Larry King",
//     handle: "pendulous_unicom_46"
//   },
//   {
//     logo: "prime video",
//     logoColor: "text-[#00A8E1]",
//     rating: "4.8",
//     text: "Highly recommended for anyone looking to take their progress tracking to the next level. It's simple, yet powerful and very effective.",
//     author: "Fatima Mohamed",
//     handle: "salubrious_artist_72"
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
        className="relative min-h-screen flex items-center justify-center pt-28 lg:pt-32 pb-12 lg:pb-16 bg-gradient-to-br from-purple-50/40 via-white to-pink-50/20 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col space-y-6 text-left mt-4 lg:mt-0">
              {/* Pill */}
              <h1 className="inline-flex w-max items-center px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold shadow-sm">
                Ecommerce Analytics Software
              </h1>

              {/* Platforms */}
              <div className="flex items-center space-x-3 text-sm text-gray-500 font-medium">
                <span>Works with</span>
                <span className="px-3 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100 font-semibold">Amazon India</span>
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-semibold">Flipkart</span>
              </div>

              {/* Heading */}
              <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
                <span className="text-6xl block mb-2 text-gray-900">Stop Guessing.</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text leading-tight text-transparent block mb-2">Make Selling</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mb-2">Decisions</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">Better & Faster</span>
              </div>

              {/* Paragraphs */}
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg max-w-xl">
                <p>
                  Insydz helps Amazon and Flipkart sellers understand their data and grow their business. No more guessing what works. Get clear insights and take action with confidence.
                </p>
                <p>
                  Our <span className="font-semibold text-gray-900 dark:text-white">seller analytics platform</span> shows you exactly which products are making money, what your competitors are doing, and where you are losing sales.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login"
                  className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-colors shadow-lg hover:shadow-purple-500/25"
                >
                  Start Free. No Card Needed.
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 mt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5,000+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Sellers trust Insydz</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2.5 Lakh+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Reviews analysed</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Live market data</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Mockup */}
            <div className="relative w-full max-w-xl mx-auto lg:ml-auto xl:max-w-2xl mt-12 lg:mt-0 lg:pl-10 hidden lg:block">
              {/* Floating elements */}
              <div className="absolute -top-6 -right-2 sm:-right-6 z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl shadow-purple-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                Sales up 18% this week
              </div>
              
              <div className="absolute -bottom-6 -left-2 sm:-left-6 z-20 bg-white border border-purple-200 text-purple-600 text-sm font-bold px-5 py-4 rounded-2xl shadow-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <span className="block text-gray-900 mb-1">Competitor dropped price</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">on 3 of your products</span>
              </div>

              {/* Browser Window Mockup */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {/* Browser Header */}
                <div className="bg-[#1C1C28] px-4 py-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto bg-background opacity-100 rounded-md px-4 py-1.5 text-xs text-white/50 w-64 text-center truncate font-medium">
                    insydz.com/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Good morning, Rahul</h3>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">22 Apr 2026</div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Revenue Today</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">₹48,200</div>
                      <div className="text-xs text-green-500 mt-2 font-bold">+12% vs yesterday</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Orders</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">143</div>
                      <div className="text-xs text-green-500 mt-2 font-bold">+8 orders</div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm bg-white dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Returns</div>
                      <div className="font-extrabold text-2xl text-gray-900 dark:text-white">4</div>
                      <div className="text-xs text-red-500 mt-2 font-bold">Review needed</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-white dark:bg-gray-900">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-semibold">Weekly Sales on Amazon India</div>
                    <div className="flex items-end gap-3 h-28">
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[30%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[40%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[35%]"></div>
                      <div className="flex-1 bg-purple-100 dark:bg-purple-900/40 rounded-t-md h-[60%]"></div>
                      <div className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-md h-[90%] relative"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[50%]"></div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-t-md h-[70%]"></div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-900/5 rounded-2xl p-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-purple-600 font-bold text-left">
                          <th className="pb-4 uppercase tracking-wider text-xs">Product</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Price</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Profit</th>
                          <th className="pb-4 uppercase tracking-wider text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 dark:text-gray-300">
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Steel Water Bottle</td>
                          <td className="py-3 text-xs sm:text-sm">₹749</td>
                          <td className="py-3 text-xs sm:text-sm">₹82</td>
                          <td className="py-3"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Trending</span></td>
                        </tr>
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Yoga Mat 6mm</td>
                          <td className="py-3 text-xs sm:text-sm">₹599</td>
                          <td className="py-3 text-xs sm:text-sm">₹41</td>
                          <td className="py-3"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Review</span></td>
                        </tr>
                        <tr className="border-b border-purple-100/50 dark:border-purple-900/20 last:border-0">
                          <td className="py-3 font-semibold text-xs sm:text-sm">Phone Stand Desk</td>
                          <td className="py-3 text-xs sm:text-sm">₹199</td>
                          <td className="py-3 text-xs sm:text-sm">₹12</td>
                          <td className="py-3"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">Low Margin</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

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

