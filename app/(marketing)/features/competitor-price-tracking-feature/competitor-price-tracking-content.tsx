"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap,
  TrendingUp, MessageCircle, Search, Package,
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  DollarSign, RefreshCw, Shield, Eye, Sparkles,
  ChevronDown, LayoutGrid, Flame, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function CompetitorPriceTrackingFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const painPoints = [
    {
      title: "By the time you notice, it's already over",
      description:
        "A competitor reprices during the Diwali night sale. You're asleep. By morning, you've lost 6 hours of peak traffic. No alert. No reprice. Just lost sales.",
      icon: <Clock className="w-8 h-8" />,
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Panic discounting destroys margins",
      description:
        "Without a floor price set in advance, sellers drop prices impulsively sometimes below their own profit margin. A price tracking tool without margin protection isn't tracking, it's guessing.",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Most online price tracking tools don't cover Flipkart",
      description:
        "If you sell on both Amazon India and Flipkart, most competitor price monitoring software only shows half the picture. Competitors repricing on Flipkart can tank your category rank on both platforms.",
      icon: <RefreshCw className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Email alerts you check tomorrow not tonight",
      description:
        "Most price tracking tools send email notifications. Indian sellers don't monitor business email around the clock. By the time you open that email, three competitors have already captured the Buy Box back.",
      icon: <Shield className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  const indiaFirstAdvantages = [
    {
      num: "1",
      title: "Amazon India + Flipkart",
      description:
        "Track competitor prices across both major Indian marketplaces in one dashboard. Most tools cover one or the other.",
    },
    {
      num: "2",
      title: "WhatsApp, not email",
      description:
        "Alerts go to WhatsApp where you already are. Not an email dashboard you check twice a week.",
    },
    {
      num: "3",
      title: "INR margin calculations",
      description:
        "Every reprice suggestion accounts for Amazon.in fees, your purchase cost, GST, and your target margin in rupees. No currency conversion.",
    },
    {
      num: "4",
      title: "Festive demand intelligence",
      description:
        "Diwali, Big Billion Days, Great Indian Festival pricing suggestions account for demand spikes, not just competitor moves. When demand is rising 4×, Insydz factors that into your reprice logic.",
    },
  ];

  const intelligenceSteps = [
    {
      step: "1",
      trigger: "Competitor drops price",
      what: "AI detects price change, calculates margin-safe reprice",
      result: "Price alert triggered",
    },
    {
      step: "2",
      trigger: "Analysis complete",
      what: "System checks your floor price, margin %, and Buy Box status",
      result: "Suggestion generated",
    },
    {
      step: "3",
      trigger: "Alert sent",
      what: "WhatsApp message delivered within minutes",
      result: "You act in seconds",
    },
    {
      step: "4",
      trigger: "You reprice",
      what: "Update price from your phone in 2 taps",
      result: "Buy Box protected. Margins held.",
    },
  ];

  const platformAdvantages = [
    {
      advantage: "No tool switching",
      meaning:
        "Prices, reviews, keywords, AI recommendations all in one place. One decision from one dashboard.",
    },
    {
      advantage: "No data overload",
      meaning:
        "Features surface actions, not raw numbers. You see what to do, not just what happened.",
    },
    {
      advantage: "Clear actions always",
      meaning:
        "Every insight comes with a recommended next step not a chart to interpret at midnight.",
    },
    {
      advantage: "Built for India",
      meaning:
        "Amazon India and Flipkart not a global tool retrofitted for Indian markets.",
    },
  ];

  const faqs = [
    {
      question: "Does Insydz competitor price tracking work on Flipkart?",
      answer:
        "Yes. Insydz tracks competitor prices on both Amazon India and Flipkart simultaneously from a single dashboard, with WhatsApp alerts for price changes on either marketplace. Most global price tracking tools cover Amazon only — Flipkart support is one of Insydz's core India-first advantages.",
    },
    {
      question: "How quickly does Insydz detect a competitor price change?",
      answer:
        "Insydz monitors competitor prices in real time. When a competing listing changes price, you receive a WhatsApp notification within minutes — including the AI-suggested reprice and confirmation that it stays above your margin floor. There's no waiting for a daily digest or checking a dashboard manually.",
    },
    {
      question: "Can I set a minimum price so I never reprice below my margin?",
      answer:
        "Yes — this is one of Insydz's most important price tracking features. You set a floor price (your minimum acceptable margin) for each product. Every AI-suggested reprice automatically stays above that floor. Even during a competitor price war, Insydz will never suggest a reprice that puts you below cost. This prevents panic discounting during sale seasons.",
    },
    {
      question: "Does Insydz track competitor prices on Amazon India specifically?",
      answer:
        "Yes — Insydz is built specifically for Amazon India (Amazon.in), not Amazon.com. Keyword volumes, demand data, fee calculations, and competitor pricing are all calibrated for the Indian marketplace. This is a key difference from global price tracking tools like Prisync or Competera, which are designed for Western markets.",
    },
    {
      question: "Is there a free plan for competitor price tracking?",
      answer:
        "Yes. Insydz's free plan includes competitor price monitoring for up to 25 products — permanently, with no credit card required and no expiry date. You get real-time price alerts and the AI reprice suggestion feature. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit and add Flipkart tracking.",
    },
    {
      question: "How is Insydz different from other price tracking tools like Prisync?",
      answer:
        "Prisync is excellent for Western e-commerce retailers but designed for website-based price monitoring, not Indian marketplace sellers. Insydz is built for Amazon India and Flipkart: WhatsApp alerts (not email), INR reprice calculations with Amazon.in fee structures, Indian festive demand data in pricing suggestions, and dual-marketplace coverage from one dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-orange-700">Competitor Price Tracking Software</h1>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Stop Losing the Buy Box.
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  React to Competitor Price Drops
                </span>
                <br />
                Before They Cost You Sales.
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Insydz <strong>competitor price tracking software</strong> monitors every competing
                listing on Amazon India and Flipkart in real time and sends a WhatsApp alert
                the moment a competitor undercuts you.{" "}
                <span className="text-orange-700 font-semibold">
                  With a suggested reprice that protects your margins.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-16 py-5 text-lg rounded-full shadow-2xl transition-all inline-flex items-center justify-center gap-2 group">
                  Start Free 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Built for Indian sellers", "Amazon & Flipkart", "WhatsApp-first alerts"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-orange-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Live Price Monitor</h3>
                    <span className="flex items-center gap-2 text-[10px] sm:text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Competitor A</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">₹1,399</span>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-lg font-black text-red-600">₹1,249</span>
                        </div>
                      </div>
                      <p className="text-xs text-red-600 font-bold leading-relaxed">↓ ₹150 Buy Box at risk!</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Your Product</span>
                        <span className="text-lg font-black text-green-700 dark:text-green-400">₹1,399</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-5 mt-6 shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-white">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">WhatsApp Alert</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                          "Competitor A dropped ₹150. Suggested reprice: ₹1,279 stay above your ₹1,180 floor. React now."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: INTELLIGENCE FLOW STRIP ─────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4 leading-relaxed">Not Isolated Tools. One Intelligence System.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Each signal connects so a competitor price drop doesn't just trigger an alert, it triggers a
              margin-safe reprice suggestion, a WhatsApp notification, and a decision you can act on in seconds.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {intelligenceSteps.map((s, i) => (
              <div key={i} className="relative p-6 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-orange-500 transition-all group h-full flex flex-col">
                <div className="text-orange-500 font-black text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity">0{s.step}</div>
                <p className="text-white font-bold mb-2 leading-relaxed">{s.trigger}</p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed flex-grow">{s.what}</p>
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-wider">{s.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PAIN POINTS ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
              Why Sellers Lose the Buy Box <br /><span className="text-orange-600">and Don't Know Why</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all group flex flex-col h-full shadow-sm">
                <div className={`w-14 h-14 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base sm:text-lg leading-relaxed">{pain.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ADVANTAGES ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">The India-First Advantage</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {indiaFirstAdvantages.map((adv, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-lg hover:border-orange-400 transition-all flex gap-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md">{adv.num}</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">{adv.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{adv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ALL-IN-ONE ADVANTAGES ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">Stop Juggling Tools. Start Selling.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformAdvantages.map((adv, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                <p className="text-orange-600 font-black text-xs uppercase tracking-widest mb-3 leading-relaxed">{adv.advantage}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{adv.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-10 sm:mb-16 leading-relaxed">
            Price Tracking – <span className="text-orange-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-orange-50/30 dark:bg-orange-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Losing the Buy Box.
            <br />
            <span className="text-orange-100">Start Winning Every Sale.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get real-time competitor price alerts for Amazon India and Flipkart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-12 py-5 rounded-full border-2 border-orange-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              View Pricing →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
