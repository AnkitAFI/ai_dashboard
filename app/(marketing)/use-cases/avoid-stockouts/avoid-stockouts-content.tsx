"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Package, AlertCircle, TrendingUp, ChevronRight, Bell, Clock,
  ChevronDown, ArrowLeft,
  TrendingDown, MessageCircle, Search, Target, Zap,
  Flame, CheckCircle2, BarChart3, Smartphone,
  RefreshCw, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const comparisonRows = [
  { feature: "Stockout prediction", manual: "Static reorder point", insydz: "Real-time velocity + acceleration + festive multipliers" },
  { feature: "Festive demand planning", manual: "Based on last year's sales", insydz: "India festive multipliers applied automatically" },
  { feature: "Competitor stock monitoring", manual: "None", insydz: "Monitors competitor stockout signals in real time" },
  { feature: "Alert delivery", manual: "You remember to check", insydz: "WhatsApp at 14 days, 7 days, 3 days" },
  { feature: "Supplier lead time", manual: "Mental calculation", insydz: "Reorder date auto-calculated per product" },
  { feature: "Multi-platform", manual: "One platform manually", insydz: "Amazon India + Flipkart unified" },
];

const roiWithout = [
  { label: "5 days out of stock during Big Billion Days (₹50K/day)", value: "−₹2,50,000" },
  { label: "Keyword rank drops page 1 #5 → page 4 in 7 days", value: "Rankings destroyed" },
  { label: "4–8 weeks to recover rank (weekly organic loss)", value: "−₹60,000/week" },
  { label: "Extra ad spend to rebuild ranking momentum (6 weeks)", value: "−₹45,000" },
  { label: "Permanent customer loss to competitors", value: "Long-term damage" },
];

const roiWith = [
  { label: "Competitor stockout signal detected 14 days before event", value: "14 days secured" },
  { label: "250 additional units sourced before demand spike", value: "Stock secured" },
  { label: "Full 10-day event covered zero stockout days", value: "0 days lost" },
  { label: "Incremental revenue from additional units", value: "+₹5,20,000" },
  { label: "Keyword ranking maintained — no recovery spend needed", value: "+₹45,000 saved" },
];

const faqs = [
  {
    id: "faq-1",
    q: "How does Insydz predict when I will run out of stock?",
    a: "Insydz combines current inventory level with real sales velocity (last 7, 14, and 30 days), accounts for velocity acceleration, and applies festive demand multipliers for Indian sale events. Your first WhatsApp alert fires when your projected stockout is 14 days away early enough to reorder from most Indian suppliers before running out.",
  },
  {
    id: "faq-2",
    q: "What happens to my Amazon India ranking when I go out of stock?",
    a: "Your listing becomes inactive disappearing from search entirely. When you restock, Amazon treats it as a new listing. Rankings built over weeks can drop 5–15 positions immediately. Recovery after restocking takes 4–8 weeks and requires extra ad spend. Preventing stockouts is far more valuable than recovering from them.",
  },
  {
    id: "faq-3",
    q: "Can Insydz monitor competitor stock levels on Amazon India and Flipkart?",
    a: "Yes. Insydz monitors competitor stock status signals on both platforms detecting when top rivals are running low or going out of stock. When a competitor stocks out, demand shifts to remaining sellers including you. Insydz alerts you to act and capture that demand before they restock.",
  },
  {
    id: "faq-4",
    q: "How is Insydz different from Amazon's built-in inventory management?",
    a: "Amazon's tools show current stock levels and basic reorder alerts. Insydz predicts stockout dates using actual velocity trends (not static averages), monitors competitor stock signals, applies Indian festive demand multipliers, and delivers WhatsApp alerts. Works across Amazon India, Flipkart from a single dashboard.",
  },
  {
    id: "faq-5",
    q: "How far in advance does Insydz alert me before a stockout?",
    a: "First alert at 14 days remaining. Second critical alert at 7 days. Final urgent alert at 3 days. All customisable based on your supplier lead times if your supplier needs 18 days, your first alert fires at 21 days.",
  },
  {
    id: "faq-6",
    q: "Does Insydz work for and D2C sellers?",
    a: "Yes. Insydz supports inventory tracking and stockout prediction across Amazon India, Flipkart from a single dashboard. D2C brands get a unified view of stock levels and projected stockout dates by product so you can prioritise restocking for the channel with the highest velocity and most to lose.",
  },
];

