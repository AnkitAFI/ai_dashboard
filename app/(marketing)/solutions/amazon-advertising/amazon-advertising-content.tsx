"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  ShoppingBag, Smartphone, Lightbulb, Search, MessageCircle, 
  DollarSign, ShieldCheck, CheckSquare, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQAccordion, StickyMobileCTA } from "@/components/solutions";
import type { FAQItem } from "@/components/solutions";

export const dynamic = "force-static";

// ─── Page Data ────────────────────────────────────────────────────────────────

const coreFeatures = [
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: "60-Day Visual Trend Graphs",
    desc: "Stop blindly trusting AI. We plot a 60-day visual graph of your Spend vs Sales for every keyword, so you can mathematically verify why a bid should be lowered before you click approve.",
    bullets: [
      "Visually tracks ACOS vs Spend for the last 60 days on every keyword",
      "Validates AI recommendations with hard visual proof",
      "Removes the 'black box' so you never guess why a bid changed",
      "Easy-to-read dual-axis Recharts",
    ],
    scenario: "Our engine suggests dropping a bid. You click the trend icon and instantly see the keyword has spent ₹2,000 this week with zero sales. You confidently hit Approve.",
    link: "/signup",
    linkLabel: "Get notified on launch →",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Target className="w-10 h-10" />,
    title: "Rule-Based Target-ACOS Bid Recommendations",
    desc: "Never guess how much to bid on a keyword again. Our system calculates the exact bid needed to hit your ACOS target so you protect your profit margins on every single click.",
    bullets: [
      "Calculates recommended bids based on your Target ACOS and actual sales data",
      "Recommends higher bids on top-selling 'Winner' keywords to scale",
      "Recommends lowering bids on 'Bleeder' keywords so you stop wasting money",
      "Simple 1-click execution right to the Amazon Ads API",
    ],
    scenario: "Your keyword is spending at 40% ACOS while your goal is 25%. Our tool recommends lowering your bid from ₹20 to ₹12.50 so you stay profitable.",
    link: "/signup",
    linkLabel: "Get notified on launch →",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: <Clock className="w-10 h-10" />,
    title: "Smart Ad Scheduling for Indian Sellers",
    desc: "Stop paying for useless clicks at 3 AM. Insydz automatically pauses your campaigns during off-peak hours and wakes them up when Indian buyers are actually awake and shopping.",
    bullets: [
      "1-Click toggle to enable Smart Scheduling on any campaign",
      "Perfectly timed for Indian shoppers",
      "Prevents midnight click fraud and competitor exhaustion",
      "Runs seamlessly in the background without complicated integrations",
    ],
    scenario: "You click the 'Clock' icon on your best campaign. Insydz now safely pauses it at 12 AM and re-enables it at 6 AM every day, saving you ₹15,000/month in wasted night clicks.",
    link: "/signup",
    linkLabel: "Get notified on launch →",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: <CheckSquare className="w-10 h-10" />,
    title: "24/7 Custom Automation Rules",
    desc: "Create your own smart rules in seconds without any coding. Tell the system exactly when to cut bad spending or boost top sellers, and let it run automatically around the clock.",
    bullets: [
      "Simple visual builder for custom automation rules",
      "Example: IF ACOS > 40% AND Clicks > 15, THEN Decrease Bid by 15%",
      "Rules run continuously in the background to protect your budget",
      "Complete History Log so you can undo any changes easily",
    ],
    scenario: "You build a 'Stop Wasting Money' rule. Now, anytime a keyword gets 20 clicks with 0 sales, Insydz automatically slashes the bid by 20% to protect your budget.",
    link: "/signup",
    linkLabel: "Get notified on launch →",
    color: "from-blue-500 to-purple-500",
  },
];

const comparisonRows = [
  {
    feature: "How Bids Are Calculated",
    insydz: "Rule-based math based on your Target ACOS",
    others: "Blind guessing or hallucinating AI models",
  },
  {
    feature: "Transparency & Trust",
    insydz: "60-Day Visual Trend Graphs for every keyword",
    others: "Black-box suggestions with no proof",
  },
  {
    feature: "Smart Scheduling",
    insydz: "Built-in, timed perfectly for Indian shoppers",
    others: "Requires messy integrations and global timezone math",
  },
  {
    feature: "Custom Automations",
    insydz: "Simple Visual Rule Builder",
    others: "Forced to use their confusing templates",
  },
  {
    feature: "Account Safety",
    insydz: "Complete History Log so you can undo any changes",
    others: "Changes made silently in the background",
  },
];

