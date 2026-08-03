"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  ShoppingBag, Smartphone, Sun, Moon, ChevronDown, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQAccordion, StickyMobileCTA } from "@/components/solutions";
import type { FAQItem } from "@/components/solutions";

export const dynamic = "force-static";

// ─── Page Data ────────────────────────────────────────────────────────────────

const coreFeatures = [
  {
    icon: <Target className="w-10 h-10" />,
    title: "Automatic Competitor Tracking",
    desc: "Monitor 100+ competitors across your Amazon India category without lifting a finger. Insydz watches price changes, new entrants, and stock levels 24/7.",
    bullets: [
      "Real-time price drop detection (not delayed reports)",
      "Stock-out alerts for top competitors",
      "New competitor launch notifications",
      "Price history charts for any product on Amazon.in",
    ],
    scenario: "Your competitor drops from ₹899 to ₹749 at 11pm. Insydz sends you a WhatsApp alert at 11:02pm. You reprice by morning — before your Buy Box rank slips.",
    link: "/features/competitor-price-tracking-feature",
    linkLabel: "See Amazon price tracker features →",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <MessageCircle className="w-10 h-10" />,
    title: "AI-Powered Review Insights",
    desc: "Stop reading 500 reviews one by one. Insydz's AI reads all your reviews and your competitors' reviews, then tells you what customers actually want and what's hurting your sales.",
    bullets: [
      "Surface top complaints before they become 1-star ratings",
      "See which product attributes drive 5-star scores",
      "Compare your review sentiment vs. top competitors",
      "Identify review patterns tied to returns or refund spikes",
    ],
    scenario: "342 reviews mention 'packaging breaks in transit.' You fix it. Your returns drop 18% and ratings recover within 3 weeks.",
    link: "/features/review-analytics-feature",
    linkLabel: "Explore review intelligence →",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <TrendingUp className="w-10 h-10" />,
    title: "Pricing AI & SEO Recommendations",
    desc: "Insydz doesn't just show you prices it tells you the exact price to set based on competitor moves, your margin floor, and keyword ranking impact. Your all-in-one Amazon seller tool for pricing and SEO, combined.",
    bullets: [
      "AI calculates optimal price against your cost of goods",
      "Keyword rank tracking across Amazon India search pages",
      "Title and bullet point SEO suggestions in plain Hindi/English",
      "Ranking recovery playbook when positions drop",
    ],
    scenario: "Keyword 'wireless earbuds under 1500' drops from rank #5 to #18. Insydz alerts you and recommends: lower price by ₹80, add keyword in bullet point 2. Rank recovers to #7 in 4 days.",
    link: "/features/keyword-rank-tracking-feature",
    linkLabel: "Explore Amazon keyword rank tracker →",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: <Bell className="w-10 h-10" />,
    title: "Instant WhatsApp Alerts",
    desc: "Email gets ignored. WhatsApp gets opened. Insydz sends real-time intelligence directly to your phone so you act in minutes, not days. This is the alert system Indian sellers have always needed.",
    bullets: [
      "Competitor price drops → instant WhatsApp alert",
      "Keyword rank slip → WhatsApp with recommended fix",
      "New negative review surge → alert + AI summary",
      "Configurable thresholds — no alert spam",
    ],
    scenario: "You're at a trade fair in Surat. Competitor drops price. Your phone buzzes. You check Insydz, reprice from mobile. No lost sales, no panic.",
    link: "/features/whatsapp-alerts-feature",
    linkLabel: "See WhatsApp alerts feature →",
    color: "from-green-500 to-emerald-500",
  },
];

const comparisonRows = [
  { feature: "Amazon India data accuracy", insydz: "✓ Native Amazon.in data", others: "⚠ Limited / inaccurate" },
  { feature: "INR pricing & Indian categories", insydz: "✓ Full INR support", others: "✗ USD-based only" },
  { feature: "WhatsApp alerts", insydz: "✓ Real-time WhatsApp", others: "✗ Email only" },
  { feature: "AI pricing recommendations", insydz: "✓ AI-driven", others: "⚠ Manual rules only" },
  { feature: "Review mining for Indian context", insydz: "✓ India-specific AI", others: "⚠ Generic analysis" },
  { feature: "Pricing", insydz: "✓ Free plan + INR tiers", others: "✗ $99–$399/month USD" },
];

const roiLeakage = [
  { label: "Late repricing (avg 3-day lag)", value: "−₹45,000" },
  { label: "Missed review issues (1-star surge)", value: "−₹30,000" },
  { label: "Keyword rank drops (from #5 to #22)", value: "−₹38,000" },
  { label: "Manual tracking hours (12 hrs/week)", value: "−₹20,000" },
];

