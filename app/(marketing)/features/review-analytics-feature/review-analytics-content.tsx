"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, MessageCircle, ThumbsUp, ThumbsDown,
  TrendingUp, Star, Heart, ChevronDown, Sparkles, Eye, Bell, Target,
  ArrowLeft, Package, TrendingDown, Search, Zap, X, AlertCircle, LayoutGrid, Flame, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function ReviewAnalyticsFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const painPoints = [
    {
      icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Manually reading 1000s of reviews",
      description: "Takes hours every week and still only covers a fraction of reviews.",
    },
    {
      icon: <ThumbsDown className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Negative trends are missed",
      description: "Until the rating has already dropped by which point the ranking damage is done.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Opportunity to improve ratings is delayed",
      description: "Weeks pass before the right fix is identified and implemented.",
    },
    {
      icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Poor prioritization of improvements",
      description: "Without data, sellers fix the last complaint they read not the most impactful one.",
    },
  ];

  const indiaPains = [
    {
      title: "Most reviews are in Hindi and most tools can't read them",
      description:
        "60–70% of Amazon India reviews for mass-market products are written in Hindi or Hinglish. Tools built for Western markets process them incorrectly or skip them entirely. That means the majority of your customer feedback is invisible.",
    },
    {
      title: "By the time you notice the rating drop, you've already lost the ranking",
      description:
        "Amazon India's ranking algorithm reacts to rating velocity the speed of new reviews and sentiment shift. A wave of negative reviews during a sale event can drop your listing 10 positions before you've even opened the seller app.",
    },
    {
      title: "Flipkart review data is almost never tracked",
      description:
        "Most Amazon review analyzer tools only cover Amazon listings. Sellers running the same product on Flipkart get zero insight from reviews there missing complaints that affect both platform rankings and product quality decisions.",
    },
    {
      title: "You fix the wrong thing because you can't see what's most complained about",
      description:
        "Without AI clustering, sellers act on the last review they read not the most common complaint. A product with 43 packaging complaints and 8 size complaints gets a size fix. The packaging issue keeps bleeding 1-star reviews for another 3 months.",
    },
  ];

  const faqs = [
    {
      question: "How does AI analyze reviews?",
      answer:
        "Insydz's AI reads every customer review on your Amazon India and Flipkart listings in Hindi, Hinglish, and English. It uses natural language processing to classify each review as positive, neutral, or negative, extract main topics, and group similar complaints into ranked clusters. The AI then shows which issue has the highest impact on your star rating — so you know which fix to prioritize. Analysis runs automatically as new reviews appear, with no manual input required.",
    },
    {
      question: "Can I track multiple products at once?",
      answer:
        "Yes. Insydz tracks review analytics across all your products simultaneously on both Amazon India and Flipkart. The free plan covers up to 25 products. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit. The dashboard shows your full product catalogue sorted by sentiment score so you can see which listings need the most urgent attention at a glance.",
    },
    {
      question: "Does it work for Amazon India & Flipkart?",
      answer:
        "Yes. Insydz is one of the only review analytics tools that covers both Amazon India and Flipkart from a single dashboard. Most global review monitoring platforms cover Amazon.com only or don't support Flipkart at all. Insydz was built specifically for Indian marketplace sellers with full support for both platforms, Hindi and Hinglish review analysis, and WhatsApp-based alerts.",
    },
    {
      question: "Can I get alerts for negative trends?",
      answer:
        "Yes. Set thresholds for negative sentiment for example, alert when a specific complaint appears more than 10 times in 7 days, or when star rating drops below 4.2. When a threshold is crossed, Insydz sends a WhatsApp notification with the specific complaint theme, its frequency, and a recommended action. This means you act on a review problem before it becomes a rating problem.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "Yes. Insydz has a permanent free plan not a trial. It includes review sentiment analysis for up to 25 products, complaint clustering, and WhatsApp alerts. No credit card required, no expiry date. Paid plans start at ₹1,999/month and include unlimited products, competitor review analysis, and advanced trend reporting.",
    },
    {
      question: "Can I export insights?",
      answer:
        "Yes. Review analytics reports including complaint clusters, sentiment trends, and star rating breakdowns can be exported as PDF or CSV from the Insydz dashboard. This is particularly useful for agencies sharing monthly review performance reports with seller clients, or for brand managers presenting customer feedback data to product teams.",
    },
  ];

  function Clock(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-purple-700">Review analytics software</h1>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Review Analytics 
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Understand Customers
                </span>
                <br />
                Without Reading 1000s of Reviews
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                AI-powered <strong>review analytics software</strong> analyzes every customer review
                across your Amazon India and Flipkart listings in Hindi and English to show you
                what customers love, hate, and want fixed.{" "}
                <span className="text-purple-700 dark:text-purple-400 font-semibold">
                  So you can act before ratings drop.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-5 text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center justify-center group">
                  Start Free Review Analysis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Hindi + English analysis", "Amazon India & Flipkart", "WhatsApp-first alerts"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sentiment Analysis Widget */}
            <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-purple-500/10 mt-8 lg:mt-0">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-relaxed">Sentiment Analysis</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 px-3 py-1 rounded-full font-black shadow-sm">Live</span>
              </div>

              {/* Sentiment scores */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {  value: "68%", icon: <ThumbsUp className="w-6 h-6 text-green-600 mx-auto" />, bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700" },
                  {  value: "22%", icon: <Heart className="w-6 h-6 text-yellow-500 mx-auto" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700" },
                  {  value: "10%", icon: <ThumbsDown className="w-6 h-6 text-red-600 mx-auto" />, bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700" },
                ].map((s, i) => (
                  <div key={i} className={`text-center p-4 ${s.bg} border ${s.border} rounded-2xl shadow-sm`}>
                    {s.icon}
                    <p className="font-black text-xl text-gray-900 dark:text-white leading-relaxed">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Star rating breakdown */}
              <div className="space-y-2 mb-6">
                {[
                  { stars: "5★", pct: 62, color: "bg-green-500" },
                  { stars: "4★", pct: 18, color: "bg-green-300" },
                  { stars: "3★", pct: 9, color: "bg-yellow-400" },
                  { stars: "2★", pct: 6, color: "bg-orange-400" },
                  { stars: "1★", pct: 5, color: "bg-red-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-600 dark:text-gray-400 w-6">{row.stars}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${row.color} h-2 rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Top complaint highlight */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-700 dark:text-red-400 mb-1 leading-relaxed">Top Complaint 23 mentions</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">"Packaging damaged during delivery" fix to improve rating</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-4 py-2 shadow-xl">
                <p className="text-white font-bold text-sm leading-relaxed flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI-Powered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHY SELLERS MISS KEY INSIGHTS ───────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Sellers Miss Key Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
            {painPoints.map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl transition-all group flex flex-col items-center text-center h-full shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-400 dark:border-purple-600 rounded-3xl p-8 text-center shadow-lg mb-16">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
              A 1-star rating drop on Amazon India can cost you{" "}
              <span className="text-purple-600">20–40% of organic traffic</span> overnight.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">Most sellers see the rating fall but never find out which complaint caused it.</p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Review Analytics Works
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz automatically monitors every review in Hindi and English across Amazon & Flipkart 
              to surface critical feedback before it tanks your rating.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                feature: "Real-Time Sentiment Analysis",
                description: "AI reads every new review the moment it appears and updates your sentiment score so negative trends surface in hours, not weeks.",
                benefit: "Identify negative trends immediately",
                icon: <Eye className="w-10 h-10" />,
                color: "from-purple-600 to-pink-600",
              },
              {
                feature: "Customer Highlight Extraction",
                description: "AI clusters thousands of reviews into the top 5 issues customers mention most in Hindi and English with verbatim quotes.",
                benefit: "See key points at a glance",
                icon: <Sparkles className="w-10 h-10" />,
                color: "from-indigo-500 to-purple-500",
              },
              {
                feature: "Automated WhatsApp Alerts",
                description: "When a complaint theme crosses a threshold, you get a WhatsApp alert with the issue and recommended fix.",
                benefit: "Never miss critical feedback",
                icon: <Bell className="w-10 h-10" />,
                color: "from-red-500 to-pink-500",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-purple-400 transition-all group flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed flex-grow">{item.feature}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{item.description}</p>
                <p className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider">
                  <ArrowRight className="w-4 h-4" /> {item.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: WHY INDIAN SELLERS STRUGGLE ─────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
              Why Indian Sellers Struggle to Act on Customer Feedback
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {indiaPains.map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 hover:border-purple-400 transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-start gap-5">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-1 shadow-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg leading-relaxed">{pain.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">{pain.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            Review Analytics – <span className="text-purple-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-purple-400 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-purple-50/30 dark:bg-purple-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Guessing Sentiment.
            <br />
            <span className="text-purple-100">Know Exactly What Customers Want.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get AI-powered review analytics for Amazon India and Flipkart in Hindi and English.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-purple-700 font-black px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-12 py-5 rounded-full border-2 border-purple-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              Explore All Features →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Hindi + Hinglish support &nbsp;·&nbsp; ✓ Native support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-purple-300 dark:border-purple-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
