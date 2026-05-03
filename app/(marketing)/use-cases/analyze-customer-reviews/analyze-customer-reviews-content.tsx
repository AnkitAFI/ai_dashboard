"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search,
  ChevronRight, Star, AlertCircle, ChevronDown,
  ThumbsUp, ThumbsDown, Award, TrendingDown, Heart, Frown,
  ArrowLeft, Briefcase, Globe, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const FAQItem = ({ q, a, index, openFaq, toggleFaq }: { q: string; a: string; index: number; openFaq: number | null; toggleFaq: (i: number) => void; }) => (
  <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm">
    <button onClick={() => toggleFaq(index)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
      <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg leading-relaxed">{q}</span>
      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
    </button>
    {openFaq === index && (
      <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-3 sm:pt-4 text-xs sm:text-sm sm:text-base">{a}</p>
      </div>
    )}
  </div>
);

export default function AnalyzeCustomerReviewsPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => router.push("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    { q: "How does Insydz analyse customer reviews on Amazon India and Flipkart?", a: "Insydz's AI reads every customer review yours and any competitor's groups similar feedback into clusters ranked by frequency, and delivers: sentiment breakdown (positive/neutral/negative), top complaint themes with review counts, and top praise themes. Complete analysis in under 2 minutes." },
    { q: "Can I analyse competitor product reviews with Insydz?", a: "Yes. Add any competitor ASIN or Flipkart listing and the AI analyses their reviews the same way it analyses yours. This is one of the most powerful ways new sellers use the tool before their first launch building competitor weaknesses into product advantages before day one." },
    { q: "How many reviews can Insydz analyse at once?", a: "From 50 to 50,000+ reviews in under 2 minutes. The more reviews a product has, the more statistically reliable the complaint clusters become. Insydz processes over 250,000 reviews across Indian marketplaces daily." },
    { q: "Does the review analysis work in Hindi and regional Indian languages?", a: "Yes. Insydz reads English, Hindi, Hinglish, and other Indian regional languages. Reviews in mixed language very common among Indian buyers are accurately processed and included in all analysis." },
    { q: "How is Insydz different from reading reviews manually?", a: "Manual reading samples 20–30 reviews impressionistic and inaccurate. Insydz reads every review, groups similar feedback automatically, and ranks complaints by frequency. You get statistical insight, not impressions." },
    { q: "Can Insydz alert me when new negative review patterns appear?", a: "Yes. Set ongoing monitoring for any product and receive WhatsApp alerts when a new negative theme appears across more than a threshold number of reviews before it becomes a visible rating drop and organic rank penalty." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-15 sm:opacity-20">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-pink-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-purple-700">250,000+ Reviews Analysed Daily 🇮🇳</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Turn Customer Reviews Into
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  Actionable Insights
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>customer review analysis tool</strong> for Amazon and Flipkart sellers. Insydz analyses thousands of reviews with AI to show you what customers really want
                <span className="text-purple-700 dark:text-purple-400 font-semibold"> so you can improve products, fix issues, and boost ratings.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
                  Analyse Reviews Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-purple-600 text-purple-700 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-all hover:shadow-purple-500/10">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-base sm:text-lg leading-relaxed">Review Sentiment Analysis</h3>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {[
                    { icon: <ThumbsUp className="w-5 h-5 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mx-auto mb-1 sm:mb-2" />, pct: "68%", label: "Positive", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700", textCls: "text-green-600 dark:text-green-400" },
                    { icon: <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-1 sm:mb-2" />, pct: "22%", label: "Neutral", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700", textCls: "text-yellow-600 dark:text-yellow-400" },
                    { icon: <ThumbsDown className="w-5 h-5 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 mx-auto mb-1 sm:mb-2" />, pct: "10%", label: "Negative", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700", textCls: "text-red-600 dark:text-red-400" },
                  ].map((s, i) => (
                    <div key={i} className={`text-center p-2.5 sm:p-4 ${s.bg} border rounded-xl transition-all`}>
                      {s.icon}
                      <div className={`text-lg sm:text-2xl font-bold ${s.textCls} leading-relaxed`}>{s.pct}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">Top Complaint Clusters</p>
                  {[
                    { label: "Packaging issues", count: 342, pct: 100, color: "bg-red-500" },
                    { label: "Battery life", count: 218, pct: 64, color: "bg-orange-500" },
                    { label: "Value for money", count: 124, pct: 36, color: "bg-yellow-500" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.count} reviews</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm leading-relaxed">AI-Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY MANUAL FAILS ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Reading Reviews Manually
              <br />
              <span className="text-red-600 dark:text-red-500">Is Impossible</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Every Indian Amazon and Flipkart seller knows reviews matter. Most intend to read them. Almost none can keep up.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Thousands of reviews to read", desc: "and they grow every day", color: "from-red-500 to-orange-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Critical issues buried in noise", desc: "one real complaint hidden among 500 reviews", color: "from-orange-500 to-yellow-500" },
              { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "No way to spot patterns", desc: "you read 20 and miss the pattern in 300", color: "from-purple-500 to-pink-500" },
              { icon: <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitors learn faster", desc: "acting on insights you don't even know exist", color: "from-pink-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1 text-xs sm:text-base">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg mb-5 sm:mb-6">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2 sm:mb-3 leading-relaxed">
              A product issue mentioned in <span className="text-red-600 dark:text-red-400">300 reviews</span> is actively destroying your conversion rate.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed text-sm sm:text-base">
              Right now. And you won't find it by reading reviews one by one. By the time it becomes visible as a rating drop, you've already lost months of sales momentum.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1.5 sm:mb-2 leading-relaxed">What most review tools don't tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">
              Most sellers who do analyse reviews use a simple star-filter or keyword search which means they find what they're already looking for, not what they're missing. The complaints that damage conversion rates most are the ones phrased in 50 different ways across 400 reviews none loud enough to notice alone, together impossible to ignore.
            </p>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Review Analysis Works
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">From product to insights in under 2 minutes. No research background required.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { step: "1", title: "Connect Your Products", desc: "Add your Amazon India or Flipkart listing (or any competitor's ASIN). Insydz pulls all available reviews automatically. Setup: under 60 seconds.", icon: <Target className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
              { step: "2", title: "AI Analyses Everything", desc: "AI reads every single review. Identifies sentiment (positive/neutral/negative), clusters similar complaints, flags praise themes, processes English + Hindi + Hinglish reviews automatically.", icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />, bg: "bg-pink-50 dark:bg-pink-900/20" },
              { step: "3", title: "Get Clear Insights", desc: "Plain-language ranked dashboard: 'Top complaint: Packaging could be better 342 reviews' / 'Top praise: Excellent value 487 reviews' / 'Competitor gap: Charging cable too short their #1 complaint'", icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg flex-shrink-0">{item.step}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-relaxed">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow">{item.desc}</p>
                <div className={`${item.bg} rounded-2xl p-3 sm:p-4 flex justify-center mt-auto transition-all group-hover:scale-105`}>{item.icon}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
              Analyse Your First Product Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU DISCOVER ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Stop Guessing What Customers Want.
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Know for Sure.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "AI Sentiment Analysis Tool", title: "1. Sentiment Breakdown", desc: "See what percentage of reviews are positive, neutral, and negative and compare against competitors. Track sentiment trends over time.", link: { text: "See how AI sentiment analysis works →", href: "/features/review-analytics-feature" }, color: "from-green-500 to-emerald-500" },
              { icon: <Frown className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Pattern Detection", title: "2. Top Complaint Clusters", desc: "AI groups similar complaints 'packet was torn,' 'packaging damaged,' 'box came broken' all count as one problem. Most frequent issue appears first with review count and example quotes.", link: null, color: "from-red-500 to-orange-500" },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Listing Intelligence", title: "3. Top Praise Themes", desc: "Know which product attributes buyers love most. Use those insights to rewrite listing bullets and title copy backed by real buyer language, not assumptions.", link: null, color: "from-yellow-500 to-orange-500" },
              { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Competitive Intelligence", title: "4. Competitor Review Gap Analysis", desc: "Add any competitor ASIN. Insydz surfaces their top complaints which become your product differentiation brief. Solve a proven problem before you even launch.", link: null, color: "from-blue-500 to-cyan-500" },
              { icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "WhatsApp Alerts", title: "5. Review Trend Monitoring", desc: "Track how sentiment and complaint themes change month by month. WhatsApp alert when a new negative theme appears before it becomes a visible rating drop.", link: null, color: "from-purple-500 to-pink-500" },
              { icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "India-First", title: "6. Hindi & Hinglish Review Analysis", desc: "Indian buyers write reviews in English, Hindi, Hinglish, and regional languages. Insydz reads all of them so you're not missing insights your English-only competitors can't access.", link: null, color: "from-orange-500 to-red-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-purple-400 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{feature.icon}</div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide leading-relaxed">{feature.badge}</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2 sm:mb-3 leading-relaxed">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{feature.desc}</p>
                {feature.link && (
                  <button onClick={() => router.push(feature.link!.href)} className="mt-2 sm:mt-3 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold hover:underline text-left leading-relaxed">{feature.link.text}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDIA-FIRST ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              How Insydz Is Different
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Built for Indian Marketplace Reviews</span>
            </h2>
          </div>

          {/* Scenario */}
          <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-8 sm:mb-12 transition-all hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-4 md:mb-0">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 sm:mb-3 leading-relaxed">Real Seller Scenario — Personal Care Brand, Pune</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                  Ananya runs a premium face wash brand on Amazon India. Her product held a 4.1 rating for three months. Return rates were creeping up to 14% month-on-month. She assumed it was a listing issue. When she ran Insydz's customer review analysis tool on her 680 reviews, the AI surfaced a single dominant complaint in 3 minutes: <strong className="text-gray-900 dark:text-white">'pump dispenser leaks during delivery'</strong> mentioned across 127 reviews in various phrasings, including Hindi reviews she had never read.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  She passed the finding to her supplier. New pump mechanism. Updated packaging. Three weeks to implement. <strong className="text-gray-900 dark:text-white">Result: rating climbed 4.1 → 4.6. Returns dropped from 14% to 5%.</strong> The packaging fix cost ₹12/unit. The return problem had been costing ₹28,000/month. Research time: 3 minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed">
              3 India-First Advantages
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
              Built specifically for Indian marketplaces, buyer behavior, and regional diversity.
            </p>
          </div>

          {/* 3 advantages */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Multilingual Processing", desc: "Reads English, Hindi, Hinglish, Tamil, Telugu, and regional languages no Indian buyer feedback lost", color: "from-purple-500 to-pink-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Indian Complaint Pattern Recognition", desc: "Trained on Indian marketplace data understands COD packaging complaints, festive gifting expectations, return behaviours", color: "from-blue-500 to-cyan-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitor Analysis in Minutes", desc: "Analyse any Amazon India or Flipkart competitor turn their complaints into your competitive advantage", color: "from-orange-500 to-red-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all h-full">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg flex-shrink-0`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-xl">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">Capability</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Manual Reading</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Insydz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: "Reviews covered", manual: "✗ 20–50 sample", insydz: "✓ Every review (50–50,000+)" },
                  { capability: "Pattern detection", manual: "✗ None (impressionistic)", insydz: "✓ AI clusters complaints automatically" },
                  { capability: "Hindi/Hinglish reviews", manual: "✗ Usually skipped", insydz: "✓ Fully read and included" },
                  { capability: "Time to insight", manual: "✗ 4–8 hours/product", insydz: "✓ Under 2 minutes" },
                  { capability: "Competitor analysis", manual: "✗ Practically impossible", insydz: "✓ Any ASIN, 2 minutes" },
                  { capability: "Ongoing monitoring", manual: "✗ None", insydz: "✓ WhatsApp alerts for new patterns" },
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm leading-relaxed">{row.capability}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-left text-red-500 dark:text-red-400 font-medium text-xs sm:text-sm leading-relaxed">{row.manual}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-left text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm leading-relaxed">{row.insydz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ ROI ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              What One Unread Review Pattern
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Costs You Every Month</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A single undetected product quality issue hiding across 127 reviews in varying phrasings costs Indian sellers far more than they realise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
            {[
              {
                title: "Without Insydz — Monthly Impact",
                icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-red-600 dark:text-red-400",
                borderCls: "border-red-200 dark:border-red-800",
                rows: [
                  { label: "14% return rate on ₹2L monthly revenue", value: "−₹28,000" },
                  { label: "4.1 vs 4.6 rating conversion rate difference", value: "−₹18,000 lost sales" },
                  { label: "Negative review accumulation organic ranking penalty", value: "−₹12,000 traffic lost" },
                  { label: "Extra ad spend to compensate for lower organic rank", value: "−₹9,000" },
                ],
                totalLabel: "Total monthly cost of one unread complaint pattern",
                totalValue: "−₹67,000",
                totalValueCls: "text-red-600 dark:text-red-400",
                totalBorderCls: "border-red-200 dark:border-red-800",
                valueCls: "text-red-600 dark:text-red-400",
              },
              {
                title: "With Insydz — Issue Detected in 3 Minutes",
                icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-green-600 dark:text-green-400",
                borderCls: "border-green-200 dark:border-green-800",
                rows: [
                  { label: "Issue detected in week 3 instead of month 4", value: "3 months earlier" },
                  { label: "₹12/unit packaging fix implemented in 3 weeks", value: "₹12/unit investment" },
                  { label: "Returns drop 14% → 5% monthly recovery", value: "+₹25,200/month" },
                  { label: "Rating climbs 4.1 → 4.6 conversion uplift", value: "+₹16,000/month" },
                  { label: "Organic rank recovery reduced ad dependency", value: "+₹9,000/month saved" },
                ],
                totalLabel: "Net monthly value recovered",
                totalValue: "+₹50,200",
                totalValueCls: "text-green-600 dark:text-green-400",
                totalBorderCls: "border-green-200 dark:border-green-800",
                valueCls: "text-green-600 dark:text-green-400",
              },
            ].map((panel, pi) => (
              <div key={pi} className={`bg-white dark:bg-gray-900 border-2 ${panel.borderCls} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col h-full transition-all hover:shadow-2xl`}>
                <h3 className={`text-base sm:text-xl font-black ${panel.titleCls} mb-4 sm:mb-6 flex items-center gap-2 leading-relaxed`}>{panel.icon} {panel.title}</h3>
                <div className="space-y-2 sm:space-y-3 flex-grow">
                  {panel.rows.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-2">
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{item.label}</span>
                      <span className={`font-bold ${panel.valueCls} flex-shrink-0 text-xs sm:text-sm leading-relaxed`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-between pt-4 sm:pt-6 border-t-2 ${panel.totalBorderCls} gap-2 mt-4`}>
                  <span className="font-black text-gray-900 dark:text-white text-xs sm:text-sm flex-1 leading-relaxed">{panel.totalLabel}</span>
                  <span className={`font-black ${panel.totalValueCls} text-base sm:text-xl ml-2 sm:ml-4 flex-shrink-0 leading-relaxed`}>{panel.totalValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300 mb-2 leading-relaxed">₹3.47L saved over 6 months</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">from catching one product issue 3 months earlier using Insydz's AI customer review analysis tool. The packaging fix cost ₹12 per unit.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Start Free. Know What Customers
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Really Think.</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-xl transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 leading-relaxed">₹0</span>
              <span className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">/ Forever No credit card required</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">Free Plan Includes:</p>
            <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              {["AI review analysis for limited products","Sentiment breakdown (positive/neutral/negative)","Top complaint clusters with review counts","Top praise themes identified","Amazon India & Flipkart listings","Hindi & Hinglish review processing"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-400 mb-1.5 sm:mb-2 leading-relaxed">Upgrade to unlock:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Unlimited product analysis, competitor ASIN review analysis, continuous monitoring, WhatsApp alerts for new complaint patterns, and full 90-day review trend history.</p>
            </div>
            <Button onClick={handleGetStarted} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group">
              Analyse Reviews Free — No Card Needed
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">Stop Guessing. Know for Sure.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For New Sellers</h3>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 sm:mb-3 leading-relaxed">Free Plan</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Before you list, analyse competitor reviews to understand what buyers already complain about. Build those fixes into your product from day one. Launch with proven differentiation not guesswork.</p>
              <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full text-sm py-5 transition-all">Start Free — No Card Needed →</Button>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-700 border-2 border-purple-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all relative overflow-hidden flex flex-col h-full group hover:scale-[1.02]">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-md z-10">Most Popular</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-relaxed">For Growing Sellers</h3>
              <p className="text-xs font-semibold text-purple-100 mb-2 sm:mb-3 leading-relaxed">Growth Plan</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Doing ₹5L+ monthly? Every 0.1 drop in star rating costs you measurable conversion. Growth Plan: unlimited analysis, continuous monitoring, WhatsApp alerts before problems become rating drops.</p>
              <Link href="/pricing" className="w-full bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-full text-sm inline-block text-center py-2.5 px-4 transition-all">Try Growth Plan →</Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-pink-200 dark:border-pink-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1 flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For D2C Brands & Agencies</h3>
              <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-2 sm:mb-3 leading-relaxed">Strategic Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Full portfolio review monitoring, cross-product sentiment comparison, competitor review mining, white-label insight reports, API access.</p>
              <Link href="/solutions/ecommerce-agencies" className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full text-sm inline-block text-center py-2 px-4 transition-all">Book a Demo →</Link>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 text-xs sm:text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 60 seconds &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Review Analysis <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">FAQs</span>
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} openFaq={openFaq} toggleFaq={toggleFaq} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white leading-relaxed">
            Stop Guessing What Customers Want.
            <br />
            <span className="text-purple-100">Know for Sure.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            India's most powerful customer review analysis tool for Amazon and Flipkart free to start.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-purple-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
            Analyse Reviews Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 60 seconds &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-purple-300 dark:border-purple-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
          Analyse Reviews Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-16 sm:h-20" />
    </div>
  );
}