const roiRecovery = [
  { label: "Repricing within 15 minutes", value: "+₹38,000" },
  { label: "Review fixes before sales drop", value: "+₹24,000" },
  { label: "Keyword rank recovery", value: "+₹32,000" },
  { label: "Time saved → reinvested in growth", value: "+₹18,000" },
];

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    q: "What is the best Amazon seller analytics tool in India?",
    a: "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly.",
  },
  {
    id: "faq-2",
    q: "How does Insydz track competitor prices on Amazon India?",
    a: "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales.",
  },
  {
    id: "faq-3",
    q: "Can Insydz help me improve my Amazon keyword rankings?",
    a: "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one.",
  },
  {
    id: "faq-4",
    q: "Is Insydz suitable for small sellers or beginners on Amazon India?",
    a: "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs.",
  },
  {
    id: "faq-5",
    q: "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?",
    a: "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts.",
  },
  {
    id: "faq-6",
    q: "Does Insydz work for D2C brands and Amazon agencies in India?",
    a: "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features.",
  },
  {
    id: "faq-7",
    q: "What makes Insydz's review analysis different from manual reading?",
    a: "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week.",
  },
];

export default function AmazonSellersContent() {
  const router = useRouter();

  const handleGetStarted = () => router.push("/signup");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-12">
      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                </span>
                <h1 className="text-sm font-medium text-orange-700">Amazon Seller Analytics Tool</h1>
              </div>

              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                Stop Guessing on Amazon.
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Sell Smarter
                </span>
                <br />
                with Real-Time Seller Intelligence.
              </div>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                Insydz is India's most comprehensive <strong>Amazon seller analytics tool</strong> built for sellers doing ₹5L to ₹50L a month. Track competitors, decode reviews, and fix keyword rankings
                <span className="text-orange-700 font-semibold"> without expensive foreign tools or manual Excel work.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button onClick={handleGetStarted} size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-5 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
                >
                  Start Free for Amazon Sellers
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" variant="outline"
                  className="w-full sm:w-auto border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl transition-all hover:shadow-orange-500/10">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">Premium Wireless Earbuds</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">4.5 (2,341)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-2xl p-5 shadow-md">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white leading-relaxed">Competitor Price Drop Alert!</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Top competitor reduced price by <span className="text-red-600 font-bold">12%</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">₹1,999 → ₹1,759</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">WhatsApp Alert Sent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">Instant notification on your phone</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm leading-relaxed">Live Tracking</p>
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
              <span className="text-red-600">Lose Money</span> (Without Realising It)
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              You're doing everything right running ads, maintaining inventory, writing listings. But a handful of invisible problems are quietly eating into your margins every single month.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { icon: <TrendingDown className="w-8 h-8" />, title: "You don't know when competitors change prices until it's too late", color: "from-red-500 to-orange-500" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "You discover bad reviews days after your sales have already dropped", color: "from-orange-500 to-yellow-500" },
              { icon: <Search className="w-8 h-8" />, title: "You guess keywords instead of tracking where your rankings actually stand", color: "from-yellow-500 to-orange-500" },
              { icon: <Clock className="w-8 h-8" />, title: "Manual tracking wastes 8–12 hours every week that should go toward growing", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-orange-400 hover:shadow-xl transition-all group shadow-sm flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                  {pain.icon}
                </div>
                <p className="text-gray-900 dark:text-white font-bold leading-relaxed">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">
              Most Amazon sellers lose <span className="text-red-600">15–30% of profit every month</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
              due to late pricing decisions, ignored review signals, and poor keyword visibility <br />none of which show up in your Seller Central dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DIFFERENTIATION / COMPARISON ──────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              Foreign Tools Were
              <br />
              <span className="text-red-600">Never Built for Indian Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Tools like Helium 10 and Jungle Scout are excellent for Amazon.com. But if you're selling on Amazon India, you're paying for data that doesn't match your market, your categories, or your pricing reality.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="grid grid-cols-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-6 py-5 border-b-2 border-gray-200 dark:border-gray-700">
                <p className="font-black text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Feature</p>
              </div>
              <div className="bg-orange-500 px-6 py-5 border-b-2 border-orange-400 shadow-inner">
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
                  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 text-left flex items-center ${i % 2 === 0 ? "bg-orange-50 dark:bg-orange-900/10" : "bg-orange-50/50 dark:bg-orange-900/10"}`}>
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-black leading-relaxed">{row.insydz}</p>
                  </div>
                  <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 text-left flex items-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{row.others}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center mt-8 text-sm">
            <Link href="/compare/insydzvshelium" className="text-orange-600 hover:text-orange-700 font-black underline underline-offset-4 decoration-2">
              See full Helium 10 comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* ── SECTION 4: DEEP FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">
              Your Amazon Seller Intelligence Brain
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Built for India</span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Insydz is not another dashboard. It's an AI-powered decision engine. Instead of showing you numbers,
              <span className="text-orange-700 dark:text-orange-400 font-bold"> it tells you exactly what to do and when to do it.</span>
            </p>
          </div>

          <div className="space-y-12">
            {coreFeatures.map((feat, i) => (
              <div key={i} className="grid lg:grid-cols-2 gap-10 items-start">
                <div className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl hover:border-orange-400 transition-all group ${i % 2 === 1 ? "lg:order-2" : ""}`}>
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
                  <Link href={feat.link} className="text-sm font-black text-orange-600 hover:text-orange-700 flex items-center gap-2 group/link">
                    {feat.linkLabel}
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className={`bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-3xl p-8 shadow-inner ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Real Scenario</p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-200 leading-relaxed italic text-lg font-medium">"{feat.scenario}"</p>
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
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">for Amazon Sellers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              You don't need a tech team. Setup takes 2 minutes. Intelligence starts flowing immediately.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Connect Store", desc: "Connect your Amazon account or add ASINs. Insydz automatically begins tracking your entire category.", icon: <ShoppingBag className="w-10 h-10" />, color: "bg-orange-100 text-orange-600" },
              { step: "2", title: "AI Analysis", desc: "Our AI scans prices, reviews, and rankings across Amazon India 24/7. No manual Excel work required.", icon: <BarChart3 className="w-10 h-10" />, color: "bg-purple-100 text-purple-600" },
              { step: "3", title: "Actionable Steps", desc: "Get direct, plain-language instructions on price changes, rank drops, and review issues on WhatsApp.", icon: <Zap className="w-10 h-10" />, color: "bg-green-100 text-green-600" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-orange-400 transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black text-white shadow-md">{item.step}</div>
                <div className={`${item.color} rounded-2xl p-6 mb-6 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 shadow-sm`}>{item.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group w-full sm:w-auto"
            >
              Start Free Today
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
              <span className="text-orange-600">Doing ₹15L/Month</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl border-2 border-red-200 dark:border-red-900 overflow-hidden shadow-xl bg-white dark:bg-gray-950">
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-5 border-b border-red-100 dark:border-red-900">
                <p className="font-black text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Monthly Profit Leakage
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
                  <p className="font-black text-gray-900 dark:text-white">Total Leakage</p>
                  <p className="font-black text-red-700 text-xl">−₹1,33,000</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-green-200 dark:border-green-900 overflow-hidden shadow-xl bg-white dark:bg-gray-950">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-5 border-b border-green-100 dark:border-green-900">
                <p className="font-black text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Monthly Recovery
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
                  <p className="font-black text-green-700 text-xl">+₹1,12,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-center shadow-2xl">
            <p className="text-white text-lg font-bold mb-2 opacity-90 uppercase tracking-widest">Net Value Unlocked</p>
            <p className="text-white text-4xl sm:text-5xl font-black mb-2 leading-tight">₹2,45,000 / month</p>
            <p className="text-white/80 font-medium">Conservative estimate based on actual seller data from Amazon India</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 leading-relaxed">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={faqs} accentColor="orange" variant="card" />
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to Stop Losing Money on Amazon?
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Join thousands of Indian sellers who use Insydz to recover profits and scale their Amazon business.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "New Sellers", desc: "Just starting? Get free category insights.", cta: "Start Free", action: handleGetStarted },
              { label: "Growing Sellers", desc: "Scale with AI pricing and SEO.", cta: "View Pricing", action: () => router.push("/pricing") },
              { label: "Agencies", desc: "Manage portfolios with ease.", cta: "Book Demo", action: () => router.push("/about/contact-us") },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left flex flex-col h-full hover:bg-white/20 transition-all group">
                <p className="font-black text-white mb-2 uppercase tracking-wider text-xs">{card.label}</p>
                <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">{card.desc}</p>
                <button onClick={card.action} className="mt-auto text-orange-200 font-black text-sm hover:text-white transition-colors underline underline-offset-4 decoration-2">
                  {card.cta} →
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg"
              className="bg-white hover:bg-gray-100 text-orange-700 font-black px-12 py-6 text-lg rounded-full shadow-2xl group transition-all hover:scale-105"
            >
              Start Free for Amazon Sellers
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <p className="text-white/80 mt-10 text-sm font-medium">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Native support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <StickyMobileCTA
        label="Start Free for Amazon Sellers"
        href="/signup"
        gradient="from-orange-500 to-red-500"
        borderColor="border-orange-300 dark:border-orange-700"
      />
    </div>
  );
}