const roiLeakage = [
  { label: "Bidding too high on unprofitable keywords", value: "−₹48,000" },
  { label: "Wasted clicks between 12 AM and 6 AM", value: "−₹36,000" },
  { label: "Lost organic sales from poor keyword visibility", value: "−₹32,000" },
  { label: "Hours wasted sorting Excel spreadsheets", value: "−₹22,000" },
];

const roiRecovery = [
  { label: "Smart bid recommendations protecting margin", value: "+₹45,000" },
  { label: "Smart Ad Scheduling pausing ads at night automatically", value: "+₹34,000" },
  { label: "24/7 automation rules protecting your budget", value: "+₹28,000" },
  { label: "10+ hours/week saved → reinvested in business", value: "+₹14,000" },
];

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    q: "What is Insydz Amazon PPC & Advertising software?",
    a: "Insydz is an Amazon Advertising management platform developed by AAVAPTI TECHNOLOGIES PRIVATE LIMITED. It helps Amazon India sellers easily optimize their ad campaigns, stop wasting money on bad clicks, and automatically scale top-performing keywords to maximize profits.",
  },
  {
    id: "faq-2",
    q: "How does the Smart Ad Scheduling work?",
    a: "Our background engine checks your campaigns every hour. If you enable it, it will automatically pause your campaigns during quiet night hours to prevent click fraud or low-converting traffic, and re-enable them in the morning for peak shopping times.",
  },
  {
    id: "faq-3",
    q: "How does Insydz calculate recommended keyword bids?",
    a: "Instead of guessing, Insydz calculates recommended bids based on your Target ACOS (the maximum percentage of sales you want to spend on ads). It automatically finds the exact bid needed to hit your profitability goal.",
  },
  {
    id: "faq-4",
    q: "Does Insydz blindly use AI to change my bids?",
    a: "No. To guarantee your budget is safe, Insydz calculates all keyword bids using smart, data-driven formulas based on your exact profit goals. This ensures your ad spend is always protected and optimized for real sales, not just clicks.",
  },
  {
    id: "faq-5",
    q: "What are Custom Automation Rules?",
    a: "It is a simple tool that lets you create your own automation strategies without any coding. For example, you can tell the system: 'If a keyword is losing money, lower the bid automatically.' It runs 24/7 in the background to protect your margins.",
  },
  {
    id: "faq-6",
    q: "Is Insydz suitable for sellers on Amazon India?",
    a: "Yes! Insydz is built exclusively for Amazon India. This means our Smart Ad Scheduling is timed perfectly for Indian shoppers, eliminating the global timezone issues found in other expensive PPC tools.",
  },
  {
    id: "faq-7",
    q: "Is the PPC Optimizer live right now?",
    a: "The Amazon Advertising & PPC optimization suite is coming soon! Join the waitlist today to get notified the moment it launches for sellers.",
  },
];

