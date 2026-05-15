"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, RefreshCw, Eye, 
  Sparkles, ChevronDown, LineChart, Award,
  Hash, Activity, Users, DollarSign,
  Package, LayoutGrid, Flame, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function KeywordRankTrackingFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    { question: "How often are keyword rankings updated?", answer: "Rankings are updated daily for all tracked keywords. Premium plans offer hourly updates for competitive keywords to catch changes immediately." },
    { question: "Can I track competitor keywords too?", answer: "Yes! Insydz automatically identifies high-performing keywords your competitors rank for, so you can optimize for the same opportunities." },
    { question: "Does this work for both Amazon & Flipkart?", answer: "Absolutely! Track keyword rankings across both Amazon India and Flipkart with marketplace-specific insights and recommendations." },
    { question: "What if my product doesn't rank yet?", answer: "Insydz shows you which keywords you should target based on relevance, search volume, and competition — helping you rank faster." },
    { question: "Is keyword tracking available on the free plan?", answer: "Yes! The free plan includes basic keyword tracking for limited keywords. Upgrade for unlimited tracking and advanced competitor analysis." },
    { question: "How does this help improve sales?", answer: "Higher rankings = more visibility = more sales. By tracking and optimizing for the right keywords, you increase organic traffic and conversions without ads." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-blue-700">Keyword Rank Tracking Tool</h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Keyword & Rank Tracking
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">Know Where You Rank</span>
                <br />
                for Every Keyword
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Track rankings for target keywords across Amazon & Flipkart automatically.
                <span className="text-blue-700 font-semibold"> See what's working, find opportunities, and optimize for maximum visibility.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  Start Free →
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-blue-600 text-blue-700 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Daily rank updates", "Competitor keyword analysis", "Amazon & Flipkart support"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-blue-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Keyword Rankings</h3>
                    <span className="text-[10px] sm:text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Live Tracking
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">wireless earbuds bluetooth</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded font-black shadow-sm">Rank #3</span>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        <span>Volume: 45K/mo</span>
                        <span className="text-green-600 font-bold">↑ 5 positions</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">noise cancelling headphones</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded font-black shadow-sm">Rank #12</span>
                          <Activity className="w-4 h-4 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        <span>Volume: 28K/mo</span>
                        <span className="italic">No change</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-2xl p-5 mt-6 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-sm text-white">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">Opportunity Found</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">"budget earbuds" - Low competition, 18K searches</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">Tracking 47</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Sellers Struggle <br /><span className="text-red-600">Without Rank Tracking</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
            {[
              { icon: <Eye className="w-8 h-8" />, title: "No idea where products actually rank", color: "from-red-500 to-orange-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Manually checking rankings wastes hours", color: "from-orange-500 to-yellow-500" },
              { icon: <TrendingDown className="w-8 h-8" />, title: "Miss ranking drops until sales crash", color: "from-yellow-500 to-orange-500" },
              { icon: <Search className="w-8 h-8" />, title: "Don't know which keywords to target", color: "from-orange-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col items-center text-center h-full shadow-sm">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg mb-16">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">Products lose <span className="text-red-600">60-80% of organic traffic</span> when rankings drop</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">And most sellers don't notice until it's too late.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"><X className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">Manual Checking</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed italic">Hours wasted, data already outdated</p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {["Time-consuming daily checks", "No historical data or trends", "Limited to few keywords"].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"><Check className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">Automated Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed italic">Real-time insights, always accurate</p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {["Daily automatic updates", "Historical trends & insights", "Unlimited keyword tracking"].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">How Keyword Rank Tracking Works</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz automatically tracks your keyword rankings daily and alerts you to changes
              <span className="text-blue-700 dark:text-blue-400 font-bold"> so you can optimize before rankings drop and traffic disappears.</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Add target keywords", detail: "Or let AI suggest high-opportunity keywords", icon: <Hash className="w-10 h-10" /> },
              { step: "2", title: "Insydz tracks rankings daily", detail: "Across Amazon & Flipkart automatically", icon: <RefreshCw className="w-10 h-10" /> },
              { step: "3", title: "Monitor rank changes", detail: "See what's improving or dropping", icon: <BarChart3 className="w-10 h-10" /> },
              { step: "4", title: "Get alerts & insights", detail: "Dashboard + WhatsApp notifications", icon: <Bell className="w-10 h-10" /> }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-blue-400 transition-all group flex flex-col h-full">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-black text-white shadow-md">{item.step}</div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">{item.icon}</div>
                <p className="text-gray-900 dark:text-white font-bold mb-3 leading-relaxed flex-grow">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Keyword Intelligence */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">Advanced Keyword Intelligence</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { feature: "Daily Rank Updates", benefit: "Never miss a ranking change", icon: <RefreshCw className="w-8 h-8" />, color: "from-blue-500 to-cyan-500" },
              { feature: "Historical Rank Data", benefit: "Track trends over weeks & months", icon: <LineChart className="w-8 h-8" />, color: "from-purple-500 to-pink-500" },
              { feature: "Competitor Keyword Analysis", benefit: "See what keywords they rank for", icon: <Users className="w-8 h-8" />, color: "from-red-500 to-orange-500" },
              { feature: "Search Volume Insights", benefit: "Prioritize high-traffic keywords", icon: <BarChart3 className="w-8 h-8" />, color: "from-green-500 to-emerald-500" },
              { feature: "Keyword Opportunity Finder", benefit: "AI suggests low-competition keywords", icon: <Sparkles className="w-8 h-8" />, color: "from-orange-500 to-red-500" },
              { feature: "Rank Change Alerts", benefit: "Get notified of big movements", icon: <Bell className="w-8 h-8" />, color: "from-indigo-500 to-purple-500" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-blue-400 transition-all group shadow-sm hover:shadow-md">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm leading-relaxed font-medium">
                  <ArrowRight className="w-4 h-4 text-blue-600" />{item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLG Entry Point */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">Start Free. Track Rankings Today.</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-3xl p-8 sm:p-12 shadow-2xl transition-all hover:shadow-blue-500/10">
            <div className="text-center mb-10">
              <div className="inline-flex items-baseline gap-2 mb-4">
                <span className="text-7xl font-black text-blue-600 leading-none">₹0</span>
                <span className="text-2xl text-gray-500 dark:text-gray-400 font-bold">/ Forever</span>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-bold leading-relaxed">Free Plan Includes:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {["Track limited keywords", "Daily rank updates", "Amazon & Flipkart support", "Basic keyword suggestions"].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-300">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-bold leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-10 border border-blue-100 dark:border-blue-800 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                <span className="font-black text-blue-600 uppercase tracking-wider mr-2">Upgrade Teaser:</span> Unlock unlimited keywords, hourly updates, and competitor analysis on paid plans.
              </p>
            </div>
            <div className="text-center">
              <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black px-12 py-5 text-lg rounded-full shadow-2xl w-full sm:w-auto inline-flex items-center justify-center transition-all hover:scale-105">
                Start Tracking Keywords Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            Keyword Tracking – <span className="text-blue-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-400 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-blue-50/30 dark:bg-blue-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Guessing Rankings.
            <br />
            <span className="text-blue-100">Track Every Keyword Automatically.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Boost your organic traffic on Amazon India and Flipkart with real-time rank tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-blue-700 font-black px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-12 py-5 rounded-full border-2 border-blue-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              View All Features →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Daily rank updates &nbsp;·&nbsp; ✓ Native support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-300 dark:border-blue-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
