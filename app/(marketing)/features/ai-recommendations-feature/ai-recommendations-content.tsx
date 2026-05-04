"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, Eye, 
  Sparkles, ChevronDown, 
  Brain, Package, DollarSign,
  ThumbsUp, MessageCircle, Star,
  Clock, Maximize2, Gauge,
  LayoutGrid, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function AIRecommendationsFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => router.push("/signup");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    { question: "How does AI generate recommendations?", answer: "Insydz AI analyzes your product data, competitor behavior, market trends, and sales patterns to provide actionable recommendations tailored to your specific products and goals." },
    { question: "Are recommendations updated automatically?", answer: "Yes! AI continuously monitors your products and market conditions, updating recommendations as situations change. You'll get fresh insights daily." },
    { question: "Can I implement recommendations with one click?", answer: "Many recommendations can be applied directly from the dashboard. For others, we provide step-by-step guidance to make implementation easy." },
    { question: "What types of recommendations will I get?", answer: "You'll get recommendations for pricing, keywords to add/remove, inventory management, listing optimization, competitor response, and more." },
    { question: "Is this available on the free plan?", answer: "Yes! The free plan includes basic AI recommendations. Upgrade for advanced recommendations, priority actions, and automated implementation." },
    { question: "How accurate are the AI recommendations?", answer: "Our AI is trained on millions of successful seller actions. Recommendations are data-backed and proven to increase sales and profit when implemented." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-pink-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-rose-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
                <span className="text-xs sm:text-sm font-medium text-pink-700">Feature Spotlight</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                AI Recommendations
                <br />
                <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 bg-clip-text text-transparent">Get Smart Actions,</span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Not Just Data</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI analyzes your products and tells you exactly what to do next.
                <span className="text-pink-700 font-semibold"> Pricing, keywords, inventory, listing optimization all personalized to your business.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base md:text-lg rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all group">
                  Get AI Recommendations Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="w-full sm:w-auto border-2 border-pink-600 text-pink-700 dark:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base md:text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
                {["Actionable insights daily", "Personalized to your products", "One-click implementation"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl transition-all hover:shadow-pink-500/10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">AI Recommendations</h3>
                    <span className="text-[10px] sm:text-xs bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 px-2 sm:px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Brain className="w-3 h-3" /> AI Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* High priority card */}
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-400 dark:border-pink-600 rounded-lg p-4 shadow-sm group hover:scale-[1.02] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"><Zap className="w-4 h-4 text-white" /></div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed">Price Adjustment Needed</p>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Wireless Earbuds Pro</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm">High Priority</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Lower price to ₹1,349 to win Buy Box. Expected impact: +42% sales</p>
                      <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold py-2 rounded-lg shadow-md">Apply Price Change →</Button>
                    </div>
                    {/* Medium priority card */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-sm group hover:scale-[1.02] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"><Search className="w-4 h-4 text-white" /></div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed">Add Missing Keywords</p>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Gaming Mouse X1</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">Medium</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">Add "rgb gaming mouse" to backend keywords</p>
                      <div className="text-[10px] sm:text-xs text-blue-600 font-bold leading-relaxed">+15K monthly searches</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-pink-600 leading-relaxed">12</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Active Recs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 leading-relaxed">8</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Done Today</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl hidden sm:block">
                  <p className="text-white font-bold text-xs sm:text-sm flex items-center gap-1 leading-relaxed"><Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> AI Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Sellers Drown <br /><span className="text-red-600">in Data Without Action</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Too much data, no clear actions", color: "from-red-500 to-orange-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Hours analyzing what to do next", color: "from-orange-500 to-yellow-500" },
              { icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Missing opportunities hidden in data", color: "from-yellow-500 to-orange-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "No idea what to prioritize", color: "from-orange-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-pink-400 hover:shadow-lg transition-all group flex flex-col h-full shadow-sm">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base leading-relaxed flex-grow">{pain.title}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">Sellers waste <span className="text-red-600">10+ hours weekly</span> analyzing data</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">Instead of taking action that grows their business.</p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">How AI Recommendations Work</h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz AI continuously analyzes your business and surfaces actionable recommendations
              <span className="text-pink-700 font-semibold"> ranked by priority, with clear next steps.</span>
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 -translate-y-1/2 z-0 opacity-20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
              {[
                { step: "1", title: "AI monitors your business", detail: "Products, competitors, market trends", icon: <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "2", title: "Identifies opportunities", detail: "Price changes, keywords, inventory", icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "3", title: "Generates recommendations", detail: "Ranked by impact & urgency", icon: <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> },
                { step: "4", title: "You implement fast", detail: "One-click or simple steps", icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-pink-100 dark:border-pink-900/30 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all group flex flex-col h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-base font-black text-white shadow-md group-hover:scale-110 transition-transform">{item.step}</div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-5 mb-5 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">{item.icon}</div>
                  <p className="text-gray-900 dark:text-white font-bold text-sm sm:text-base mb-2 leading-relaxed flex-grow">{item.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-sm sm:text-lg rounded-full shadow-2xl group transition-all">
              Get Your First Recommendations Free
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FEATURE DEPTH ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-relaxed">Smart AI-Powered Insights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { feature: "Price Recommendations", benefit: "Win Buy Box without losing margin", icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-green-500 to-emerald-500" },
              { feature: "Keyword Optimization", benefit: "Add high-impact keywords", icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-blue-500 to-cyan-500" },
              { feature: "Inventory Alerts", benefit: "Avoid stockouts & overstocking", icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-orange-500 to-red-500" },
              { feature: "Listing Improvements", benefit: "Boost conversion with better copy", icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-purple-500 to-pink-500" },
              { feature: "Competitor Responses", benefit: "React to competitor moves", icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-red-500 to-orange-500" },
              { feature: "Priority Actions", benefit: "Know what to do first", icon: <Gauge className="w-6 h-6 sm:w-8 sm:h-8" />, color: "from-indigo-500 to-purple-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-pink-400 hover:shadow-xl transition-all group flex flex-col h-full shadow-sm">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-3 text-xs sm:text-sm leading-relaxed flex-grow">
                  <ArrowRight className="w-4 h-4 text-pink-600 flex-shrink-0" />{item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-10 sm:mb-16 leading-relaxed">
            AI Recommendations – <span className="text-pink-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-pink-300 dark:hover:border-pink-600 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-pink-50/30 dark:bg-pink-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Juggling Dashboards.
            <br />
            <span className="text-pink-100">Start Taking Action.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get personalized AI recommendations for your Amazon India or Flipkart business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-pink-700 font-bold px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/pricing" className="bg-pink-700 hover:bg-pink-800 text-white font-bold px-12 py-5 rounded-full border-2 border-pink-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              View Pricing →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-pink-300 dark:border-pink-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
          Start Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
