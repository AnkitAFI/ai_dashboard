"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Menu, X, Facebook, Twitter, Instagram, BarChart3, Zap, Shield, Mail, Phone, MapPin, Check, Crown, Building2, Sun, Moon, Trophy, Target, DollarSign, Globe, BookOpen, Video, FileText, Users, Presentation, Linkedin, ChevronDown, ShoppingBag, TrendingDown, MessageCircle, Search, Package, Bell, Code, BarChart, Briefcase, Store, ShoppingCart, Flame, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";



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
        className="relative min-h-screen flex items-center justify-center pt-32 lg:pt-40 pb-16 lg:pb-24 bg-gradient-to-br from-purple-50/40 via-white to-pink-50/20 dark:from-gray-900 dark:via-background dark:to-gray-900 overflow-hidden"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col space-y-6 text-left mt-4 lg:mt-0">
              {/* Pill */}
              <div className="inline-flex w-max items-center px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold shadow-sm">
                AI Ecommerce Analytical Software for Indian Sellers
              </div>

              {/* Platforms */}
              <div className="flex items-center space-x-3 text-sm text-gray-500 font-medium">
                <span>Works with</span>
                <span className="px-3 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100 font-semibold">Amazon India</span>
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-semibold">Flipkart</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
                <span className="text-6xl block mb-2 text-gray-900">Stop Guessing.</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text leading-tight text-transparent block mb-2">Make Selling</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mb-2">Decisions</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">Better & Faster</span>
              </h1>

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
      <section id="" className="py-24 bg-gradient-to-br from-white-50 to-white-50 dark:from-gray-800 dark:to-gray-900">
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
      <section id="Compare" className="py-24 bg-gradient-to-br from-pink-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
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
      <section id="Resources" className="py-24 bg-white dark:bg-gray-900">
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
      <section id="About" className="py-24 bg-background dark:bg-gray-800/50">
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

          <div className="mt-20 bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <h3 className="text-3xl font-bold mb-6 relative z-10">Ready to dominate the marketplace?</h3>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of Indian sellers who use Insydz to grow their revenue and profit every single day.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/login"
                className="bg-white text-purple-900 font-bold px-10 py-4 rounded-full shadow-xl hover:bg-purple-50 transition-colors"
              >
                Create Free Account
              </Link>
              <Link href="/about/our-vision"
                className="border-2 border-white/30 hover:border-white text-white font-bold px-10 py-4 rounded-full transition-colors"
              >
                Our Mission
              </Link>
            </div>
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

