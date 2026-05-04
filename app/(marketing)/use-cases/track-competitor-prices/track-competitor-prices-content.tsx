"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, AlertCircle, Clock,
  Smartphone, X, Check,
  RefreshCw, FileSpreadsheet, Shield, Eye, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const comparisonRows = [
  { feature: "Monitoring", manual: "Checking listings manually", insydz: "Automatic 24/7 tracking" },
  { feature: "Response Time", manual: "Late reactions (hours/days)", insydz: "Instant alerts (minutes)" },
  { feature: "Data Management", manual: "Excel sheets, constantly stale", insydz: "Live dashboard, always current" },
  { feature: "Decision Quality", manual: "Panic discounts without margin data", insydz: "AI-guided, margin-aware repricing" },
  { feature: "Time Investment", manual: "8–12 hours wasted per week", insydz: "Minutes per day set and forget" },
  { feature: "Historical Data", manual: "No pattern detection", insydz: "90-day price history per competitor" },
];

const roiWithout = [
  { label: "Competitor drops Friday 9pm discovered Monday morning", value: "−₹22,000" },
  { label: "Panic discounting below margin floor to recover Buy Box", value: "−₹8,000" },
  { label: "Hours spent manually checking 8 competitors, 3× per week", value: "−14 hrs/month" },
  { label: "Missed upward pricing opportunity (all rivals raised prices)", value: "−₹12,000" },
];

const roiWith = [
  { label: "Friday 9:04pm WhatsApp alert repriced by 9:07pm", value: "+₹19,000" },
  { label: "AI margin floor shown no panic discounting", value: "+₹7,500" },
  { label: "Zero manual checking 14 hours freed", value: "+₹14,000" },
  { label: "Spot rival price increases early raised own price by ₹80", value: "+₹11,200" },
];

const faqs = [
  { id: "faq-1", q: "How often does Insydz track competitor prices?", a: "Insydz monitors competitor prices continuously — with checks running multiple times per hour on high-velocity products. During Flipkart Big Billion Days and Amazon Great Indian Festival, monitoring frequency increases automatically. You receive a WhatsApp alert within minutes of any competitor price change that crosses your set threshold." },
  { id: "faq-2", q: "Does this competitor price tracking work for Amazon India and Flipkart only?", a: "Yes. Insydz is built specifically for Indian marketplaces — Amazon.in and Flipkart. All pricing data is in INR, all competitor tracking covers Indian marketplace listings, and all Buy Box risk alerts are calibrated for how Indian marketplaces determine Buy Box eligibility." },
  { id: "faq-3", q: "Will constant price changes hurt my margins?", a: "Not with Insydz. The platform shows your margin floor alongside every competitor price drop alert, so you always know the minimum price you can go to without selling at a loss. The AI recommends a response price that protects your Buy Box while keeping your margin intact — not just matching the lowest price blindly." },
  { id: "faq-4", q: "Can I track multiple competitors per product?", a: "Yes. Insydz tracks up to 100+ competitors per product. You can monitor all sellers in your product category simultaneously — including new entrants. You'll be alerted when any seller makes a significant price change, not just the top 3." },
  { id: "faq-5", q: "Is the free plan limited for competitor price tracking?", a: "The free plan lets you track a limited number of products with real-time competitor price alerts and Amazon & Flipkart data — no credit card required. Paid plans unlock tracking across your full catalogue, more competitors per product, 90-day historical price trends, advanced Buy Box monitoring, and AI pricing recommendations." },
  { id: "faq-6", q: "Do I get WhatsApp alerts for competitor price changes?", a: "Yes. Every significant competitor price change triggers an instant WhatsApp notification with the competitor name, old price, new price, percentage drop, and an AI-suggested response price for your product in INR." },
];

