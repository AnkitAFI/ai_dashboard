"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  Store, IndianRupee, Smartphone, ShoppingCart, Award,
  Menu, X, Sun, Moon, ChevronDown, ShoppingBag, Briefcase,
  Users, Code, Globe, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Flame,
  Presentation, LayoutGrid, Lightbulb, Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQAccordion, TrustBadges, FadeInStyles } from "@/components/solutions";
import type { FAQItem } from "@/components/solutions";

export const dynamic = "force-static";



export default function FlipkartSellersPage() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/login");
  };


  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <h1 className="text-sm font-medium text-blue-700">Flipkart Seller Analytics Tool</h1>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Dominate Flipkart.
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Win with Data,
                </span>
                <br />
                Not Guesswork.
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India's most powerful <strong>Flipkart seller analytics tool</strong> built for full-time sellers doing ₹5L to ₹50L a month. Track competitors, decode reviews, and recover keyword rankings{" "}
                <span className="text-blue-700 font-semibold">with AI-powered insights built for the Indian market.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group"
                >
                  Start Free for Flipkart Sellers
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-700 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full"
                >
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {/* Flipkart Product Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Smart LED Bulb Pack</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">4.3 (1,892)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Alert */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-2xl p-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Competitor Price Drop Alert!</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Top seller reduced price by <span className="text-red-600 font-bold">15%</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">₹899 → ₹764</p>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Alert */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Alert Sent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Instant notification delivered</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Live Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PAIN POINTS ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Why Flipkart Sellers
              <br />
              <span className="text-red-600">Leave Money on the Table</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Without real-time intelligence, you're flying blind. The Flipkart marketplace moves fast competitor prices shift overnight, review scores drop silently, and rankings slip while you're busy managing operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <TrendingDown className="w-6 h-6" />,
                title: "Competitors change prices while you sleep and steal your sales rank",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "Bad reviews reveal problems too late after orders and ratings have already dropped",
                color: "from-orange-500 to-yellow-500"
              },
              {
                icon: <Search className="w-6 h-6" />,
                title: "Keyword rankings drop unnoticed you only find out when traffic disappears",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Hours wasted on manual tracking that should be spent growing your business",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {pain.icon}
                </div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1">{pain.title}</p>
              </div>
            ))}
          </div>

          {/* Highlight Box */}
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Flipkart sellers lose <span className="text-red-600">15–30% of profit annually</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              due to delayed pricing decisions, untracked reviews, and poor keyword visibility none of which <br />  your Flipkart Seller Hub shows you.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Your Flipkart Seller Hub Shows Your Data.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Insydz Shows Your Competitors'.</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Flipkart Seller Hub is great for tracking your own orders and returns. But it tells you nothing about what your competitors are doing or why your ranking is falling. That intelligence gap is costing you lakhs every month.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-10">
            <table className="w-full text-sm">
              <thead>
              <tr>
                <th className="bg-black text-white text-left px-6 py-4 font-bold text-base">
                  Feature
                </th>
                <th className="bg-black text-white px-6 py-4 font-bold text-base text-left">
                  Insydz
                </th>
                <th className="bg-black text-white px-6 py-4 font-bold text-base text-left">
                  Flipkart Seller Hub
                </th>
              </tr>
            </thead>
              <tbody>
                {[
                  { feature: "Competitor price tracking (real-time)", insydz: "✓", hub: "✗" },
                  { feature: "Keyword ranking on Flipkart search", insydz: "✓ Daily tracking", hub: "✗ No data" },
                  { feature: "Review analysis & sentiment AI", insydz: "✓ Root-cause", hub: "⚠ Raw reviews only" },
                  { feature: "AI pricing recommendations (INR)", insydz: "✓", hub: "✗" },
                  { feature: "WhatsApp alerts", insydz: "✓ Real-time", hub: "✗" },
                  { feature: "Competitive intelligence", insydz: "✓ Full market", hub: "✗ Your store only" },
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-left">
                      <span className={`font-semibold ${row.insydz.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{row.insydz}</span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className={`font-semibold ${row.hub.startsWith('✓') ? 'text-green-600' : row.hub.startsWith('⚠') ? 'text-yellow-600' : 'text-red-500'}`}>{row.hub}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/compare/insydzvshelium')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
            See how Insydz compares to other Flipkart seller tools
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: FEATURES ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Meet Insydz 
              <br />
              Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Flipkart Intelligence Partner</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz is not a reporting tool. It's an AI decision engine built specifically for Indian Flipkart sellers.{" "}
              <span className="text-blue-700 font-semibold">We don't just track data we tell you exactly what actions to take to win.</span>
            </p>
          </div>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">1. Automated Competitor Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-400">Track 100+ competitors in your Flipkart category effortlessly. Insydz watches every price change, stock movement, and new seller entry so your Flipkart seller dashboard always shows the full competitive picture.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Real-time competitor price drop detection on Flipkart",
                  "Stock-out alerts capitalise when rivals run dry",
                  "New seller entry notifications in your category",
                  "Flipkart price history tracking for any product"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-blue-700 dark:text-blue-400">Real scenario:</span> A seller in Pune was losing sales every Monday morning. Insydz revealed a competitor was running a Sunday night flash price drop. He set a WhatsApp alert threshold and now reprices before dawn. Sales rank recovered within a week.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2. AI Review Intelligence</h3>
                  <p className="text-gray-600 dark:text-gray-400">Stop scrolling through hundreds of Flipkart reviews manually. Insydz's AI reads every review yours and your competitors' and tells you exactly what's hurting your rating and what's driving purchases.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Surface recurring complaints before they become 1-star trends",
                  "See what drives 5-star reviews in your category",
                  "Compare sentiment scores vs. your top 5 competitors",
                  "Link review patterns to return spikes and refund requests"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-purple-700 dark:text-purple-400">Real scenario:</span> 189 Flipkart reviews for a seller's LED bulbs mentioned 'box damaged in delivery.' Insydz flagged it. The seller upgraded packaging. Returns dropped 22% in 30 days and rating climbed from 3.8 to 4.3.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">3. Smart Pricing &amp; SEO Recommendations</h3>
                  <p className="text-gray-600 dark:text-gray-400">Flipkart performance analytics go beyond dashboards with Insydz. The AI calculates the exact price you should set based on your margin floor, competitor moves, and keyword ranking impact then guides your listing SEO to recover lost visibility.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "AI-recommended prices based on your cost of goods in INR",
                  "Keyword rank tracking across Flipkart search results daily",
                  "Listing title and bullet optimisation suggestions",
                  "Flipkart product analysis showing which attributes win search"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-orange-700 dark:text-orange-400">Real scenario:</span> A home décor seller's keyword 'led strip lights for bedroom' slipped from rank #6 to #24 on Flipkart. Insydz sent an alert with two specific fixes a ₹60 price reduction and a title tweak. Rank recovered to #9 within 5 days.
                </p>
              </div>
              <button
                onClick={() => router.push('/features/keyword-rank-tracking-feature')}
                className="text-orange-600 dark:text-orange-400 font-semibold text-sm hover:underline"
              >
              Explore Flipkart keyword rank tracker
              </button>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  <Bell className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">4. WhatsApp Alerts Real-Time Notifications You'll Actually See</h3>
                  <p className="text-gray-600 dark:text-gray-400">Indian sellers don't live in their email inbox. Insydz sends intelligence directly to your WhatsApp so you act on Flipkart market changes in minutes, not days. Configure your thresholds and let Insydz guard your business around the clock.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Competitor price drop → WhatsApp alert in seconds",
                  "Keyword ranking slip → alert with recommended fix",
                  "Negative review surge → instant AI summary on WhatsApp",
                  "Stock-out opportunity alert for top competitors"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-green-700 dark:text-green-400">Real scenario:</span> A Mumbai seller was travelling when a competitor slashed prices on Flipkart Big Billion Days eve. Insydz WhatsApp alert arrived within 90 seconds. He repriced from his phone. Saved an estimated ₹80,000 in potential lost sales that weekend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              How Insydz Works
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">for Flipkart Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">No technical setup. No learning curve. Start getting Flipkart intelligence in under 2 minutes.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 -translate-y-1/2"></div>

            <div className="grid lg:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">1</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Flipkart Store</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Link your Flipkart seller account or add your product listings. Insydz automatically maps your catalogue, identifies your top competitors, and begins category-level tracking instantly.
                </p>
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-2xl p-4">
                  <Store className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">2</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Analyses Market Data</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Our AI continuously scans Flipkart for pricing changes, review patterns, keyword ranking shifts, and competitor strategies 24/7, in real time. No manual work. No spreadsheets.
                </p>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-2xl p-4">
                  <BarChart3 className="w-6 h-6 text-purple-600 mx-auto animate-pulse" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">3</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get Actionable Insights</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Instead of graphs and reports, you get plain-language actions delivered to your phone:</p>
                <div className="space-y-6 text-left">
                  {/* <br/> */}
                  <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-800 dark:text-gray-300">Competitor dropped price by 15%</span>
                  </div>
                  <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-800 dark:text-gray-300">Ranking slipped from 12 to 28</span>
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-800 dark:text-gray-300">189 reviews mention delivery issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 sm:px-12 py-6 text-sm sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group w-full sm:w-auto"
            >
              Start Free &amp; Get Flipkart Insights
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI EXAMPLE ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              What Insydz Is Worth to a
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Flipkart Seller Doing ₹12L/Month</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A conservative breakdown of what Indian Flipkart sellers recover when they have real-time intelligence instead of guesswork.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Without Insydz */}
            <div className="bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black text-red-600 mb-6 flex items-center gap-2">
             
                Without Insydz — Monthly Profit Leakage
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Late repricing (avg 2–3 day lag)", value: "−₹36,000" },
                  { label: "Untracked review drop (rating 4.1→3.6)", value: "−₹28,000" },
                  { label: "Keyword rank slip (#4→#19)", value: "−₹34,000" },
                  { label: "Manual tracking (10 hrs/week wasted)", value: "−₹16,000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-red-100 dark:border-red-900/30">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-bold text-red-600">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="font-black text-gray-900 dark:text-white text-lg">Total Monthly Leakage</span>
                  <span className="font-black text-red-600 text-2xl">−₹1,14,000</span>
                </div>
              </div>
            </div>

            {/* With Insydz */}
            <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black text-green-600 mb-6 flex items-center gap-2">
                
                With Insydz — Monthly Recovery
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Repricing within 15 minutes of alert", value: "+₹30,000" },
                  { label: "Review fixes before rating tanks", value: "+₹22,000" },
                  { label: "Keyword rank recovery (AI-guided)", value: "+₹28,000" },
                  { label: "Hours saved → growth reinvested", value: "+₹14,000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-green-100 dark:border-green-900/30">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-bold text-green-600">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="font-black text-gray-900 dark:text-white text-lg">Net Monthly Gain</span>
                  <span className="font-black text-green-600 text-2xl">+₹94,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">About Flipkart Seller Tools in India</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the best Flipkart seller analytics tool in India?",
                a: "Insydz is India's most comprehensive Flipkart seller analytics tool, designed specifically for Flipkart.com sellers. It tracks competitor pricing in INR, analyses reviews with AI, monitors keyword rankings on Flipkart, and delivers instant WhatsApp alerts — giving you actionable intelligence that your Flipkart Seller Hub cannot provide."
              },
              {
                q: "How does Insydz help Flipkart sellers track competitor prices?",
                a: "Insydz monitors 100+ competitors in your Flipkart category continuously. The moment any competitor adjusts their price, you receive a WhatsApp alert with the exact before/after figures and a suggested response — so you act within minutes, before your sales rank is affected."
              },
              {
                q: "Can Insydz improve my keyword rankings on Flipkart?",
                a: "Yes. Insydz tracks your search keyword positions on Flipkart daily. When rankings slip, you get an alert and specific listing or pricing recommendations to recover visibility. It functions as both a Flipkart performance analytics tool and an SEO optimisation assistant in one place."
              },
              {
                q: "How is Insydz different from Flipkart Seller Hub analytics?",
                a: "Flipkart Seller Hub shows you what's happening inside your own store. Insydz shows you what's happening across your entire market — competitors' pricing, their review trends, their keyword positions. The Hub tells you what happened. Insydz tells you what to do next."
              },
              {
                q: "Is Insydz useful for small or new Flipkart sellers?",
                a: "Absolutely. The free plan requires no credit card and takes 2 minutes to activate. New sellers immediately gain access to competitor pricing data and product analysis for their category — intelligence that used to require hours of manual research or expensive tools."
              },
              {
                q: "Does Insydz work during Flipkart Big Billion Days and sale events?",
                a: "This is exactly where Insydz delivers the highest value. During high-velocity sale events, competitor prices can change dozens of times a day. Insydz monitors continuously and delivers WhatsApp alerts within seconds — so you're never caught off guard during your most important selling windows of the year."
              },
              {
                q: "What Flipkart-specific problems does Insydz solve?",
                a: "Insydz addresses four core Flipkart seller problems: slow response to competitor price drops, undetected review quality deterioration, invisible keyword ranking slippage, and time wasted on manual market tracking. All four are automated — delivered to your WhatsApp as clear, actionable alerts."
              },
            ].map((faq, i) => (
              <FAQAccordion key={i} faqs={[{ q: faq.q, a: faq.a }]} accentColor="blue" variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: ICP-BASED CTAs ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Ready to Win on Flipkart?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join smart Flipkart sellers who use data, not guesswork, to grow their business whatever stage you're at.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* For New Sellers */}
            <div className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For New Sellers</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Just starting on Flipkart? Get competitor intelligence and product insights from day one. The free plan costs nothing and gives you an unfair data advantage over sellers still doing things manually.
              </p>
              <Button
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full"
              >
                Start Free No Card Needed →
              </Button>
            </div>

            {/* For Growing Sellers */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-500 rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              <div className="w-14 h-14 bg-background opacity-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-7 h-7 text-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">For Growing Sellers</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Scaling to ₹5L–₹50L monthly? At your revenue level, every pricing delay and ranking drop is real money lost. The Growth Plan delivers full Flipkart competitor tracking, AI pricing, review intelligence, and WhatsApp alerts.
              </p>
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full bg-white hover:bg-gray-100 text-blue-700 font-bold rounded-full"
              >
                Try Growth Plan →
              </Button>
            </div>

            {/* For Agencies */}
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Agencies &amp; Brand Managers</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Managing multiple Flipkart brands? Multi-account tracking, portfolio-level intelligence, and white-label reporting built for agencies and brand managers running Flipkart operations at scale.
              </p>
              <Button
                onClick={() => router.push('/about/contact-us')}
                variant="outline"
                className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full"
              >
                Book a Demo →
              </Button>
            </div>
          </div>
          <TrustBadges theme="dark" />
        </div>
      </section>
      {/* Footer */}

      <FadeInStyles />
    </div>
  );
}
