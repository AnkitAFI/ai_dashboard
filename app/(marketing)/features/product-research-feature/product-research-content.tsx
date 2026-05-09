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
  Lightbulb, Package, DollarSign, Users,
  Layers, ThumbsUp, MessageCircle, Star,
  LayoutGrid, Flame, ArrowLeft,
  Clock, Filter, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function ProductResearchFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    { question: "How does AI product research work?", answer: "Insydz AI analyzes millions of products across Amazon & Flipkart, evaluating demand, competition, pricing trends, and profit margins to surface high-potential opportunities you can capitalize on." },
    { question: "Will I find products that aren't already saturated?", answer: "Yes! Our AI identifies emerging trends and underserved niches before they become oversaturated. You get early access to opportunities competitors haven't discovered yet." },
    { question: "Can I filter by specific criteria?", answer: "Absolutely. Filter by category, price range, competition level, profit margin, search volume, and more. Find products that match your exact business goals." },
    { question: "Does this work for private label sellers?", answer: "Yes! Product research is perfect for private label sellers looking for their next winning product. See what's selling, what margins look like, and where white space exists." },
    { question: "Is product research available on the free plan?", answer: "Yes! The free plan includes limited product research queries. Upgrade for unlimited searches, advanced filters, and AI-powered opportunity scoring." },
    { question: "How is this different from manual research?", answer: "Manual research takes weeks and misses hidden gems. Our AI analyzes thousands of data points in seconds, revealing opportunities you'd never find manually." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-indigo-700">Product Research Software</h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                AI Product Research
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">Find Winners</span>
                <br />
                Before Competitors Do
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI discovers high-demand, low-competition products with real profit potential.
                <span className="text-indigo-700 font-semibold"> Stop guessing. Start selling products that actually make money.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  Start Free →
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-700 dark:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["AI opportunity scoring", "Profit margin analysis", "Trend detection"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-indigo-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Product Opportunities</h3>
                    <span className="text-[10px] sm:text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Analyzed
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-xl p-4 shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1 leading-relaxed">Wireless Phone Chargers</p>
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed italic">Electronics › Mobile Accessories</p>
                        </div>
                        <div className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">Score: 94</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        {[{ label: "Demand", value: "High", color: "text-green-600" }, { label: "Competition", value: "Low", color: "text-green-600" }, { label: "Margin", value: "45%", color: "text-green-600" }].map((m, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded px-2 py-1.5 shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{m.label}</p>
                            <p className={`font-black ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-green-600 animate-pulse" />
                        <p className="text-[10px] text-green-600 font-bold leading-relaxed">Growing trend - Act fast!</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-sm opacity-90">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1 leading-relaxed">Eco-Friendly Water Bottles</p>
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed italic">Home & Kitchen › Drinkware</p>
                        </div>
                        <div className="bg-yellow-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">Score: 78</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        {[{ label: "Demand", value: "Medium", color: "text-yellow-600" }, { label: "Competition", value: "Low", color: "text-green-600" }, { label: "Margin", value: "38%", color: "text-yellow-600" }].map((m, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded px-2 py-1.5 shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{m.label}</p>
                            <p className={`font-black ${m.color}`}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm flex items-center gap-1 leading-relaxed"><Lightbulb className="w-4 h-4" /> 1,247 Found</p>
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
              Why Most Product Launches <br /><span className="text-red-600">Fail Within 6 Months</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
            {[
              { icon: <Search className="w-8 h-8" />, title: "Picking products based on gut feeling", color: "from-red-500 to-orange-500" },
              { icon: <Users className="w-8 h-8" />, title: "Entering oversaturated markets", color: "from-orange-500 to-yellow-500" },
              { icon: <DollarSign className="w-8 h-8" />, title: "Low margins kill profitability", color: "from-yellow-500 to-orange-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Weeks wasted on manual research", color: "from-orange-500 to-red-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all group flex flex-col items-center text-center h-full shadow-sm">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg mb-16">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed"><span className="text-red-600">70% of new products fail</span> in their first year</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">Because sellers pick products without data.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"><X className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">Manual Research</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed italic">Weeks of guessing, high failure rate</p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {["Limited to surface-level data", "Miss emerging opportunities", "Can't analyze at scale"].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"><Check className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">AI Research</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed italic">Minutes to find winners, data-backed success</p>
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {["Deep market analysis in seconds", "Spot trends before competitors", "Analyze thousands of products"].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
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
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">How AI Product Research Works</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz AI scans millions of products to find opportunities with high demand and low competition
              <span className="text-indigo-700 dark:text-indigo-400 font-bold"> so you launch products that actually sell.</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Set your criteria", detail: "Category, budget, margin goals", icon: <Filter className="w-10 h-10" /> },
              { step: "2", title: "AI analyzes market data", detail: "Demand, competition, trends, pricing", icon: <Brain className="w-10 h-10" /> },
              { step: "3", title: "Opportunities ranked", detail: "Scored by profit potential", icon: <Target className="w-10 h-10" /> },
              { step: "4", title: "Launch with confidence", detail: "Data-backed product decisions", icon: <Award className="w-10 h-10" /> }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-indigo-400 transition-all group flex flex-col h-full">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-black text-white shadow-md">{item.step}</div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-6 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">{item.icon}</div>
                <p className="text-gray-900 dark:text-white font-bold mb-3 leading-relaxed flex-grow">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Depth */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">Powerful Product Intelligence</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { feature: "AI Opportunity Scoring", benefit: "Every product ranked by potential", icon: <Star className="w-8 h-8" />, color: "from-indigo-500 to-purple-500" },
              { feature: "Demand Analysis", benefit: "See actual search volume & trends", icon: <BarChart3 className="w-8 h-8" />, color: "from-purple-500 to-pink-500" },
              { feature: "Competition Assessment", benefit: "Identify low-competition niches", icon: <Users className="w-8 h-8" />, color: "from-red-500 to-orange-500" },
              { feature: "Profit Margin Calculator", benefit: "Know profitability before launch", icon: <DollarSign className="w-8 h-8" />, color: "from-green-500 to-emerald-500" },
              { feature: "Trend Detection", benefit: "Catch rising products early", icon: <TrendingUp className="w-8 h-8" />, color: "from-orange-500 to-red-500" },
              { feature: "Category Insights", benefit: "Best-performing categories revealed", icon: <Layers className="w-8 h-8" />, color: "from-blue-500 to-cyan-500" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-indigo-400 transition-all group shadow-sm hover:shadow-md">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">{item.feature}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2 text-sm leading-relaxed font-medium">
                  <ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />{item.benefit}
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
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">Start Free. Find Winning Products.</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 rounded-3xl p-8 sm:p-12 shadow-2xl transition-all hover:shadow-indigo-500/10">
            <div className="text-center mb-10">
              <div className="inline-flex items-baseline gap-2 mb-4">
                <span className="text-7xl font-black text-indigo-600 leading-none">₹0</span>
                <span className="text-2xl text-gray-500 dark:text-gray-400 font-bold">/ Forever</span>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-bold leading-relaxed">Free Plan Includes:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {["Limited product research queries", "AI opportunity scoring", "Basic demand & competition data", "Amazon & Flipkart coverage"].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-indigo-300">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-bold leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-10 border border-indigo-100 dark:border-indigo-800 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                <span className="font-black text-indigo-600 uppercase tracking-wider mr-2">Upgrade Teaser:</span> Unlock unlimited searches, advanced filters, and trend alerts on paid plans.
              </p>
            </div>
            <div className="text-center">
              <Link href="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black px-12 py-5 text-lg rounded-full shadow-2xl w-full sm:w-auto inline-flex items-center justify-center transition-all hover:scale-105">
                Start Product Research Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            Product Research – <span className="text-indigo-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-400 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-indigo-50/30 dark:bg-indigo-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Guessing Products.
            <br />
            <span className="text-indigo-100">Find Winners with AI.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get data-backed product opportunities for Amazon India and Flipkart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-indigo-700 font-black px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-12 py-5 rounded-full border-2 border-indigo-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              Explore All Features →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ AI opportunity scoring &nbsp;·&nbsp; ✓ Native support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-indigo-300 dark:border-indigo-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