export default function TrackCompetitorPricesContent() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleGetStarted = () => router.push("/login");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ══ HERO ══ */}
      <section className="relative pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-blue-700">India's #1 Competitor Price Tracking Tool</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                <span className="block mb-2">
                  <span className="font-medium">Track </span>
                  <span className="font-black">Competitor Prices</span>
                  <span className="font-medium"> in Real Time</span>
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>competitor price tracking tool</strong> for Amazon and Flipkart sellers. Monitor rival pricing automatically and react instantly
                <span className="text-blue-700 font-semibold"> without manual tracking or Excel chaos.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
                  Start Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="outline" className="border-2 border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-all hover:shadow-blue-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Competitor Price Alert</h3>
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Buy Box Risk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-blue-600">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">Top Rival Jaipur</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Dropped price by 12%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 line-through leading-relaxed">₹1,499</p>
                      <p className="text-sm font-bold text-red-600 leading-relaxed">₹1,299</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 leading-relaxed">AI Recommendation</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">New Buy Box Price:</p>
                      <p className="text-sm font-black text-blue-800 dark:text-blue-200 leading-relaxed">₹1,295</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">Projected Margin:</p>
                      <p className="text-[10px] font-bold text-green-600 leading-relaxed">₹420 (22%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2.5">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    <p className="text-[10px] text-green-800 dark:text-green-300 font-medium leading-relaxed">WhatsApp notification sent to your phone</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">Live Monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROBLEM SECTION ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Manual Price Tracking
              <br />
              <span className="text-red-600 dark:text-red-500">Costs You Money Every Day</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Indian marketplaces move fast. Checking prices manually once or twice a day means you're already too late to respond.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Buy Box Hijacks", desc: "Competitors drop prices at night and steal your sales before you wake up.", color: "from-red-500 to-orange-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Hours Wasted", desc: "Checking 10 competitors across 20 listings takes 15+ hours of manual work every week.", color: "from-orange-500 to-yellow-500" },
              { icon: <AlertCircle className="w-8 h-8" />, title: "Inaccurate Data", desc: "Excel sheets are stale the second you save them. Prices change while you're still typing.", color: "from-purple-500 to-pink-500" },
              { icon: <Zap className="w-8 h-8" />, title: "Panic Decisions", desc: "Dropping prices blindly without knowing your real margin floors or competitor history.", color: "from-blue-500 to-indigo-500" },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br ${p.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{p.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-1.5 leading-relaxed">{p.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
              Sellers lose <span className="text-red-600 dark:text-red-400">up to 35% of their Buy Box time</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              ...due to delayed responses to competitor price drops. On high-velocity products, even a 4-hour delay in matching a price drop can cost ₹15,000–₹20,000 in lost revenue.
            </p>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Price Tracking Works
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">From listing link to automated monitoring in under 2 minutes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 -translate-y-1/2 z-0" />
            {[
              { step: "1", title: "Add Listing Link", desc: "Paste your Amazon India or Flipkart listing link. Insydz automatically identifies your top 5–20 competitors in seconds.", visual: <Package className="w-10 h-10 text-blue-600 mx-auto" />, bg: "bg-blue-100 dark:bg-blue-900/20" },
              { step: "2", title: "Automated 24/7 Monitoring", desc: "Our system monitors every competitor price change multiple times per hour — even during night hours and festive sales.", visual: <BarChart3 className="w-10 h-10 text-purple-600 mx-auto animate-pulse" />, bg: "bg-purple-100 dark:bg-purple-900/20" },
              { step: "3", title: "Instant WhatsApp Alerts", desc: "The second a competitor drops their price, you get a WhatsApp alert with an AI-suggested response price to protect your Buy Box.", visual: <Bell className="w-10 h-10 text-indigo-600 mx-auto" />, bg: "bg-indigo-100 dark:bg-indigo-900/20" },
            ].map((step, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg flex-shrink-0">{step.step}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-relaxed">{step.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow">{step.desc}</p>
                <div className={`${step.bg} rounded-2xl p-4 transition-all hover:scale-105`}>{step.visual}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
              Track Your Competitors Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ CAPABILITIES ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Price Tracking Capabilities
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Built for India</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Automated Rival Price Monitoring", desc: "No more manual checking. Track any number of competitors across Amazon India and Flipkart automatically.", link: "/features/competitor-price-tracking-feature", linkLabel: "rival price tracking tool", color: "from-blue-500 to-cyan-500" },
              { icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Instant Buy Box Risk Alerts", desc: "Get notified the second a competitor drops their price into your 'risk zone' so you can respond before losing sales.", link: "/features/price-optimization-feature", linkLabel: "price optimization tool", color: "from-purple-500 to-pink-500" },
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, title: "AI Recommender & Margin Guard", desc: "Insydz shows your real-time margin floor for every price recommendation. Never sell at a loss while matching rivals.", link: "/features/price-optimization-feature", linkLabel: "ai pricing tool", color: "from-indigo-500 to-purple-500" },
              { icon: <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Instant WhatsApp Notifications", desc: "Critical price drop alerts delivered to your phone in INR. No need to keep checking the dashboard.", link: "/features/whatsapp-alerts-feature", linkLabel: "whatsapp price alerts", color: "from-green-500 to-emerald-500" },
              { icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Festive Season Priority Monitoring", desc: "Higher frequency tracking during Big Billion Days and Great Indian Festival to match rapid price changes.", link: "/features/festive-trend-feature", linkLabel: "festive intelligence tool", color: "from-orange-500 to-red-500" },
              { icon: <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8" />, title: "90-Day Historical Price Trends", desc: "See patterns in how your rivals price their products over time — identify weekend vs weekday strategies.", link: "/features/competitor-price-tracking-feature", linkLabel: "price history tool", color: "from-blue-600 to-indigo-600" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all h-full flex flex-col group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5 sm:mb-2 leading-relaxed">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 flex-grow">{feature.desc}</p>
                <Link href={feature.link} className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline transition-colors leading-relaxed">See {feature.linkLabel} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON TABLE ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Manual vs Automated Tracking
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base">Capability</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left">Manual Reading</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left">Insydz</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm leading-relaxed">{row.feature}</td>
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
              The ROI of
              <span className="text-blue-600"> Real-Time Responses</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Two sellers in the same category on Amazon India. One uses <strong>competitor price tracking software</strong>. One doesn't.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
            {/* Without */}
            <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden shadow-lg flex flex-col h-full transition-all hover:shadow-2xl">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 flex-shrink-0"><p className="font-bold text-red-700 dark:text-red-400 leading-relaxed">Manual Monitoring (Monthly)</p></div>
              <div className="bg-white dark:bg-gray-900 flex-grow">
                {roiWithout.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-red-600 whitespace-nowrap leading-relaxed">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed">Total Revenue Lost</p>
                  <p className="font-black text-red-700 text-lg sm:text-xl leading-relaxed">−₹56,000+</p>
                </div>
              </div>
            </div>
            {/* With */}
            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden shadow-lg flex flex-col h-full transition-all hover:shadow-2xl">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 flex-shrink-0"><p className="font-bold text-green-700 dark:text-green-400 leading-relaxed">Insydz Automated (Monthly)</p></div>
              <div className="bg-white dark:bg-gray-900 flex-grow">
                {roiWith.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap leading-relaxed">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed">Total Revenue Gained</p>
                  <p className="font-black text-green-700 text-lg sm:text-xl leading-relaxed">+₹51,700</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">₹1.07 Lakhs monthly gap</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">...between being reactive and being proactive with rival pricing. On Indian marketplaces, speed isn't a luxury — it's your primary competitive advantage.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
            Start Free.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Track Rivals Now.</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed">Free Plan — ₹0 / Forever No credit card required</p>

          <div className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-xl transition-all hover:shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-4 sm:mb-6 text-center leading-relaxed">Free Plan Includes:</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left">
              {[
                "Track up to 5 products for rival price monitoring",
                "Instant WhatsApp & email alerts for price changes",
                "Amazon India & Flipkart support",
                "AI margin floor protection",
                "Basic 7-day price history",
                "Buy Box risk detection",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 mb-1.5 sm:mb-2 leading-relaxed text-left">Upgrade to unlock:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-left">Unlimited product tracking, up to 100 competitors per product, 90-day price trends, advanced Buy Box history, and AI-powered pricing strategy recommendations.</p>
            </div>
            <Button onClick={handleGetStarted} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
              Track Your Rivals Free — No Card Needed
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white leading-relaxed">
            Stop Guessing. Respond Instantly.
            <br />
            <span className="text-blue-100">Own the Buy Box.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            India's most powerful competitor price tracking tool for Amazon and Flipkart — free to start.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
            Track Rivals Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 60 seconds &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Price Tracking <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FAQs</span>
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-300 transition-all shadow-sm">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-4 leading-relaxed text-sm sm:text-base lg:text-lg">{faq.q}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-300 dark:border-blue-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
          Track Rivals Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-16 sm:h-20" />
    </div>
  );
}
