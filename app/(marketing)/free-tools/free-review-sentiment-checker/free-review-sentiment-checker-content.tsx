"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle,
  BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  Star, ThumbsUp, ThumbsDown,
  Smile, Frown, Meh, BarChart2, LogIn, Lock, Flame, Mail, LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function FreeReviewSentimentCheckerPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [asinInput, setAsinInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAnalyze = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is this review sentiment checker free?',
      answer: "Yes. Insydz's Amazon review sentiment checker is completely free no credit card required, no trial period, no expiry. Create a free account (60 seconds) and start analyzing immediately. The free tool provides an overall sentiment score, top complaint themes, top praise themes, and improvement opportunities for any Amazon India ASIN. Paid plans unlock daily monitoring, competitor comparison, and WhatsApp alerts when sentiment shifts negative.",
    },
    {
      id: 'faq-2',
      question: 'Does it work for Amazon India only?',
      answer: "The free review sentiment checker is calibrated specifically for Amazon India (amazon.in). It processes reviews written by Indian buyers including Hindi, Hinglish, and regional language patterns not just English reviews. Since 60–70% of Amazon India reviews are in Hindi, a tool that only reads English misses most of the buyer signal. The paid Insydz platform also covers Flipkart review sentiment analysis.",
    },
    {
      id: 'faq-3',
      question: 'How is sentiment calculated?',
      answer: "Insydz uses AI to scan hundreds of buyer reviews and classify them by sentiment (positive, neutral, negative), theme (packaging, battery, build quality, delivery), and emotional tone. The sentiment score (0–100) represents weighted buyer sentiment across all reviews not just star ratings. A product can have 70% 4-star reviews but score 45/100 if those reviews contain consistent specific complaints. Star ratings don't tell you why buyers are unhappy. Sentiment analysis does.",
    },
    {
      id: 'faq-4',
      question: "Can I check a competitor's product reviews?",
      answer: "Yes. The free Amazon review sentiment checker works on any Amazon India product ASIN including competitor products. This is one of the most valuable use cases: paste a competitor's ASIN, see their top complaints, and understand exactly what their buyers are frustrated with. That's your product brief. Build something that fixes those issues and you enter the market with a clear, data-backed advantage over an established seller.",
    },
    {
      id: 'faq-5',
      question: 'Is login required?',
      answer: "Yes, a free Insydz account is required just an email address, no credit card. Login saves your analysis history so you can compare sentiment across products and track changes over time. Your free account also unlocks basic versions of all Insydz features: product analysis, keyword monitoring, and price tracking not just the sentiment checker.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-purple-200 dark:bg-purple-900/30 dark:border-purple-700 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">Free Tool · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Review
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Sentiment Checker</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly understand what buyers love, hate, and complain about for any Amazon India product. Improve your listing, fix product gaps, and outperform competitors before they fix theirs.
          </p>

          {/* LOGIN GATE */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-purple-100 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="text-5xl">🔒</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Create a free Insydz account or log in to start checking review sentiment instantly. Reads Hindi and English reviews free forever.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-purple-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter Amazon product URL or ASIN (e.g. B09XYZ123)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors text-sm" />
                <button onClick={handleAnalyze} disabled={analyzing} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2">
                  {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</> : <><MessageCircle className="w-4 h-4" /> Check Sentiment</>}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in — ready to check sentiment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL SHOWS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Tool Overview</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What This Free Sentiment Checker <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Shows You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Four layers of buyer review intelligence every Amazon India seller needs before launching a product and after, to protect a listing that's already live.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Smile className="w-6 h-6" />, title: "Overall Sentiment Score", desc: "Positive, neutral, or negative see the overall buyer mood at a glance. Scored 0–100 so you can benchmark against competitors and track change over time.", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "hover:border-green-300" },
              { icon: <ThumbsDown className="w-6 h-6" />, title: "Top Complaints", desc: "The most frequently raised issues across all recent buyer reviews grouped by theme (packaging, battery, fit, delivery) so you know exactly what to fix first.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "hover:border-red-300" },
              { icon: <ThumbsUp className="w-6 h-6" />, title: "What Buyers Praise", desc: "Understand what features and qualities buyers consistently love so you can amplify these strengths in your listing copy, images, and A+ content.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "hover:border-blue-300" },
              { icon: <Target className="w-6 h-6" />, title: "Improvement Opportunities", desc: "Review gaps that reveal where a better product could win the market. Specific, addressable issues not vague feedback that you can act on before your next inventory order.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "hover:border-purple-300" },
            ].map((card, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg ${card.border} transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color} mb-4`}>{card.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY CRITICAL ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Why It Matters</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Why Review Sentiment Analysis Is <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Critical</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Reviews are the most honest signal in e-commerce. Most sellers ignore them or read them too slowly to act. This tool surfaces what matters, instantly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Miss recurring complaints that damage conversions", "Launch products with known flaws buyers hate", "Ignore positive signals that should be in listings", "Lose to competitors who fixed the same issues"].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>

          {/* Skip box */}
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Ignore Review Sentiment?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {["Negative reviews accumulate and tank your search rankings", "Repeat product defects go unfixed for months", "Competitor products improve while yours stagnates", "Buyers abandon your listing for alternatives that solved what you didn't"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic border-t border-red-200 dark:border-red-800/50 pt-4 leading-relaxed">Most sellers only act on reviews after the damage is done.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">How It <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Three steps. Under two minutes. Paste any Amazon India product URL or ASIN yours or a competitor's and get a full sentiment breakdown instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 z-0"></div>
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN or Product Link", desc: "Paste any Amazon India product URL or ASIN. The AI review sentiment analyzer works on any publicly listed product yours or a competitor's." },
              { step: "02", icon: <MessageCircle className="w-7 h-7" />, title: "Insydz Processes Reviews", desc: "AI scans hundreds of buyer reviews in Hindi and English to extract sentiment, recurring themes, specific complaints and praise patterns." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Sentiment Insights", desc: "Receive a clear breakdown of sentiment score, top complaints, top praise, and improvement opportunities in seconds." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">{s.step}</div>
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500 mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
               <a href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Check Sentiment Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4">Example Output</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Example Sentiment Analysis <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Report</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Here's what a real Amazon India sentiment report looks like so you know exactly what you're getting before you sign in.</p>
          </div>

          {/* Report card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1 leading-relaxed">Review Sentiment Report</p>
                <p className="text-white font-bold text-lg leading-relaxed">Noise Cancelling Earbuds · B09EXAMPLE</p>
              </div>
              <span className="bg-background opacity-100 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full leading-relaxed">Amazon India</span>
            </div>
            {/* Score bar */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">Overall Sentiment Score</p>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-relaxed">68 / 100</span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ width: '68%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 leading-relaxed">
                <span>Negative</span>
                <span className="text-purple-500 font-semibold">Mostly Positive</span>
                <span>Excellent</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
              {[
                { label: "Sentiment", value: "Mostly Positive", sub: "68% positive reviews", icon: <Smile className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                { label: "Top Complaint", value: "Battery life", sub: "Mentioned in 34% of 1–3★ reviews", icon: <Frown className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                { label: "Top Praise", value: "Sound quality", sub: "Praised in 58% of 4–5★ reviews", icon: <ThumbsUp className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Opportunity", value: "Better case", sub: "Packaging gap identified", icon: <Target className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
              ].map((m, i) => (
                <div key={i} className="p-5 sm:p-6">
                  <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center ${m.color} mb-2`}>{m.icon}</div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 leading-relaxed">{m.label}</p>
                  <p className={`text-lg font-black ${m.color} leading-tight leading-relaxed`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual snapshot */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">Visual Sentiment & Theme <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Snapshot</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">See rank position, movement, and opportunity across multiple keywords at once.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-9 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Star rating breakdown */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 leading-relaxed"><Star className="w-4 h-4 text-yellow-400" /> Star Rating Breakdown</p>
                  <div className="space-y-2.5">
                    {[{ stars: "5★", pct: 42, color: "bg-green-400" }, { stars: "4★", pct: 26, color: "bg-lime-400" }, { stars: "3★", pct: 12, color: "bg-yellow-400" }, { stars: "2★", pct: 9, color: "bg-orange-400" }, { stars: "1★", pct: 11, color: "bg-red-400" }].map((row) => (
                      <div key={row.stars} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-6 shrink-0 leading-relaxed">{row.stars}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right shrink-0 leading-relaxed">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top complaint themes */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 leading-relaxed"><Frown className="w-4 h-4 text-red-500" /> Top Complaint Themes</p>
                  <div className="space-y-3">
                    {[{ theme: "Battery life", pct: 34 }, { theme: "Packaging", pct: 22 }, { theme: "Connectivity", pct: 18 }, { theme: "Fit / comfort", pct: 14 }].map((item) => (
                      <div key={item.theme}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 leading-relaxed"><span>{item.theme}</span><span>{item.pct}%</span></div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top praise themes */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 leading-relaxed"><ThumbsUp className="w-4 h-4 text-blue-500" /> Top Praise Themes</p>
                  <div className="space-y-3">
                    {[{ theme: "Sound quality", pct: 58 }, { theme: "Value for money", pct: 45 }, { theme: "Build quality", pct: 37 }, { theme: "Easy setup", pct: 28 }].map((item) => (
                      <div key={item.theme}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 leading-relaxed"><span>{item.theme}</span><span>{item.pct}%</span></div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-900/50 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-relaxed">Unlock the Full Review Intelligence Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Sign in to receive detailed complaint breakdown, feature sentiment map, and improvement opportunity score and daily monitoring that alerts you when sentiment shifts negative.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <a href="/login" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 leading-relaxed">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all leading-relaxed">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── POOJA SCENARIO ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4 leading-relaxed">Real Seller Story</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What Most Review Tools <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Don't Tell You</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">Most review tools show you star ratings and word clouds. Insydz's free Amazon review sentiment checker tells you exactly what to fix and in which language Indian buyers are saying it.</p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 text-white" style={{ background: 'linear-gradient(135deg, #1C1828, #2D1B5A)' }}>
          <h3 className="font-black text-lg sm:text-xl mb-1 leading-relaxed" style={{ color: '#C4B5FD' }}>Pooja's ₹3.2L Recovery Found in Reviews She Couldn't Read</h3>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>Kitchen appliances seller, Nagpur | Amazon India | Mixer grinder ₹1,899 | Rating fell 4.5★ → 3.8★ over 4 months</p>

          <div className="space-y-4">
            {[
              { label: "The Problem", text: "Pooja's mixer grinder had been her top product for 14 months. Then the rating started slipping. She read the English reviews: \"motor noise acceptable,\" \"good performance\" nothing obviously wrong. She spent ₹22,000 on new product photography and A+ content. Rating continued to fall. Sales down 41%." },
              { label: "What the Sentiment Checker Found", text: "The free Amazon review sentiment checker processed 340 reviews — including 218 in Hindi. The top complaint theme: \"डिब्बा टूटा हुआ आया\" (box arrived broken) mentioned in 47% of 1★ and 2★ reviews. The second: \"ढक्कन ठीक से बंद नहीं होता\" (lid doesn't close properly) mentioned in 31%. Neither complaint appeared in the English reviews she'd been reading." },
              { label: "The Fix (₹14/unit)", text: "New packaging with internal foam insert: ₹11/unit. New lid quality check added to factory QC: ₹3/unit. Total cost: ₹14 per unit. Fix applied within 6 weeks of the next inventory order." },
              { label: "The Outcome (90 days)", text: "Rating recovered from 3.8★ to 4.4★ in 90 days. New 1★ reviews down 78%. Sales recovered to previous levels plus 18% growth from improved ranking. Total revenue recovery + growth: ₹3.2L in 90 days." },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #A78BFA' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2 leading-relaxed" style={{ color: '#C4B5FD' }}>{item.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[{ num: "4.4★", label: "Rating recovered (from 3.8★ in 90 days)" }, { num: "78%", label: "Drop in new 1-star reviews after fix" }, { num: "₹3.2L", label: "Revenue recovery in 90 days" }].map((item, i) => (
              <div key={i} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <span className="block text-2xl sm:text-3xl font-black mb-1 leading-relaxed" style={{ color: '#C4B5FD' }}>{item.num}</span>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 mt-6 text-center text-sm leading-relaxed" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'rgba(255,255,255,0.75)' }}>
            The fix cost ₹14/unit. The problem was invisible until a free review sentiment checker read her Hindi reviews. <strong style={{ color: '#C4B5FD' }}>₹22,000 spent on photography fixed nothing. ₹14/unit fixed everything.</strong> The insight was in the reviews just written in a language the seller couldn't read at scale.
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4 leading-relaxed">Data Quality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Real Review Data</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">This is not surface-level star counting it's deep review intelligence. The free review sentiment checker reads what buyers actually write, not just how many stars they clicked.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-5">
            {["Processes hundreds of buyer reviews per product", "Detects themes, emotions & recurring patterns", "Handles English and Hindi language reviews", "Built for Amazon India marketplace dynamics"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-10 leading-relaxed">Used by sellers improving products across Amazon India categories.</p>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-900/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-relaxed">Want Deeper Review Intelligence?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 text-sm leading-relaxed">This free checker gives you a quick snapshot. Upgrade to track sentiment trends daily, get WhatsApp alerts when reviews shift negative, and compare your sentiment against competitors.</p>
            <a href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-10 py-3 rounded-full shadow-xl inline-flex items-center leading-relaxed">
              Start Free Full Access <ArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHO SHOULD USE ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4 leading-relaxed">Fit Assessment</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Who Should Use <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">This Tool</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold">✓</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg leading-relaxed">Best For</h3>
              </div>
              {["Sellers with low ratings wanting to understand exactly why buyers are unhappy", "New sellers analyzing competitor review weaknesses before entering a category", "Private label brands improving product specs based on what current buyers complain about", "D2C brands entering Amazon India for the first time who want a product brief from buyer feedback", "Agencies auditing client listings to find the fastest path to improving ratings"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold">!</div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg leading-relaxed">Not Ideal For</h3>
              </div>
              {["Sellers doing only offline or non-Amazon retail", "Businesses not interested in using review feedback to improve products or listings", "Sellers whose products have fewer than 20 reviews (insufficient data for reliable sentiment patterns)"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-gray-400 mt-0.5 shrink-0">○</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BUILT FOR INDIA ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full mb-4 leading-relaxed">India-First Design</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Built for <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Indian Marketplace Reality</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">Most sentiment tools are built for Western markets and ignore how Indian buyers actually write reviews. This one doesn't.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[{  text: "Amazon India data focus" }, {  text: "Hindi + English review parsing" }, {  text: "Category-specific sentiment norms" }, {  text: "Connected to full Insydz platform" }].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-purple-50 dark:border-purple-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 hover:-translate-y-1 transition-all">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* India explainer */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-900/40 rounded-2xl p-6 sm:p-9 max-w-3xl mx-auto text-left">
            <p className="font-bold text-purple-600 dark:text-purple-400 mb-3 text-sm leading-relaxed">What most tools don't tell you:</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">60–70% of Amazon India reviews are written in Hindi. A free sentiment analysis tool that only reads English reviews is ignoring the majority of buyer feedback. Insydz is the only free Amazon review sentiment checker that processes both so no complaint theme goes undetected, regardless of which language your buyers write in.</p>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed leading-relaxed">This applies equally to Flipkart review sentiment analysis where regional language reviews are even more common. The paid Insydz platform covers Flipkart review data for sellers operating across both marketplaces.</p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-500 to-pink-500 text-center mb-20 lg:mb-0">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-relaxed">Stop Guessing. Build Bestsellers.</h2>
          <p className="text-purple-50 text-lg mb-10 leading-relaxed">Analyze any Amazon India product sentiment for free and fix your product gaps today.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-purple-600 font-black px-10 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3 text-lg leading-relaxed">
            Check Review Sentiment Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-purple-100 dark:border-purple-800 px-4 py-3 shadow-2xl">
        <button
          onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 leading-relaxed"
        >
          {isLoggedIn ? <><MessageCircle className="w-4 h-4" /> Check Review Sentiment Free</> : <><LogIn className="w-4 h-4" /> Log In to Check Free</>}
        </button>
      </div>
    </div>
  );
}