export default function AmazonAdvertisingContent() {
  const router = useRouter();

  const handleGetStarted = () => router.push("/signup");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-12">
      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
                <h1 className="text-sm font-medium text-purple-700 dark:text-purple-300">Amazon Advertising & PPC Optimization Tool · COMING SOON</h1>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Stop Wasting Ad Spend.
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Scale Profitable Sales
                </span>
                <br />
                with Smart PPC Rules.
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India&apos;s simple <strong>Amazon PPC & Advertising Tool</strong> for sellers. Get smart keyword and bid recommendations with
                <span className="text-purple-700 dark:text-purple-400 font-semibold"> 100% seller control — never blind AI or risky automatic bidding.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-5 text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group"
                >
                  Get Notified on Launch
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="w-full sm:w-auto border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-purple-500/10">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">Sponsored Products — Airdopes 141</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            14% ACOS (Target: 25%)
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">4.8x Return on Ad Spend</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-600 rounded-r-2xl p-5 shadow-md">
                    <div className="flex items-start gap-3">
                      <Search className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white leading-relaxed">Winning Keyword Found!</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Recommend adding <span className="text-purple-600 dark:text-purple-400 font-bold">&quot;boat airdopes 141 black&quot;</span> as Exact Match</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">3 orders below Target ACOS · Protect budget in Auto</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">Bid Recommendation Ready</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">Recommend lowering bid from ₹20.00 → ₹12.50 · Waiting for your approval</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">100% Seller Control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PAIN POINTS ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Most Amazon Sellers
              <br />
              <span className="text-red-600">Waste Ad Spend</span> (Without Realising It)
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              You&apos;re running ads and trying to grow sales, but small everyday inefficiencies quietly eat into your profit margins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { icon: <TrendingDown className="w-8 h-8" />, title: "You bid blindly without calculating your target profit margin", color: "from-red-500 to-pink-500" },
              { icon: <Search className="w-8 h-8" />, title: "You spend ₹10,000+ a month on search terms that get zero sales", color: "from-purple-500 to-pink-500" },
              { icon: <Clock className="w-8 h-8" />, title: "You waste hours copying & pasting ad reports in Excel spreadsheets", color: "from-pink-500 to-rose-500" },
              { icon: <BarChart3 className="w-8 h-8" />, title: "You don't track true Total ACOS across both organic & paid sales", color: "from-indigo-500 to-purple-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-purple-400 hover:shadow-xl transition-all group shadow-sm flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                  {pain.icon}
                </div>
                <p className="text-gray-900 dark:text-white font-bold leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-400 dark:border-purple-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">
              Most Amazon sellers lose <span className="text-red-600">25–40% of their ad spend every month</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
              due to unmonitored bids, ignored zero-sale search terms, and manual spreadsheet delays <br />none of which show up clearly in standard Seller Central dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION / COMPARISON ──────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              Why Sellers Prefer
              <br />
              <span className="text-purple-600">100% Control vs. Risky Automation</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Black-box automation tools can make crazy changes and waste your budget. Insydz gives you clear, math-based recommendations that you review and approve in 1-click.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="grid grid-cols-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-5 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-black text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Feature</p>
              </div>
              <div className="bg-purple-600 px-6 py-5 border-b-2 border-purple-500 shadow-inner">
                <p className="font-black text-white text-sm text-left uppercase tracking-wider">✓ Insydz</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-5 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-black text-gray-500 text-sm text-left uppercase tracking-wider">Global Tools</p>
              </div>

              {comparisonRows.map((row, i) => (
                <div key={i} className="contents">
                  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-900 dark:text-gray-300 font-bold leading-relaxed">{row.feature}</p>
                  </div>
                  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 text-left flex items-center ${i % 2 === 0 ? "bg-purple-50 dark:bg-purple-900/10" : "bg-purple-50/50 dark:bg-purple-900/10"}`}>
                    <p className="text-sm text-purple-700 dark:text-purple-400 font-black leading-relaxed">{row.insydz}</p>
                  </div>
                  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 text-left flex items-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{row.others}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center mt-8 text-sm">
            <Link href="/pricing" className="text-purple-600 hover:text-purple-700 font-black underline underline-offset-4 decoration-2">
              See pricing tiers and seller plans →
            </Link>
          </p>
        </div>
      </section>

      {/* ── SECTION 4: DEEP FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              Your Amazon Ad Assistant
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Built for India</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz is designed to be simple and actionable. Instead of showing confusing charts,
              <span className="text-purple-700 dark:text-purple-400 font-bold"> it tells you which keywords to add and what bids to adjust.</span>
            </p>
          </div>

          <div className="space-y-12">
            {coreFeatures.map((feat, i) => (
              <div key={i} className="grid lg:grid-cols-2 gap-10 items-start">
                <div className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl hover:border-purple-400 transition-all group ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-relaxed">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-medium">{feat.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {feat.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={feat.link} className="text-sm font-black text-purple-600 hover:text-purple-700 flex items-center gap-2 group/link">
                    {feat.linkLabel}
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className={`bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-3xl p-8 shadow-inner ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">Real Scenario</p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-200 leading-relaxed italic text-lg font-medium">&quot;{feat.scenario}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              How Insydz Works
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">for Amazon Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              You don&apos;t need an agency or Excel spreadsheets. Setup is simple and secure.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Connect Amazon Ads", desc: "Connect your Amazon Advertising account securely. We only request advertising campaign permissions—never store passwords.", icon: <BarChart3 className="w-10 h-10" />, color: "bg-purple-100 text-purple-600" },
              { step: "2", title: "Automated Daily Analysis", desc: "Every night, our engine scans your search term reports and checks your keyword profitability.", icon: <BarChart3 className="w-10 h-10" />, color: "bg-pink-100 text-pink-600" },
              { step: "3", title: "1-Click Approve", desc: "Review your daily checklist and click Approve in 1-click — you stay in 100% control of every bid change.", icon: <Zap className="w-10 h-10" />, color: "bg-green-100 text-green-600" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-purple-400 transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black text-white shadow-md">{item.step}</div>
                <div className={`${item.color} rounded-2xl p-6 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 shadow-sm`}>{item.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all group w-full sm:w-auto"
            >
              Get Notified on Launch
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ROI EXAMPLE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              What Insydz Is Worth to a Seller
              <br />
              <span className="text-purple-600">Spending ₹3L/Month on Ads</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl border-2 border-red-200 dark:border-red-900 overflow-hidden shadow-xl bg-white dark:bg-gray-950">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-5 border-b border-red-100 dark:border-red-900">
                <p className="font-black text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Monthly Ad Spend Wasted
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {roiLeakage.map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{row.label}</p>
                    <p className="text-sm font-black text-red-600 ml-4">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-red-50/50 dark:bg-red-900/10">
                  <p className="font-black text-gray-900 dark:text-white">Total Wasted</p>
                  <p className="font-black text-red-700 text-xl">−₹1,38,000</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-green-200 dark:border-green-900 overflow-hidden shadow-xl bg-white dark:bg-gray-950">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-5 border-b border-green-100 dark:border-green-900">
                <p className="font-black text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Monthly Profit Recovery
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {roiRecovery.map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{row.label}</p>
                    <p className="text-sm font-black text-green-600 ml-4">{row.value}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-green-50/50 dark:bg-green-900/10">
                  <p className="font-black text-gray-900 dark:text-white">Total Recovery</p>
                  <p className="font-black text-green-700 text-xl">+₹1,21,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-center shadow-2xl">
            <p className="text-white text-lg font-bold mb-2 opacity-90 uppercase tracking-widest">Net Value Unlocked</p>
            <p className="text-white text-4xl sm:text-5xl font-black mb-2 leading-tight">₹2,59,000 / month</p>
            <p className="text-white/80 font-medium">Conservative estimate based on actual Amazon India seller data</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 leading-relaxed">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={faqs} accentColor="purple" variant="card" />
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to Take Control of Your Amazon Ad Spend?
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Join thousands of Indian sellers who use Insydz to track competitors, optimize prices, and scale their Amazon business.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "New Sellers", desc: "Just starting? Get free seller insights.", cta: "Start Free", action: handleGetStarted },
              { label: "Growing Brands", desc: "Scale with automated pricing & SEO.", cta: "View Pricing", action: () => router.push("/pricing") },
              { label: "Agencies", desc: "Manage client portfolios with ease.", cta: "Book Demo", action: () => router.push("/about/contact-us") },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left flex flex-col h-full hover:bg-white/20 transition-all group">
                <p className="font-black text-white mb-2 uppercase tracking-wider text-xs">{card.label}</p>
                <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">{card.desc}</p>
                <button onClick={card.action} className="mt-auto text-purple-200 font-black text-sm hover:text-white transition-colors underline underline-offset-4 decoration-2">
                  {card.cta} →
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-white hover:bg-gray-100 text-purple-700 font-black px-12 py-6 text-lg rounded-full shadow-2xl group transition-all hover:scale-105"
            >
              Get Notified on Launch
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <p className="text-white/80 mt-10 text-sm font-medium">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Native Indian support</p>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-xs text-white/80">
              <strong className="text-white">AAVAPTI TECHNOLOGIES PRIVATE LIMITED</strong> is a registered software development company building Amazon seller analytics and PPC optimization solutions.
            </p>
          </div>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <StickyMobileCTA
        label="Get Notified on Launch"
        href="/signup"
        gradient="from-purple-500 to-pink-500"
        borderColor="border-purple-300 dark:border-purple-700"
      />
    </div>
  );
}