const inventoryCapabilities = [
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: "Real-Time Sales Velocity Tracking",
    desc: "Tracks how fast products are actually selling updated continuously. When velocity accelerates, predicted stockout date adjusts automatically.",
    linkLabel: "inventory management tool",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Bell className="w-7 h-7" />,
    title: "Multi-Tier Stockout Alert Tool",
    desc: "Three-tier WhatsApp alert system: 14-day early warning, 7-day low stock alert, 3-day critical alert. Each includes stock level, days remaining, velocity, and AI-suggested reorder quantity.",
    linkLabel: "stockout alert tool",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: <Eye className="w-7 h-7" />,
    title: "Competitor Stock Monitoring",
    desc: "Monitors when top competitors are running low or going out of stock a leading indicator that demand for your product is about to spike. Get ahead before you run out yourself.",
    linkLabel: "competitor stock monitoring",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Flame className="w-7 h-7" />,
    title: "Festive Demand Intelligence",
    desc: "India-specific festive demand multipliers for Diwali, Big Billion Days, Great Indian Festival, Navratri, and Republic Day Sales applied automatically 4–6 weeks before each event.",
    linkLabel: "festive demand intelligence",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Inventory Management Analysis Dashboard",
    desc: "Full portfolio view sorted by urgency. Critical, healthy, and attention-needed products across Amazon India, Flipkart from one unified dashboard.",
    linkLabel: "inventory tracker software dashboard",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Supplier Lead Time Planning",
    desc: "Set your supplier lead time per product. Insydz back-calculates your reorder date automatically so alerts fire when you need to act, not when it's already too late.",
    linkLabel: "stock management tool",
    color: "from-indigo-500 to-blue-500",
  },
];

