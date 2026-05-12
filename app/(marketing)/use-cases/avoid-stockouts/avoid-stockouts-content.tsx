"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, AlertCircle, ChevronDown,
  ChevronRight, Star, Award, TrendingDown,
  Briefcase, Globe, Package, AlertTriangle,
  BarChart3, RefreshCw, Clock, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const FAQItem = ({
  q, a, index, openFaq, toggleFaq
}: {
  q: string; a: string; index: number; openFaq: number | null; toggleFaq: (i: number) => void;
}) => (
  <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-sm">
    <button
      onClick={() => toggleFaq(index)}
      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
    >
      <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg leading-relaxed">{q}</span>
      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
    </button>
    {openFaq === index && (
      <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-3 sm:pt-4 text-xs sm:text-sm sm:text-base">{a}</p>
      </div>
    )}
  </div>
);

export default function AvoidStockoutsPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGetStarted = () => router.push("/login");
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    {
      q: "How does Insydz predict when you will run out of stock?",
      a: "Insydz's AI inventory management tool combines your current stock level, historical daily sales velocity, upcoming festive demand forecasts, and competitor stock signals to calculate the exact date each SKU will run out. The model updates every 24 hours and recalibrates automatically when sales velocity changes — for example during a flash sale or when a competitor goes out of stock.",
    },
    {
      q: "What happens to inventory rankings when you go out of stock?",
      a: "Amazon and Flipkart deprioritise out-of-stock listings immediately in search rankings. Sellers report an average drop of 3 to 5 positions on primary keywords within 72 hours of going out of stock. Recovering those positions after restocking requires 4 to 6 weeks of elevated PPC spend. The cost of ranking recovery often exceeds the revenue lost during the stockout itself.",
    },
    {
      q: "Does Insydz work for Amazon India and Flipkart inventory management?",
      a: "Yes. Insydz is the only inventory management tool that covers Amazon India and Flipkart in a single dashboard. You can set separate reorder thresholds for each marketplace, track festive demand independently across both platforms, and receive unified WhatsApp alerts regardless of which marketplace is at risk.",
    },
    {
      q: "How is Insydz different from inventory tracking inside Amazon Seller Central?",
      a: "Amazon Seller Central shows you current stock levels. Insydz predicts when you will run out. Seller Central is a lagging indicator — it tells you when you already have a problem. Insydz's inventory tracker software is a leading indicator — it tells you 14 to 21 days before you have a problem, giving you enough time to reorder and receive stock before going out of stock.",
    },
    {
      q: "Does the stockout alert tool send WhatsApp alerts before a stockout becomes critical?",
      a: "Yes. Insydz's stockout alert tool sends a tiered set of WhatsApp alerts: a 21-day planning alert, a 10-day reorder alert, and a 3-day critical alert if no action has been taken. Each alert includes the recommended reorder quantity, your supplier lead time, and the festive demand forecast for the next 30 days — all in a single message.",
    },
    {
      q: "Can Insydz alert me when competitor stock affects my sales velocity?",
      a: "Yes. Insydz monitors stock levels of your top competitors in real time. When a major competitor goes out of stock, the system flags the opportunity and recalibrates your own demand forecast upward so your reorder plan accounts for the incoming buyers. When competitors restock aggressively, you are notified so you can prepare pricing and inventory accordingly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">

      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-15 sm:opacity-20">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">

              {/* Primary keyword badge above H1 */}
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <h1 className="text-xs sm:text-sm font-medium text-orange-700">Inventory Management Tool</h1>
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Never Run Out of Stock
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 bg-clip-text text-transparent">
                  and Miss Sales Again
                </span>
              </div>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>AI inventory management tool</strong> built for Amazon India and Flipkart sellers. Insydz predicts exactly when you will run out of stock and delivers alerts before you lose
                <span className="text-orange-700 dark:text-orange-400 font-semibold"> a single sale to an out-of-stock listing.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
                >
                  Start Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all"
                >
                  See How It Works
                </Button>
              </div>
            </div>

            {/* Hero Visual — inventory dashboard */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-orange-500/10">
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-600 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl z-10">
                  <p className="text-white font-bold text-xs sm:text-sm leading-relaxed">AI-Powered</p>
                </div>

                {/* topbar */}
                <div className="bg-gradient-to-r from-orange-600 to-red-500 px-4 sm:px-5 py-3 flex items-center justify-between">
                  <span className="text-white font-bold text-xs sm:text-sm leading-relaxed">Inventory Intelligence Dashboard</span>
                  <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" /> Live
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-2.5">
                  {[
                    { name: "Steel Water Bottle 1L", days: "42 days left", tag: "Stock Healthy", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700", tagCls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", dayCls: "text-green-600 dark:text-green-400" },
                    { name: "Yoga Mat 6mm", days: "12 days left", tag: "Reorder Soon", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700", tagCls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", dayCls: "text-yellow-600 dark:text-yellow-400" },
                    { name: "Bluetooth Earphones", days: "4 days left", tag: "Critical Alert", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700", tagCls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", dayCls: "text-red-600 dark:text-red-400" },
                    { name: "Phone Stand Desk", days: "9 days left", tag: "Reorder Now", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700", tagCls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", dayCls: "text-yellow-600 dark:text-yellow-400" },
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 sm:p-3 ${row.bg} border rounded-xl`}>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">{row.name}</span>
                      <span className={`text-xs font-bold ${row.dayCls} mx-2`}>{row.days}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.tagCls}`}>{row.tag}</span>
                    </div>
                  ))}

                  <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-xl p-3 sm:p-4">
                    <p className="text-white text-xs sm:text-sm leading-relaxed font-medium">
                      WhatsApp sent: Bluetooth Earphones will stock out in 4 days. Diwali demand forecast is 3.2x normal. Reorder 420 units today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY STOCKOUTS KILL ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Stockouts
              <br />
              <span className="text-red-600 dark:text-red-500">Kill Your Business</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Running out of stock here is not a one-off operational problem. It sets off a chain reaction of costs that compounds for months in a row.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Lost Sales and Revenue", desc: "Every hour your listing shows out of stock, buyers click on a competitor permanently", color: "from-red-500 to-orange-500" },
              { icon: <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Rankings Drop Instantly", desc: "Keyword rankings fall 3 to 5 positions within 72 hours and take 4 to 6 weeks to recover", color: "from-orange-500 to-yellow-500" },
              { icon: <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Customers Buy Competitors", desc: "68% of Indian buyers do not return to your listing even after you restock", color: "from-yellow-500 to-amber-500" },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Festive Revenue Lost Forever", desc: "Going out of stock 3 days before Diwali means that entire festive window is gone for the year", color: "from-amber-500 to-orange-600" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1 text-xs sm:text-base">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{pain.desc}</p>
              </div>
            ))}
          </div>

          {/* Keyword ranking timeline */}
          <div className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-6 sm:mb-8">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 leading-relaxed">Keyword Ranking Timeline During a Stockout</p>
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: "Before stockout", rank: "Page 1 (#8)", pct: 85, color: "bg-green-500", textCls: "text-green-600 dark:text-green-400" },
                { label: "Day 3 out of stock", rank: "Page 2 (#21)", pct: 52, color: "bg-orange-500", textCls: "text-orange-600 dark:text-orange-400" },
                { label: "Day 7 out of stock", rank: "Page 4 (#42)", pct: 24, color: "bg-red-500", textCls: "text-red-600 dark:text-red-400" },
                { label: "After restock", rank: "Page 3 (#31)", pct: 38, color: "bg-yellow-500", textCls: "text-yellow-600 dark:text-yellow-400" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[120px_1fr_100px] sm:grid-cols-[140px_1fr_110px] items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.label}</span>
                  <div className="h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold ${row.textCls} text-right leading-relaxed`}>{row.rank}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg mb-5 sm:mb-6">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2 sm:mb-3 leading-relaxed">
              The most expensive stockout is the <span className="text-orange-600 dark:text-orange-400">3-day gap.</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed text-sm sm:text-base">
              It takes 5 weeks of rebuilding keyword rankings after you restock. For a Flipkart seller earning Rs 2,50,000 per month, one stockout during Big Billion Days costs Rs 80,000 in additional ad spend alone. A reliable <strong>inventory management tool</strong> prevents this entirely.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1.5 sm:mb-2 leading-relaxed">What most stock management tools do not tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">
              Most inventory tools track what you have. Insydz predicts what you will need — factoring in demand trends, festive spikes, competitor stock levels, and your supplier lead times simultaneously. That is the difference between reactive and preventive inventory management.
            </p>
          </div>
        </div>
      </section>

      {/* ══ WHY SPREADSHEETS FAIL ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Spreadsheets and Manual Counts
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">Always Fail at the Worst Moment</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Every Indian seller starts with a spreadsheet or a mental note. Here is exactly why they always miss before Diwali.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Static Data in a Dynamic World", desc: "A spreadsheet updated last Tuesday does not account for a 3x demand spike this Friday ahead of a sale event", color: "from-red-500 to-orange-500" },
              { icon: <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Zero Competitor Stock Visibility", desc: "When competitors run out buyers flood your listing. Without real-time signals you are always reacting too late", color: "from-orange-500 to-amber-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "No Festive Lead-Time Awareness", desc: "Supplier lead time of 8 days plus 3 days transit means you must reorder 11 days before running out. Manual calculation always misses this", color: "from-amber-500 to-yellow-500" },
              { icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Invalid Lead-Time Dilemma", desc: "Holding too much stock ties up capital and inflates storage fees. Only a purpose-built stockout alert tool finds the exact balance automatically", color: "from-yellow-500 to-orange-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-semibold leading-relaxed mb-1 text-xs sm:text-base">{pain.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1.5 sm:mb-2 leading-relaxed">What basic stock management tools do not tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">
              Basic inventory trackers show you stock levels. They cannot tell you that Diwali demand for your category runs 3.2x higher than September, that your supplier takes 11 days to deliver, or that you should have placed that order 14 days ago. The <strong>inventory management analysis tool</strong> inside Insydz does all three — automatically and continuously.
            </p>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Stock Monitoring Works
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">From permission to stockout prediction, accurate and delivered where you will actually act on it.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { step: "1", title: "Connect Inventory", desc: "Connect your Amazon India or Flipkart seller account. Insydz imports your current stock levels, sales velocity, and historical demand patterns in under 2 minutes. No spreadsheet setup required.", icon: <Filter className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />, bg: "bg-orange-50 dark:bg-orange-900/20" },
              { step: "2", title: "AI Predicts Stockouts", desc: "The AI inventory management tool analyses your sales velocity, festive demand forecasts, competitor stock movements, and lead times to calculate the exact reorder date for every SKU in your catalogue.", icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />, bg: "bg-red-50 dark:bg-red-900/20" },
              { step: "3", title: "Get Early Alerts", desc: "Receive a WhatsApp alert 14 days before your critical reorder date, with the recommended order quantity, supplier lead time buffer, and festive demand adjustment already calculated. Act immediately.", icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />, bg: "bg-orange-50 dark:bg-orange-900/20" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg flex-shrink-0">{item.step}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-relaxed">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow">{item.desc}</p>
                <div className={`${item.bg} rounded-2xl p-3 sm:p-4 flex justify-center mt-auto`}>{item.icon}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
              Start a Free Trial
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ CAPABILITIES ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Stop Guessing When to Reorder.
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">Know for Sure.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Real-Time Tracking", title: "1. Real-Time Sales Velocity", desc: "Know exactly how fast each SKU is selling right now. Velocity changes during festive seasons are detected within hours, giving you time to reorder before running out.", link: { text: "See how inventory tracking works", href: "/features/competitor-price-tracking-feature" }, color: "from-orange-500 to-amber-500" },
              { icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Stockout Alert Tool", title: "2. Multi-Tier Stockout Alerts", desc: "Three-tier WhatsApp alert system: 21-day early warning, 10-day reorder alert, and 3-day critical notification. Each includes recommended order quantity and festive demand adjustment.", link: null, color: "from-red-500 to-orange-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Competitive Intelligence", title: "3. Competitor Stock Monitoring", desc: "Track when top competitors run low or go out of stock. Receive alerts when a window opens to capture their buyers — so you are always stocked when rivals are not.", link: null, color: "from-amber-500 to-yellow-500" },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Festive Demand Forecasting", title: "4. Festive Demand Intelligence", desc: "Insydz models demand for Diwali, Big Billion Days, Republic Day Sale, and Great Indian Festival 15 days ahead. Stock the right quantity before demand spikes — not after you run out mid-sale.", link: null, color: "from-orange-600 to-red-600" },
              { icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Inventory Management Analysis Tool", title: "5. Full Inventory Analysis", desc: "Complete SKU-level analysis of sell-through rate, days-on-hand, and reorder frequency. The inventory management analysis tool identifies which products tie up capital and which generate the highest return per rupee invested.", link: null, color: "from-blue-500 to-cyan-500" },
              { icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, badge: "Inventory Tracker Software", title: "6. Supplier Lead-Time Planning", desc: "Set supplier lead times once. Insydz calculates your reorder dates automatically, factoring in transit time, quality check buffer, and Amazon or Flipkart inbound processing windows.", link: null, color: "from-green-500 to-emerald-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{feature.icon}</div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide leading-relaxed">{feature.badge}</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2 sm:mb-3 leading-relaxed">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{feature.desc}</p>
                {feature.link && (
                  <button onClick={() => router.push(feature.link!.href)} className="mt-2 sm:mt-3 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold hover:underline text-left leading-relaxed">{feature.link.text}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDIA-FIRST ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              How Insydz Is Different
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">Built on Indian Marketplace Data</span>
            </h2>
          </div>

          {/* Real scenario */}
          <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-8 sm:mb-12 transition-all hover:shadow-2xl">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mb-4 md:mb-0">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 sm:mb-3 leading-relaxed">Real Seller Scenario — Electronics Seller, Hyderabad</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                  Karan sells Bluetooth earphones on Amazon India. During the 2023 Great Indian Festival, he ran out of stock on Day 4 of a 7-day event. He had no <strong className="text-gray-900 dark:text-white">inventory management tool</strong> in place — just a spreadsheet updated every Sunday. His listing dropped from position 6 to position 38 in 5 days. He missed an estimated Rs 1,40,000 in festive revenue and spent Rs 32,000 on PPC over the next 6 weeks just to recover his organic ranking. Total cost of one stockout: Rs 1,72,000.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  When he started using Insydz the following year, the AI inventory management tool predicted his Big Billion Days demand at 3.4x his September baseline. He reordered 380 units 15 days before the sale. <strong className="text-gray-900 dark:text-white">He sold 362 units. Zero stockout. Rs 2,17,200 in 7 days.</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed">4 India-First Advantages</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">Built specifically for Indian marketplaces, festive demand cycles, and supplier realities.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Indian Domain Data", desc: "Demand and velocity data sourced directly from Amazon India and Flipkart — not extrapolated from Amazon.com or US market trends", color: "from-orange-500 to-amber-500" },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, title: "15-Day Festive Forecasting", desc: "Models demand for Diwali, Big Billion Days, Republic Day Sale, and Great Indian Festival from 15 days ahead with Indian consumer behaviour patterns", color: "from-red-500 to-orange-500" },
              { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Supplier Lead-Time Integration", desc: "Set your supplier lead time once and Insydz automatically calculates reorder dates accounting for Indian logistics realities — monsoon delays, courier strikes, customs clearance", color: "from-amber-500 to-yellow-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitor Stock Monitoring", desc: "Tracks competitor inventory levels on both marketplaces simultaneously — alerts you when rivals run out and when they restock aggressively", color: "from-orange-600 to-red-600" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all h-full flex flex-col">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-lg flex-shrink-0`}>{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed flex-grow">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-orange-200 dark:border-orange-800 shadow-xl">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                <tr className="bg-gradient-to-r from-orange-600 to-red-500 text-white">
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">Capability</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Spreadsheet or Manual</th>
                  <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">Insydz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: "Stockout prediction", manual: "Not possible — reactive only", insydz: "14 to 21 days ahead per SKU" },
                  { capability: "Festive demand forecast", manual: "Manual guess or none", insydz: "Diwali, BBD, Republic Day modelled 15 days ahead" },
                  { capability: "Competitor stock visibility", manual: "Not available", insydz: "Real-time tracking on Amazon India and Flipkart" },
                  { capability: "WhatsApp alerts", manual: "Not available", insydz: "3-tier alerts at 21, 10, and 3 days before stockout" },
                  { capability: "Supplier lead-time integration", manual: "Mental calculation", insydz: "Automated per SKU with buffer calculations" },
                  { capability: "Time to set up", manual: "Ongoing manual effort", insydz: "Under 2 minutes initial setup" },
                ].map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 dark:border-gray-700 transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}`}>
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
              The ROI of
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">Zero Stockouts</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              One seller in electronics. One 90-day period. Here is what September through November looked like with and without the right <strong>inventory management tool</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-10">
            {[
              {
                title: "Manual Inventory Tracking — 90 Days",
                icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-red-600 dark:text-red-400",
                borderCls: "border-red-200 dark:border-red-800",
                rows: [
                  { label: "Products going out of stock", value: "3 of 8 products" },
                  { label: "Average days out of stock per SKU", value: "11 days" },
                  { label: "Revenue lost during stockout period", value: "Rs 74,000" },
                  { label: "Ad spend to recover rankings after restock", value: "Rs 22,000" },
                  { label: "Revenue missed during festive window", value: "Rs 1,40,000" },
                ],
                totalLabel: "Total cost of stockouts across 90 days",
                totalValue: "Rs 2,33,000",
                totalValueCls: "text-red-600 dark:text-red-400",
                totalBorderCls: "border-red-200 dark:border-red-800",
                valueCls: "text-red-600 dark:text-red-400",
              },
              {
                title: "With Insydz AI Inventory Management — 90 Days",
                icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
                titleCls: "text-green-600 dark:text-green-400",
                borderCls: "border-green-200 dark:border-green-800",
                rows: [
                  { label: "Stockout events during the period", value: "0 events" },
                  { label: "WhatsApp reorder alerts triggered", value: "7 alerts" },
                  { label: "Revenue protected from stockouts", value: "Rs 74,000" },
                  { label: "Ad spend avoided through ranking protection", value: "Rs 22,000 saved" },
                  { label: "Festive window revenue captured in full", value: "Rs 1,40,000" },
                ],
                totalLabel: "Net revenue recovered vs the manual approach",
                totalValue: "+Rs 2,36,000",
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

          <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-2xl sm:text-3xl font-black text-orange-700 dark:text-orange-300 mb-2 leading-relaxed">Rs 2.3 Lakhs Revenue Gap</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">between one seller using the right <strong>inventory management tool</strong> and one seller using a spreadsheet and mental notes. The tool costs Rs 1,999 per month.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Start Preventing Stockouts Free
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-xl transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 leading-relaxed">Rs 0</span>
              <span className="text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">/ Forever — No credit card required</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">Free Plan Includes:</p>
            <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              {[
                "10 SKUs tracked with full predictions",
                "Stockout alert tool with 14-day warnings",
                "Festive demand forecasting included",
                "Competitor stock monitoring — 3 competitors",
                "WhatsApp alerts for critical SKUs",
                "Inventory management analysis tool access",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-400 mb-1.5 sm:mb-2 leading-relaxed">Upgrade to unlock:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Unlimited SKUs, multi-supplier lead time planning, full inventory tracker software, 12-month demand history, and the complete AI inventory management tool with agency-level multi-account access.</p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="inline-flex w-auto bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold px-6 py-3 text-sm sm:text-base rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
              >
                Prevent Stockouts Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">Your Rankings Are Too Valuable to Lose to a Stockout.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For Solo Sellers</h3>
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 sm:mb-3 leading-relaxed">Free Plan</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">One seller, 8 to 50 SKUs on Amazon India and Flipkart. Never miss a festive window again. The free inventory management tool covers 10 SKUs with full prediction and WhatsApp alerts.</p>
              <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold rounded-full text-sm py-5 transition-all">Start Free — No Card Needed</Button>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-red-600 border-2 border-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all relative overflow-hidden flex flex-col h-full group hover:scale-[1.02]">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-md z-10">Most Popular</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-relaxed">For Growing Sellers</h3>
              <p className="text-xs font-semibold text-orange-100 mb-2 sm:mb-3 leading-relaxed">Growth Plan</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Scaling past Rs 5 lakh per month on Indian marketplaces. Every stockout now costs serious money. Get the full AI inventory management tool with unlimited SKUs and festive demand intelligence.</p>
              <Link href="/pricing" className="w-full bg-white hover:bg-gray-100 text-orange-700 font-bold rounded-full text-sm inline-block text-center py-2.5 px-4 transition-all">Try Growth Plan</Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1 flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For D2C Brands and Agencies</h3>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 sm:mb-3 leading-relaxed">Strategic Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Multiple brands, dozens of SKUs, critical festive windows. Full portfolio inventory intelligence, white-label reporting, and API access for agency-level management.</p>
              <Link href="/solutions/ecommerce-agencies" className="w-full border-2 border-orange-600 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold rounded-full text-sm inline-block text-center py-2 px-4 transition-all">Book a Demo</Link>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 text-xs sm:text-sm leading-relaxed">No credit card required &nbsp;·&nbsp; Setup in 2 minutes &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Inventory Management <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">FAQs</span>
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-orange-600 via-red-500 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white leading-relaxed">
            Never Run Out of Stock Again.
            <br />
            <span className="text-orange-100">Know for Sure.</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            India's most powerful inventory management tool for Amazon India and Flipkart — free to start.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
            Start Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">No credit card required &nbsp;·&nbsp; Setup in 2 minutes &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
          Prevent Stockouts Free
        </Button>
      </div>

      <div className="lg:hidden h-16 sm:h-20" />
    </div>
  );
}
