"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  TrendingUp, Shield,
  BarChart3, ChevronRight,
  Search, X, Check, Eye,
  Sparkles, ChevronDown,
  Brain, Package, Clock,
  LayoutGrid, Flame,
  Lock, Rocket, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function FestiveTrendFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    {
      question: "When will Festive Trend Intelligence be available?",
      answer: "Festive Trend Intelligence is currently in development and will launch before 2026. You can join the waitlist to be notified the moment it goes live waitlist members will get early access before the general release."
    },
    {
      question: "Which Indian festivals will be covered by this tool?",
      answer: "Insydz Festive Trend Intelligence will cover 15+ major Indian festivals including Diwali, Holi, Eid, Navratri, Dussehra, Pongal, Onam, Bihu, Big Billion Day, Republic Day Sale, Independence Day Sale, and more with category-specific demand predictions for each. Regional festivals with e-commerce impact will also be included."
    },
    {
      question: "How far in advance will festive demand predictions be available?",
      answer: "Demand forecasts will be available 4 to 8 weeks before each festive season giving you enough time to source and stock inventory, update your listings with festive keywords, set pricing windows, and rank before your competitors even start preparing."
    },
    {
      question: "Will it work for both Amazon India and Flipkart sellers?",
      answer: "Yes. Insydz Festive Trend Intelligence is built natively for both Amazon India and Flipkart giving you category-level demand signals, festive keyword alerts, and pricing window recommendations across both marketplaces in one dashboard."
    },
    {
      question: "What kind of predictions will it make?",
      answer: "The tool will predict category-level and product-level demand spikes, recommend optimal inventory levels before each festival, identify festive keywords starting to trend weeks before peak search volume, and signal the best pricing windows to maximize margins. All predictions are specific to the Indian marketplace not generic global trend data."
    },
    {
      question: "Is this the same as Amazon's trend tools or Helium 10?",
      answer: "No. Amazon's built-in tools show current trends — not advance forecasts. Helium 10 is built for the US market and doesn't account for Indian festive cycles Diwali, Big Billion Day, Onam, Pongal, or Eid. Insydz Festive Trend Intelligence is built specifically around the Indian festive calendar, with 4–8 week advance demand predictions for both Amazon India and Flipkart sellers."
    },
    {
      question: "Is this available on the free plan?",
      answer: "Festive Trend Intelligence will be available on paid Insydz plans. The exact plan tier details will be announced at launch. Join the waitlist to be notified about pricing and plan availability. Other Insydz features including competitor price tracking, review analytics, and keyword rank tracking — are available on the free plan today."
    },
    {
      question: "How is this different from just watching Google Trends?",
      answer: "Google Trends shows search volume it doesn't tell you what will happen 6 weeks from now on Amazon India or Flipkart, what inventory to stock, what keywords to optimize for, or what price to set. Insydz Festive Trend Intelligence combines years of Indian marketplace demand data with your specific product category and gives you actionable, specific recommendations — not just trend graphs."
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Copy */}
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                  <h1 className="text-sm font-medium text-orange-700">Festive Deal Forecasting Tool for Amazon Flipkart Sellers</h1>
                </div>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Festive Trend Intelligence
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">Sell Before the Season Peaks</span>
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                India's first festive deal forecasting tool for Amazon & Flipkart sellers predicting demand spikes for Diwali, Holi, Eid, and every major Indian festive season,{" "}
                <span className="text-orange-700 dark:text-orange-400 font-semibold">4 to 8 weeks before the rush hits.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl cursor-default opacity-90">
                Join Waitlist Coming 2026
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-orange-500 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-6 text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Diwali, Holi, Eid & 15+ festivals", "4–8 weeks advance predictions", "Amazon India & Flipkart"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual — Upcoming Dashboard Preview */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-orange-500/10">
                {/* Coming Soon overlay */}
                <div className="absolute inset-0 rounded-3xl bg-background/40 dark:bg-gray-900/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-6 py-5 shadow-xl text-center max-w-[80%]">
                    <Lock className="w-8 h-8 text-white mx-auto mb-3 shadow-sm" />
                    <p className="text-white font-black text-lg mb-1 leading-relaxed">Coming Soon</p>
                    <p className="text-orange-100 text-xs leading-relaxed">Feature launching soon — stay tuned</p>
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="space-y-4 opacity-50 select-none">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Festive Trend Dashboard</h3>
                    <span className="text-[10px] sm:text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Live Trends
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { festival: "🪔 Diwali 2025", weeks: "8 weeks away", spike: "+340%", category: "Lights & Decor", bg: "bg-orange-50 border-orange-300" },
                      { festival: "🎨 Holi 2026", weeks: "22 weeks away", spike: "+210%", category: "Colors & Clothing", bg: "bg-pink-50 border-pink-300" },
                      { festival: "🕌 Eid 2026", weeks: "30 weeks away", spike: "+180%", category: "Apparel & Gifts", bg: "bg-green-50 border-green-300" },
                    ].map((item, i) => (
                      <div key={i} className={`${item.bg} border rounded-xl p-4 shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-relaxed">{item.festival}</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{item.weeks}</p>
                          </div>
                          <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold shadow-sm">{item.spike} demand</span>
                        </div>
                        <p className="text-[10px] text-gray-600 leading-relaxed">Top category: {item.category}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 leading-relaxed">15+</div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">Festivals tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 leading-relaxed">8 wks</div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">Advance notice</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-4 py-2 shadow-xl z-20">
                  <p className="text-white font-bold text-sm flex items-center gap-1 leading-relaxed"><Rocket className="w-4 h-4" /> Launching 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Indian Sellers Miss <br /><span className="text-red-600">Festive Season Profits</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              It's not lack of products. It's lack of preparation. Most Indian sellers find out about festive demand when it's already too late to act.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
            {[
              { icon: <Clock className="w-8 h-8" />, title: "Stockouts during peak festive demand", detail: "Product gone exactly when buyers are searching", color: "from-red-500 to-orange-500" },
              { icon: <BarChart3 className="w-8 h-8" />, title: "No advance warning of demand spikes", detail: "You see the trend when it's already peaked", color: "from-orange-500 to-yellow-500" },
              { icon: <Brain className="w-8 h-8" />, title: "Wrong products stocked for the season", detail: "Lakhs in slow-moving inventory after every festival", color: "from-yellow-500 to-orange-500" },
              { icon: <Target className="w-8 h-8" />, title: "Competitors rank first on festive keywords", detail: "Because they started 6 weeks before you did", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-lg transition-all group flex flex-col h-full shadow-sm">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-bold mb-2 leading-relaxed flex-grow">{pain.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{pain.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg mb-16">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">Indian e-commerce sellers lose <span className="text-red-600">lakhs in festive revenue</span></p>
            <p className="text-gray-700 dark:text-gray-300 text-lg italic leading-relaxed">Simply because they didn't prepare in time not because they lacked the products. The seller who stocks up on Diwali lights in September wins. The one who orders in October scrambles.</p>
          </div>
        </div>
      </section>

      {/* ── NEW: WHAT TOOLS DON'T TELL INDIAN SELLERS ── */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
              What Most Ecommerce Trend Tools Don't Tell Indian Sellers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              There are tools that show you what's trending right now. That's not the problem. The problem is that by the time you see it trending, it's already too late to do anything about it.
            </p>
          </div>

          {/* Real scenario callout */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-8 mb-16 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wider">Real scenario — Bengaluru apparel seller, Navratri 2023</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  She saw 'chaniya choli' trending on October 5th. By then, the top listings had been ranking for 6 weeks. Her product was buried on page 4. She ordered stock on October 8th it arrived October 22nd. Navratri ended October 24th. She sold 11 units out of 200 in stock. Dead inventory worth <span className="font-bold text-red-600">₹1.1L</span>.
                </p>
                <p className="text-orange-700 dark:text-orange-400 font-bold mt-4 leading-relaxed">
                  With 8-week advance demand forecasting, she would have started optimizing her listing in mid-August and stocked in early September.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { text: "No Diwali, Eid, Pongal, Onam, or Navratri demand forecasting built for US holidays, not Indian festivals" },
              { text: "No Flipkart coverage India's #2 marketplace is completely invisible to them" },
              { text: "No regional festival data Pongal in Tamil Nadu, Onam in Kerala, Bihu in Assam ignored entirely" },
              { text: "No advance warning they show current trends, not what will spike 6 weeks from now" },
              { text: "No INR-based pricing guidance for Indian festive windows" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm group hover:border-orange-400 transition-all">
                <span className="text-red-500 flex-shrink-0 mt-0.5"><X className="w-5 h-5 font-black" /></span>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI TABLE ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-8 sm:mb-12 text-center leading-relaxed">What Advance Festive Intelligence Is Worth Real ₹ Numbers</h3>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                  <tr>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Situation (Without Insydz)</th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Monthly / Seasonal Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { situation: "Seller stockouts during Diwali peak couldn't restock in time", impact: "₹40,000–₹2,00,000 in missed peak-season sales" },
                    { situation: "Wrong products ordered for festive season slow-moving stock", impact: "₹30,000–₹1,50,000 in stranded inventory" },
                    { situation: "Missed festive keyword ranking window buried on page 3 during peak", impact: "~40–60% reduction in festive organic impressions" },
                    { situation: "Priced too low during peak demand sold out fast but left margin behind", impact: "₹15,000–₹80,000 in lost margin per season" },
                    { situation: "Missed regional festival opportunity Pongal, Onam, Bihu untapped", impact: "₹20,000–₹60,000 in untapped regional festive revenue" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-t border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/50" : ""}`}>
                      <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{row.situation}</td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-sm font-black text-red-600 dark:text-red-400 leading-relaxed">{row.impact}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            Festive Intelligence – <span className="text-orange-600">FAQs</span>
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
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Don't Miss Another
            <br />
            <span className="text-orange-100">Festive Sales Season.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Join the waitlist for Festive Trend Intelligence and win Diwali before it even starts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-white text-black font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  Start Free →
                </Button>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ Early access for waitlist members &nbsp;·&nbsp; ✓ Native Amazon & Flipkart support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
          Join Waitlist
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