export default function AvoidStockoutsPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleGetStarted = () => router.push("/login");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-red-100 border border-red-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-sm font-medium text-red-700">India's #1 AI Inventory Management Tool 🇮🇳</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Never Run Out of Stock
                <br />
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">& Miss Sales Again</span>
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>AI inventory management tool</strong> for Amazon, Flipkart sellers. Insydz predicts exactly when you'll run out of stock and alerts you before it's too late
                <span className="text-red-700 dark:text-red-400 font-semibold"> so you never lose sales, rankings, or momentum to a stockout.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleGetStarted} size="lg"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all group"
                >
                   Prevent Stockouts Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="border-2 border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold px-8 py-6 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-800 rounded-3xl p-6 shadow-2xl transition-all hover:shadow-red-500/10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white leading-relaxed">Inventory Intelligence Dashboard</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
                </div>
                <div className="space-y-3">
                  {/* Critical */}
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-xl p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">🔴 Critical Stock Alert</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Premium Earbuds — 12 units left</p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 leading-relaxed">Selling 4/day — will run out in <strong>3 days</strong></p>
                      </div>
                    </div>
                  </div>
                  {/* Warning */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">🟡 Low Stock Warning</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Smart Watch — 45 units remaining</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mt-1 leading-relaxed">Velocity increasing — restock in 7 days</p>
                      </div>
                    </div>
                  </div>
                  {/* Healthy */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">🟢 Stock Healthy</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">USB-C Cables — 280 units</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1 leading-relaxed">42 days stock at current velocity — reorder due in 28 days</p>
                      </div>
                    </div>
                  </div>
                  {/* WhatsApp */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-xl p-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs leading-relaxed">WhatsApp Alert Sent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">"Premium Earbuds — 3 days to stockout. Reorder now."</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">Live Prediction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: WHY STOCKOUTS KILL YOUR BUSINESS ──────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Stockouts
              <span className="text-red-600"> Kill Your Business</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Running out of stock feels like a small operational problem. It isn't. A stockout on Amazon India or Flipkart starts a chain reaction that costs far more than the units you couldn't sell.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <TrendingDown className="w-8 h-8" />,
                title: "Lost Sales & Revenue",
                desc: "Every day out of stock is zero revenue on that product. A ₹50,000/month product loses ₹8,000–₹10,000 in direct sales for a 5-day stockout before accounting for ranking damage.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: <AlertCircle className="w-8 h-8" />,
                title: "Rankings Drop Instantly",
                desc: "Amazon's algorithm reads a stockout as a signal that your product is no longer viable. Keyword rankings built over weeks fall immediately. Recovery after restocking takes 4–8 weeks and requires extra ad spend.",
                color: "from-orange-500 to-yellow-500",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Customers Buy from Competitors",
                desc: "Buyers don't wait. They buy from whoever is available. Once a customer orders from a competitor and has a good experience, you've lost that buyer not just that order.",
                color: "from-yellow-500 to-red-500",
              },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${p.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{p.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Ranking Timeline */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 mb-10 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center leading-relaxed">Keyword Ranking Timeline During a Stockout</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { stage: "Before Stockout", rank: "#5", status: "Page 1 strong velocity", color: "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300" },
                { stage: "Day of Stockout", rank: "#18", status: "Listing becomes inactive", color: "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300" },
                { stage: "Day 3 Out of Stock", rank: "#34", status: "Algorithm further demotes", color: "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300" },
                { stage: "Day 7+", rank: "Page 4+", status: "Virtually invisible", color: "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300" },
                { stage: "After Restock", rank: "#22", status: "4–8 weeks to recover", color: "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" },
              ].map((t, i) => (
                <div key={i} className={`border-2 rounded-xl p-3 text-center transition-all hover:scale-105 ${t.color}`}>
                  <p className="text-xs font-semibold mb-1 leading-relaxed">{t.stage}</p>
                  <p className="text-xl font-black leading-relaxed">{t.rank}</p>
                  <p className="text-xs mt-1 leading-tight">{t.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl p-6 text-center shadow-md">
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
              The most expensive stockout isn't the 3-day gap.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              It's the <strong>6 weeks of rebuilding keyword rankings</strong> after you restock. For a seller at ₹3L/month revenue, one bad stockout during Big Billion Days can cost ₹60,000–₹90,000 in lost sales then another ₹30,000–₹45,000 in additional ad spend. All for a restocking failure that cost ₹8,000 to prevent.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHY MANUAL TRACKING FAILS ─────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Spreadsheets and Manual Counts
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Always Fail at the Worst Moment</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Every Indian seller starts with a spreadsheet or a mental note. Here's exactly why that approach breaks down always at the worst possible time, like the night before Diwali.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: <RefreshCw className="w-7 h-7" />,
                title: "Static Data in a Dynamic World",
                desc: "A spreadsheet shows stock levels as of the last update. It doesn't account for sales acceleration when your product suddenly sells 3× faster due to a competitor stocking out, a festive promotion, or a ranking improvement. By the time you notice, you're already critical.",
              },
              {
                icon: <Flame className="w-7 h-7" />,
                title: "No Festive Season Intelligence",
                desc: "Manual planning uses last year's sales as baseline. But Indian festive demand doesn't follow a smooth curve a product selling 50 units/day in October last year might sell 150/day this year. Static reorder points miss these spikes every single time.",
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: "Zero Competitor Stock Visibility",
                desc: "When a top competitor goes out of stock, demand for your product spikes. Manual tracking has no way to monitor competitor stock levels so when the spike hits, you're already running lean.",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                title: "Supplier Lead Time Blindness",
                desc: "Placing a reorder at 5 days of stock means nothing if your supplier needs 12 days. Manual tracking doesn't auto-factor your supplier lead times into reorder calculations.",
              },
            ].map((gap, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-300 hover:shadow-lg transition-all h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                    {gap.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">{gap.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{gap.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-r-2xl p-6 shadow-md transition-all hover:translate-x-1">
            <p className="font-bold text-red-700 dark:text-red-400 mb-2 leading-relaxed">What most stock management tools don't tell you:</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Most inventory tools show current stock levels with a simple reorder threshold. Insydz calculates days-of-stock remaining using real-time sales velocity accounting for acceleration, competitor stockout signals, and Indian festive demand multipliers. The gap between <em>"you have 45 units"</em> and <em>"you have 7 days of stock before running out during Diwali week"</em> is the difference between a reorder and a crisis.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Stock Monitoring Works
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              From product connection to stockout prevention automated, accurate, and delivered where you'll actually act on it.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 -translate-y-1/2"></div>
            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                {
                  step: 1,
                  title: "Connect Inventory",
                  desc: "Link Amazon India, Flipkart inventory automatically. Insydz reads current stock levels and begins tracking real-time sales velocity across all products. Setup: under 5 minutes no manual data entry.",
                  visual: <Package className="w-12 h-12 text-red-600 mx-auto" />,
                  bg: "bg-red-100 dark:bg-red-900/20",
                },
                {
                  step: 2,
                  title: "AI Predicts Stockouts",
                  desc: "Calculates exactly when you'll run out based on actual sales velocity, velocity acceleration trends, competitor stock signals, and Indian festive demand multipliers. Not a static reorder point. A live, updating prediction.",
                  visual: <Zap className="w-12 h-12 text-orange-600 mx-auto animate-pulse" />,
                  bg: "bg-orange-100 dark:bg-orange-900/20",
                },
                {
                  step: 3,
                  title: "Get Early Alerts",
                  isAlerts: true,
                },
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 text-center relative z-10 shadow-xl hover:shadow-2xl transition-all h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">{step.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-relaxed">{step.title}</h3>
                  {step.isAlerts ? (
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3 transition-all hover:translate-x-1">
                        <span className="text-red-600 font-bold text-sm leading-relaxed">14 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed"> Early warning. Time to reorder.</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3 transition-all hover:translate-x-1">
                        <span className="text-orange-600 font-bold text-sm leading-relaxed">7 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed"> Low stock. Confirm order placed.</span>
                      </div>
                      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded-lg p-3 transition-all hover:translate-x-1">
                        <span className="text-red-700 font-bold text-sm leading-relaxed">3 days</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed"> Critical. Escalate immediately.</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center pt-1 leading-relaxed">Each alert includes stock level, velocity & AI reorder qty</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">{step.desc}</p>
                      <div className={`${step.bg} rounded-2xl p-4 transition-all hover:scale-105`}>{step.visual}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl transition-all group">
               Start Preventing Stockouts Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CAPABILITIES ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Full Inventory Intelligence
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Capabilities</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {inventoryCapabilities.map((cap, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-red-400 hover:shadow-lg transition-all flex flex-col h-full">
                <div className={`w-14 h-14 bg-gradient-to-br ${cap.color} rounded-2xl flex items-center justify-center mb-4 text-white shadow-md flex-shrink-0`}>{cap.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 leading-relaxed">{cap.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow">{cap.desc}</p>
                <Link href="/features" className="text-xs font-semibold text-red-600 hover:text-red-700 underline transition-colors">See {cap.linkLabel} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              The ROI of
              <span className="text-red-600"> Zero Stockouts</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Two identical products on Amazon India. One uses Insydz's <strong>stockout alert tool</strong>. One relies on manual reorders. Here's what happens over a 90-day period including Big Billion Days.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            {/* Without */}
            <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden shadow-lg flex flex-col h-full">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 flex-shrink-0"><p className="font-bold text-red-700 dark:text-red-400 leading-relaxed">Manual Inventory Outcome (90 Days)</p></div>
              <div className="bg-white dark:bg-gray-900 flex-grow">
                {roiWithout.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.label}</p>
                    <p className="text-sm font-bold text-red-600 whitespace-nowrap leading-relaxed">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-gray-900 dark:text-white leading-relaxed">Total Cost of Stockouts</p>
                  <p className="font-black text-red-700 text-xl leading-relaxed">−₹3,55,000+</p>
                </div>
              </div>
            </div>
            {/* With */}
            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 overflow-hidden shadow-lg flex flex-col h-full">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 flex-shrink-0"><p className="font-bold text-green-700 dark:text-green-400 leading-relaxed">Insydz Automated Outcome (90 Days)</p></div>
              <div className="bg-white dark:bg-gray-900 flex-grow">
                {roiWith.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.label}</p>
                    <p className="text-sm font-bold text-green-600 whitespace-nowrap leading-relaxed">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-green-50 dark:bg-green-900/20">
                  <p className="font-bold text-gray-900 dark:text-white leading-relaxed">Net Incremental Revenue</p>
                  <p className="font-black text-green-700 text-xl leading-relaxed">+₹5,65,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-400 rounded-2xl p-6 text-center shadow-md">
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">₹9.2 Lakhs Revenue Gap</p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">Same product. Same category. Same marketplaces. The only difference: one seller used <strong>inventory tracker software</strong> to prevent stockouts while the other reacted too late. Don't be the seller who loses 40% of their annual revenue to a preventable shipping delay.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: START FREE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
            Start Preventing Stockouts Free
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">Free Plan — ₹0 / Forever No credit card required</p>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-3xl p-8 mb-8 text-left shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 text-center leading-relaxed">Free Plan Includes:</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Connect up to 5 products for real-time velocity tracking",
                "Basic stockout prediction dates",
                "Standard email reorder alerts",
                "Single marketplace view (Amazon India or Flipkart)",
                "Daily stock status updates",
                "Historical inventory reports (last 30 days)",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-10 text-left shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 leading-relaxed">
              <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-gray-900 dark:text-white">Upgrade teaser:</strong> Paid plans unlock unlimited products, WhatsApp alerts, competitor stock monitoring, Indian festive multipliers, multi-platform unified view, and advanced AI reorder quantity suggestions.</span>
            </p>
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl transition-all group">
             Prevent Your First Stockout Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* ── SECTION 8: ICP CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-600 via-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white leading-relaxed">Your Rankings Are Too Valuable<br />To Lose To a Stockout</h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">Join 12,000+ sellers who protect their Amazon India and Flipkart businesses with AI stockout prediction.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "New Sellers", desc: "The free plan protects your core SKUs while you scale. No risk, no cost, just data.", cta: "Start Free Now →" },
              { label: "Growing Sellers", desc: "Managing 10+ SKUs? Automate everything with the Growth Plan and never check a spreadsheet again.", cta: "Try Growth Plan →" },
              { label: "Agencies & Brands", desc: "Managing multiple client accounts? Unified dashboard, white-label alerts, and bulk reorder planning.", cta: "Book Demo →" },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left transition-all hover:bg-white/15 h-full flex flex-col">
                <p className="font-bold text-white mb-2 leading-relaxed">{card.label}</p>
                <p className="text-white/80 text-sm mb-4 leading-relaxed flex-grow">{card.desc}</p>
                {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="text-white font-semibold hover:underline transition-colors">{card.cta}</Link>
                ) : card.cta === "Book Demo →" ? (
                  <Link href="/about/contact-us" className="text-white font-semibold hover:underline transition-colors">{card.cta}</Link>
                ) : (
                  <Link href="/login" className="text-white font-semibold hover:underline transition-colors">{card.cta}</Link>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-red-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl transition-all group">
             Prevent Stockouts Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-6 text-sm leading-relaxed">✓ 2-minute setup  ✓ No credit card required  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ── SECTION 9: FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">Inventory Management FAQs</h2>
          <p className="text-center text-gray-500 mb-12 text-lg leading-relaxed">About Preventing Stockouts on Amazon & Flipkart India</p>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-red-300 transition-all shadow-sm">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-4 leading-relaxed">{faq.q}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-red-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-red-300 dark:border-red-700 p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 rounded-full shadow-xl transition-all">
           Prevent Stockouts Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
