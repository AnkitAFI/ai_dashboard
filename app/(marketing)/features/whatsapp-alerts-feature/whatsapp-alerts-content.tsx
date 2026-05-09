"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Target, Zap,
  Bell, TrendingUp, TrendingDown, Shield,
  BarChart3, ChevronRight, AlertCircle,
  Search, X, Check, Eye, Sparkles,
  ChevronDown, Award, DollarSign, Users,
  Brain, Package, ThumbsUp, MessageCircle,
  Smartphone, LayoutGrid, Flame, ArrowLeft, RefreshCw, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function WhatsAppAlertsFeaturePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    {
      question: "How do I set up WhatsApp alerts for Amazon seller notifications?",
      answer: "Setting up Insydz WhatsApp alerts takes 60 seconds and requires no technical knowledge. Connect your WhatsApp by scanning a QR code inside your Insydz dashboard, choose which alert types you want (price changes, Buy Box, stockouts, reviews, rank changes), set your thresholds, and you're live. The first alert arrives within minutes of setup. No app installation required alerts arrive directly in your existing WhatsApp."
    },
    {
      question: "Which alerts can I receive on WhatsApp for my Amazon India store?",
      answer: "Insydz delivers six types of WhatsApp alerts for Amazon India and Flipkart sellers: Price Change Alerts, Buy Box Lost Alert, Stockout Warnings, New Review Alerts (1-star and 2-star reviews flagged immediately), Rank Change Alerts, and AI Opportunity Alerts. All six are included on the free plan."
    },
    {
      question: "Will I be spammed with too many WhatsApp messages?",
      answer: "No. Insydz gives you full control over alert frequency and thresholds. You set the minimum price change percentage that triggers a price alert, the stock level that triggers a stockout warning, which review star ratings trigger a notification, and quiet hours. Most sellers receive 3–8 targeted alerts per day, not hundreds of noise notifications."
    },
    {
      question: "Does this work with WhatsApp Business?",
      answer: "Yes. Insydz WhatsApp alerts work with both regular WhatsApp and WhatsApp Business. You can also add multiple WhatsApp numbers useful if you want alerts going to both you and a team member or VA who manages your listings."
    },
    {
      question: "Are WhatsApp alerts available on the free plan?",
      answer: "Yes. The free plan includes WhatsApp alerts for price changes, stockout warnings, basic Buy Box alerts, and review notifications permanently, with no credit card required and no expiry date. Paid plans (₹1,999/month and ₹2,999/month) unlock unlimited alerts, multiple WhatsApp numbers, instant delivery (under 2 minutes), and custom alert templates."
    },
    {
      question: "Can multiple team members receive the same WhatsApp alerts?",
      answer: "Yes. On paid plans (₹1,999/month and ₹2,999/month), you can add multiple WhatsApp numbers. Each team member can be assigned specific alert types the operations manager gets stockout warnings, the pricing manager gets price and Buy Box alerts, and the founder gets a daily digest. Agencies can send client-specific alerts directly to individual seller WhatsApp numbers."
    },
  ];

  const alertTypes = [
    {
      title: "Price Change Alerts",
      desc: "Competitor dropped price by 10%+ on your top product",
      detail: "Know the moment a competitor reprices before you lose the Buy Box to a lower price. Set your sensitivity threshold so you only get alerted when it actually matters.",
      color: "border-green-400 bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Stockout Warnings",
      desc: "Only 12 units left. Reorder now to avoid stockout",
      detail: "Get notified when inventory drops below your reorder threshold before you run out, lose rank, and hand sales to competitors during a festive sale peak.",
      color: "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "New Review Alerts",
      desc: "1-star review received on Wireless Earbuds Pro",
      detail: "1-star and 2-star reviews flagged the moment they land in Hindi and English. Respond, escalate, or request removal before it damages your rating. The only instant alert tool for sellers that processes both languages.",
      color: "border-red-400 bg-red-50 dark:bg-red-900/20"
    },
    {
      title: "Buy Box Lost Alert",
      desc: "You lost Buy Box on Phone Case Bundle act now",
      detail: "The single most expensive event for any Amazon seller losing the Buy Box silently. Get alerted the moment it happens with the current competitor price, so you can reprice in minutes.",
      color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "AI Opportunity Alert",
      desc: '"budget earbuds" low competition, 18K searches/mo',
      detail: "Not just alerts about what's going wrong alerts about what's going right for you to act on. New low-competition, high-demand products surfaced in your category as AI detects them.",
      color: "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Rank Change Alert",
      desc: "Your keyword rank improved from #12 to #4 today!",
      detail: "Track your keyword rank movement in real time. Get notified when you break into the top 10, or when a rank drop signals a listing issue you need to act on immediately.",
      color: "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
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
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2">
                <h1 className="text-sm font-medium text-green-700">Amazon Seller WhatsApp Notification Tool</h1>
              </div>
              <div className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                WhatsApp Alerts
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">Get Notified</span>
                <br />
                Where You Actually Look
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                India's only Amazon seller WhatsApp notification tool delivers instant price alerts, Buy Box warnings, stockout signals, and bad review flags straight to the app you check 50 times a day.
                <span className="text-green-700 font-semibold"> Because you check WhatsApp 50× a day not your email.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-5 text-lg rounded-full transition-all"
                >
                  Start Free →
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-green-600 text-green-700 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold px-8 py-5 text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["Instant delivery", "No extra app needed", "Full alert control"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual: WhatsApp Mockup */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-6 shadow-2xl max-w-sm mx-auto transition-all hover:shadow-green-500/10">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">Insydz Alerts</p>
                    <p className="text-[10px] text-green-600 font-bold leading-relaxed animate-pulse">● Online</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {  msg: "Price Alert!\nCompetitor dropped Wireless Earbuds to ₹999 (was ₹1,299)\nYour price: ₹1,199\nAction needed to win Buy Box!", time: "10:23 AM", urgent: true },
                    {  msg: "Low Stock Warning!\nPhone Case Bundle: Only 8 units left\nReorder ASAP to avoid stockout this weekend", time: "11:45 AM", urgent: false },
                    {  msg: "New Review Alert!\n1★ review on Gaming Mouse X1\n\"stopped working after 2 weeks\"\nRespond quickly to protect rating!", time: "2:17 PM", urgent: true },
                  ].map((msg, i) => (
                    <div key={i} className={`rounded-2xl rounded-tl-sm p-4 shadow-sm ${msg.urgent ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'}`}>
                      <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">{msg.msg}</p>
                      <p className="text-[10px] text-gray-400 mt-2 text-right">✓✓ {msg.time}</p>
                    </div>
                  ))}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-bold">Got it! Adjusting price now</p>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">✓✓ 2:18 PM</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm flex items-center gap-1 leading-relaxed"><Smartphone className="w-4 h-4" /> WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Types Grid */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">6 Types of Alerts That Save Your Business</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">Never miss a critical event again get the right alert at the right time, directly on your WhatsApp.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alertTypes.map((alert, i) => (
              <div key={i} className={`border-2 ${alert.color} rounded-3xl p-8 hover:shadow-xl transition-all group shadow-sm flex flex-col h-full`}>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-relaxed">{alert.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed flex-grow">{alert.detail}</p>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-inner italic">
                  <p className="text-xs text-green-600 dark:text-green-400 font-black leading-relaxed">"{alert.desc}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-relaxed">
              Why Email Alerts <br /><span className="text-red-600">Don't Work for Sellers</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: <Clock className="w-8 h-8" />, title: "Emails sit unread for hours", detail: "A price alert at 11pm means you see it at 9am by which point you've already lost 10 hours of Buy Box.", color: "from-red-500 to-orange-500" },
              { icon: <AlertCircle className="w-8 h-8" />, title: "Critical alerts lost in spam", detail: "Your email client doesn't know the difference between a Buy Box alert and a promotional newsletter.", color: "from-orange-500 to-yellow-500" },
              { icon: <Eye className="w-8 h-8" />, title: "You check WhatsApp, not dashboards", detail: "Most sellers check their phones dozens of times a day and their email twice.", color: "from-yellow-500 to-orange-500" },
              { icon: <TrendingDown className="w-8 h-8" />, title: "Slow reaction = lost sales", detail: "In a Big Billion Days scenario, 4 hours of missed Buy Box can mean ₹1–3L in lost revenue.", color: "from-orange-500 to-red-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:border-green-400 hover:shadow-lg transition-all group flex flex-col h-full shadow-sm">
                <div className={`w-16 h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-900 dark:text-white font-black mb-2 leading-relaxed">{pain.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{pain.detail}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-relaxed">Indians open <span className="text-green-600">WhatsApp 50+ times daily</span> but check email twice</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">Your alerts should be where your attention already is. Not where it isn't.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">Set Up in 60 Seconds</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              No technical knowledge needed no app installation, no API keys, no developer required.
              <span className="text-green-700 dark:text-green-400 font-bold"> Connect WhatsApp, choose alerts, and you're live.</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Connect your WhatsApp", detail: "Scan the QR code inside your Insydz dashboard. Takes 10 seconds. Works with personal WhatsApp and WhatsApp Business.", icon: <Smartphone className="w-10 h-10" /> },
              { step: "2", title: "Choose your alerts", detail: "Pick which alert types matter to your business price changes, Buy Box, stockouts, reviews, rank changes, or AI opportunities.", icon: <Bell className="w-10 h-10" /> },
              { step: "3", title: "Set your thresholds", detail: "Control when and how often you're notified. Set quiet hours, minimum price change %, and stock level triggers to avoid noise.", icon: <Shield className="w-10 h-10" /> },
              { step: "4", title: "React instantly", detail: "Take action before competitors do. Reprice, reorder, or respond to reviews in minutes not the next morning when you check your email.", icon: <Zap className="w-10 h-10" /> },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg hover:border-green-400 transition-all group flex flex-col h-full">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-black text-white shadow-md">{item.step}</div>
                <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-6 mb-6 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">{item.icon}</div>
                <p className="text-gray-900 dark:text-white font-bold mb-3 leading-relaxed flex-grow">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">What WhatsApp Alerts Do for Your Business</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap />,
                title: "React in minutes, not hours",
                detail: "The window between a competitor repricing and you winning the Buy Box is measured in minutes. WhatsApp alerts make you the fastest responder.",
                color: "text-green-600"
              },
              {
                icon: <Shield />,
                title: "Protect from stockouts",
                detail: "Running out of stock during festive peaks doesn't just cost today's sales it collapses your rank. Stockout warnings prevent this entirely.",
                color: "text-blue-600"
              },
              {
                icon: <Star />,
                title: "Guard your reputation",
                detail: "A 1-star review responded to within 2 hours has a materially different impact. Fast response signals that you're an engaged seller.",
                color: "text-yellow-600"
              },
              {
                icon: <TrendingUp />,
                title: "Win the Buy Box faster",
                detail: "Immediate notifications mean you can reprice the moment a competitor drops their price not the next time you log into your dashboard.",
                color: "text-emerald-600"
              },
              {
                icon: <Users />,
                title: "Keep your team informed",
                detail: "Add multiple WhatsApp numbers. Your VA gets stockouts, your manager gets price alerts, and you get the daily digest.",
                color: "text-purple-600"
              },
              {
                icon: <RefreshCw />,
                title: "Stay updated 24/7",
                detail: "AI watches your store while you sleep. Competitors don't stop repricing at 10pm and your WhatsApp notifications don't either.",
                color: "text-orange-600"
              },
            ].map((outcome, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 hover:border-green-400 hover:shadow-lg transition-all group shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center ${outcome.color} shadow-sm group-hover:scale-110 transition-transform`}>{outcome.icon}</div>
                  <ThumbsUp className="w-6 h-6 text-green-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-relaxed">{outcome.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12 sm:mb-16 leading-relaxed">
            WhatsApp Alerts – <span className="text-green-600">FAQs</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-green-400 transition-all shadow-sm">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors gap-4"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.question}</span>
                  {openFaq === i
                    ? <ChevronDown className="w-5 h-5 text-green-600 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 bg-green-50/30 dark:bg-green-900/10 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Missing Critical Alerts.
            <br />
            <span className="text-green-100">Know Exactly What Happens.</span>
          </h2>
          <p className="text-white/90 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Get instant WhatsApp alerts for Amazon India and Flipkart stores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white hover:bg-gray-100 text-green-700 font-black px-12 py-5 rounded-full shadow-2xl text-lg transition-all hover:scale-105 inline-flex items-center justify-center group">
              Start Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/" className="bg-green-700 hover:bg-green-800 text-white font-bold px-12 py-5 rounded-full border-2 border-green-400 shadow-xl text-lg transition-all inline-flex items-center justify-center">
              Explore All Features →
            </Link>
          </div>
          <p className="text-white/80 mt-8 text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ 60-second setup &nbsp;·&nbsp; ✓ Native support</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-green-300 dark:border-green-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Link href="/signup" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-full shadow-xl text-base transition-all">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
