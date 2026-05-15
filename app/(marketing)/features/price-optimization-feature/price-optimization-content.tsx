"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  DollarSign, X, Check, RefreshCw, Eye,
  Sparkles, ChevronDown, LineChart, Percent,
  ShoppingCart, Award, Calculator, Maximize2,
  Brain, ThumbsUp, MessageCircle, Search,
  Package, Clock, Users, LayoutGrid, Flame, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function PriceOptimizationFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const painPoints = [
    {
      icon: <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Guessing prices based on gut feeling",
      description: "Without data on competitor movements, Buy Box probability, or demand velocity, every pricing decision is a bet.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Panic discounting kills margins",
      description: "Sellers who see Buy Box drop immediately cut price often below their own cost, especially after Amazon fees.",
      color: "from-orange-500 to-yellow-500",
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Losing Buy Box to a competitor who priced ₹10 smarter",
      description: "The Buy Box isn't won by the cheapest seller. It's won by the seller who understands the algorithm.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Percent className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Overpricing = zero sales",
      description: "Hold too high during a demand dip and you're invisible. No clicks, no sales, no data and a ranking that slides.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const outcomes = [
    { icon: <DollarSign />, title: "Increase profit per sale", detail: "AI finds the highest profitable price point the market will bear without losing sales velocity.", color: "text-green-600" },
    { icon: <ShoppingCart />, title: "Win more Buy Boxes", detail: "Competitive without panic discounting because the AI knows exactly how low to go and no lower.", color: "text-blue-600" },
    { icon: <TrendingUp />, title: "Boost revenue 15–30%", detail: "Smart pricing means more conversions at better margins. Revenue compounds faster than manual pricing.", color: "text-emerald-600" },
    { icon: <Shield />, title: "Protect margins automatically", detail: "Set your floor price once. AI respects it always. Never sell below your profit target again.", color: "text-purple-600" },
    { icon: <Award />, title: "Beat competitors strategically", detail: "Data wins over guesswork. Know when a competitor has priced themselves out of the Buy Box.", color: "text-orange-600" },
    { icon: <Maximize2 />, title: "Scale without manual work", detail: "AI optimizes pricing 24/7 for 10 products or 500. Your time scales. The results don't drop.", color: "text-indigo-600" },
  ];

  const indiaPains = [
    {
      title: "Most Indian sellers price by watching one competitor",
      description: "The real Buy Box is won by understanding all active competitors, demand velocity, your category's price elasticity, and Buy Box probability simultaneously. Watching one ASIN manually misses 80% of what's actually driving the algorithm.",
    },
    {
      title: "Festive season pricing is the hardest to get right manually",
      description: "During Diwali, Big Billion Days, and Great Indian Festival, demand multipliers shift category dynamics hourly. A price that wins Buy Box at 2pm can lose it by 6pm as competitors stack discounts. Manual pricing can't keep pace with hourly shifts.",
    },
    {
      title: "Margin floor calculations are done wrong or not at all",
      description: "Most sellers know their purchase cost. Few correctly account for Amazon commission (8–15%), GST implications, fulfilment fees, return rates, and ad spend before setting a margin floor. AI does all of this automatically in INR, every time.",
    },
    {
      title: "Global pricing tools don't understand Flipkart or Indian demand signals",
      description: "Western dynamic pricing platforms are calibrated for Amazon.com and European retail. They don't model Flipkart Buy Box mechanics, Indian festive demand multipliers, or INR fee structures. An Indian seller using them is optimizing against the wrong market.",
    },
  ];

  const intelligenceModules = [
    { feature: "Dynamic Price Recommendations", result: "AI adjusts to market changes hourly not when you remember to check", icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-blue-500 to-cyan-500" },
    { feature: "Buy Box Win Probability", result: "See exact Buy Box win probability at any price point before committing", icon: <Percent className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-purple-500 to-pink-500" },
    { feature: "Margin Protection Rules", result: "Set floor once. AI respects it unconditionally even during a 2am flash sale", icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-red-500 to-orange-500" },
    { feature: "Competitor Price Analysis", result: "Track all active competitors simultaneously not just the one you last checked", icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-green-500 to-emerald-500" },
    { feature: "Seasonal Demand Detection", result: "Diwali, Big Billion Days, GIF demand multipliers built into every recommendation", icon: <LineChart className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-orange-500 to-red-500" },
    { feature: "A/B Price Testing", result: "Test two price points simultaneously find the winner with data, not instinct", icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-indigo-500 to-purple-500" },
  ];

  const faqs = [
    {
      question: "How does AI price optimization work?",
      answer: "Insydz AI scans competitor prices, demand signals, Buy Box win probability at different price points, seasonal demand multipliers, and your margin floor every hour. It then recommends the price that maximizes revenue and Buy Box probability while staying above your profit threshold. The recommendation appears on your dashboard and as a WhatsApp notification. The AI recalculates automatically as market conditions change no manual intervention required.",
    },
    {
      question: "Will I lose the Buy Box if prices are optimized?",
      answer: "No. the AI is specifically designed to maximize Buy Box win probability, not just lower your price. Every recommendation includes the predicted Buy Box probability at that price point. In testing with Indian sellers, Insydz-optimized pricing increased Buy Box win rates from an average of 51% to 74% over 45 days while maintaining or improving margins because the AI found the optimal competitive position rather than blindly following competitors down.",
    },
    {
      question: "Can I set minimum profit margins?",
      answer: "Yes. margin floor protection is core to how Insydz price optimization works. You set your minimum acceptable margin or absolute floor price per product. Insydz automatically accounts for Amazon.in commission, fulfilment fees, and your purchase cost when calculating this floor. No recommendation will ever suggest a price below your floor even during a competitor price war or a flash sale at 2am when you're asleep.",
    },
    {
      question: "Does this work for seasonal products?",
      answer: "Yes. Indian festive demand multipliers (Diwali, Big Billion Days, Great Indian Festival, Republic Day, Holi) are built into every hourly recommendation. During high-demand seasons, the AI recognizes that higher prices can still win the Buy Box because all sellers are operating at elevated demand and recommends the most profitable price accordingly, not a conservative one based on off-season dynamics.",
    },
    {
      question: "Is price optimization available on the free plan?",
      answer: "Yes. The free plan includes AI price recommendations for a limited number of products, Buy Box probability analysis, margin protection settings, and basic optimization alerts permanently, with no credit card required and no expiry date. Paid plans (₹1,999/month and ₹2,999/month) unlock automated price changes, unlimited products, A/B price testing, and advanced seasonal demand detection.",
    },
    {
      question: "How is this different from competitor price tracking?",
      answer: "Competitor price tracking tells you what competitors are charging. AI price optimization tells you what you should charge accounting for your margin, Buy Box probability, demand signals, and competitive position simultaneously. Price tracking is reactive. Price optimization is proactive. For Indian sellers on Amazon India and Flipkart, both are useful but optimization drives revenue. Tracking alone does not.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-green-700">Price Optimization Software</h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                AI Price Optimization 
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Maximize Profit
                </span>
                <br />
                Without Losing Sales
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI-powered <strong>price optimization software</strong> that finds the perfect price
                point for every product, every hour. Win Buy Box, protect margins, and increase
                revenue all at once.{" "}
                <span className="text-green-700 dark:text-green-400 font-semibold">
                  No manual repricing. No gut feeling. No panic discounting.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  Start Free →
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["AI-powered recommendations", "Margin protection built-in", "Buy Box optimization"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Price Recommendation Widget */}
            <div className="relative mt-8 sm:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-green-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">AI Price Recommendation</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Brain className="w-3 h-3" /> AI Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Current Price</span>
                        <span className="text-2xl font-black text-gray-700 dark:text-gray-300">₹1,499</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed font-medium">Buy Box: 45% | Margin: 18%</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-green-600 animate-pulse" />
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">AI Recommended</span>
                        <span className="text-2xl font-black text-green-700 dark:text-green-400">₹1,349</span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-500 font-bold leading-relaxed">Buy Box: 78% ↑ | Margin: 22% ↑</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 text-center shadow-sm">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 leading-relaxed">Revenue Impact</div>
                      <div className="text-xl font-black text-green-600">+32%</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 text-center shadow-sm">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 leading-relaxed">Profit Impact</div>
                      <div className="text-xl font-black text-emerald-600">+18%</div>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-4 rounded-xl text-base shadow-lg transition-all">
                    Apply Recommended Price →
                  </Button>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm flex items-center gap-1 leading-relaxed">
                    <Sparkles className="w-4 h-4" /> AI Optimized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHY MOST SELLERS LEAVE MONEY ON THE TABLE ───────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Most Sellers <br />
              <span className="text-red-600">Leave Money on the Table</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Wrong pricing isn't just about being too expensive. It's about every rupee of margin
              lost to panic discounting, every Buy Box lost to a competitor who priced ₹10 smarter,
              and every sale missed because you held the price too high during a demand surge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {painPoints.map((pain, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-400 hover:shadow-xl transition-all group flex flex-col h-full shadow-sm"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                  {pain.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base sm:text-lg leading-relaxed">{pain.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{pain.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg mb-16">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
              Wrong pricing costs sellers{" "}
              <span className="text-red-600">15–35% of potential revenue</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">Every day, across every category on Amazon India and Flipkart.</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              How AI Price Optimization Works
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz AI analyzes thousands of data points every hour to recommend the perfect price
              balancing competitiveness, margins, and Buy Box win probability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "AI scans market data", detail: "Competitor prices, demand signals, and seasonality updated every hour, not once a day.", icon: <Eye className="w-10 h-10" /> },
              { step: "2", title: "Analyzes Buy Box dynamics", detail: "Win probability calculated at multiple price points showing the optimal competitive position.", icon: <Brain className="w-10 h-10" /> },
              { step: "3", title: "Calculates optimal price", detail: "Maximum profit while staying competitive margin floor built into every calculation.", icon: <Calculator className="w-10 h-10" /> },
              { step: "4", title: "Recommends & alerts you", detail: "Dashboard recommendation + WhatsApp notification act in seconds from anywhere.", icon: <Bell className="w-10 h-10" /> },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-green-400 transition-all group flex flex-col h-full">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-black text-white shadow-md">
                  {item.step}
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-6 mb-6 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  {item.icon}
                </div>
                <p className="text-gray-900 dark:text-white font-bold mb-3 leading-relaxed flex-grow">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: OUTCOMES ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
              What You Can Do with Price Optimization
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Six outcomes Indian sellers get from switching to AI-powered pricing in the first 30 days.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((outcome, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center ${outcome.color} shadow-sm`}>
                    {outcome.icon}
                  </div>
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base sm:text-lg leading-relaxed">{outcome.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: AI INTELLIGENCE MODULES ─────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
              Advanced AI Pricing Intelligence
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Six intelligence modules working simultaneously so every price recommendation is
              built on the full picture, not a single data point.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {intelligenceModules.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-green-400 transition-all group shadow-sm hover:shadow-md"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2 text-sm leading-relaxed font-medium">
                  <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> {item.result}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            Price Optimization – <span className="text-green-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-green-400 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-green-600 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-green-50/30 dark:bg-green-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Panic Discounting.
            <br />
            <span className="text-green-100">Start Optimizing for Profit.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get AI-powered price recommendations for Amazon India and Flipkart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-green-700 font-black px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="bg-green-700 hover:bg-green-800 text-white font-bold px-12 py-5 rounded-full border-2 border-green-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              Explore Features →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Hourly recommendations &nbsp;·&nbsp; ✓ Margin safe</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-green-300 dark:border-green-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
