"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, ArrowRight,
  CheckCircle2, Globe, Bell, Zap,
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  Star, BarChart2, LogIn, Lock, Flame, Mail, LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Free Amazon Product Analyzer",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Ecommerce Analytics Tool",
    "operatingSystem": "Web",
    "url": "https://insydz.com/free-tools/free-amazon-product-analyzer",
    "description": "Analyze product demand, competition, reviews, and pricing trends before you invest — built specifically for Amazon India Sellers who don't want to guess.",
    "inLanguage": "en-IN",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
    "publisher": { "@type": "Organization", "name": "Insydz", "url": "https://insydz.com" }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is the Amazon product analyzer free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's Amazon product analyzer is completely free with no credit card required. You can analyze Amazon India products instantly after creating a free account." } },
      { "@type": "Question", "name": "Does it work for Amazon India only?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the analyzer is optimized specifically for Amazon India (amazon.in), providing accurate demand, pricing, and competition insights for the Indian marketplace." } },
      { "@type": "Question", "name": "How accurate is the demand estimate?", "acceptedAnswer": { "@type": "Answer", "text": "Demand signals are derived from real Amazon India marketplace data including search trends, sales velocity signals, and review recency patterns." } },
      { "@type": "Question", "name": "Is login required?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, a free account is required to use the tool. It allows saving analysis history and accessing additional features." } },
      { "@type": "Question", "name": "What is the difference between the free tool and the full platform?", "acceptedAnswer": { "@type": "Answer", "text": "The free tool provides demand level, pricing range, and opportunity insights. Paid plans add competitor tracking, keyword monitoring, alerts, forecasting, and margin calculations." } }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Analyse an Amazon India Product for Free",
    "description": "Use the Insydz product analyzer to evaluate any Amazon India product opportunity in 3 simple steps.",
    "totalTime": "PT2M",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Enter the Product ASIN", "text": "Paste any Amazon India product URL or ASIN into the analyzer." },
      { "@type": "HowToStep", "position": 2, "name": "Analyze Market Data", "text": "The tool evaluates demand, competition, pricing, and reviews." },
      { "@type": "HowToStep", "position": 3, "name": "Get Insights", "text": "Receive demand trends, pricing benchmarks, and improvement opportunities instantly." }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Amazon Product Analyzer", "item": "https://insydz.com/free-tools/free-amazon-product-analyzer" }
    ]
  }
];

export default function FreeAmazonProductAnalyzerPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [asinInput, setAsinInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-amazon-analyzer-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-amazon-analyzer-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  const handleAnalyze = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    { id: 'faq-1', question: 'Is this Amazon product analyzer free?', answer: 'Yes, completely free. No credit card, no login required. Just enter an ASIN or product URL and get instant analysis.' },
    { id: 'faq-2', question: 'Does it work for Amazon India only?', answer: 'Currently, this tool is optimized for Amazon India (amazon.in). It understands INR pricing, India-specific demand signals, and competition dynamics in the Indian marketplace.' },
    { id: 'faq-3', question: 'How accurate is the demand estimate?', answer: 'The demand estimate is based on structured marketplace signals including review velocity, BSR trends, and category benchmarks. It is an indicator not a guarantee and is useful for directional decision-making.' },
    { id: 'faq-4', question: 'Can I analyze multiple products?', answer: 'Yes, you can analyze as many products as you want. Simply enter a new ASIN or URL each time. For bulk analysis and continuous tracking, consider upgrading to the full Insydz platform.' },
    { id: 'faq-5', question: 'Is login required?', answer: 'No. The free tool works without any account or login. If you want to save reports, track over time, or get deeper insights, you can sign up for free.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Free Tool · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Product Analyzer
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">for Indian Sellers</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Analyze product demand, competition, reviews, and pricing trends before you invest — built specifically for Amazon India sellers who don't want to guess.
          </p>

          {/* ── LOGIN GATE (shown when not logged in) ── */}
          {!isLoggedIn ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-2xl flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">Create a free Insydz account or log in to start analyzing Amazon products instantly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                   <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            /* ── TOOL INPUT (shown when logged in) ── */
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-orange-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={asinInput}
                  onChange={(e) => setAsinInput(e.target.value)}
                  placeholder="Enter Amazon product URL or ASIN (e.g. B09XYZ123)"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 transition-colors text-sm"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                >
                  {analyzing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
                  ) : (
                    <><BarChart3 className="w-4 h-4" /> Analyze Product</>
                  )}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in — ready to analyze.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL DOES ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-4">What This Free Product Analyzer Shows You</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">Four critical data points every seller needs before investing in a product.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <TrendingUp className="w-6 h-6" />, title: "Estimated Demand Signals", desc: "Understand if a product has real buyer demand or low traction." },
              { icon: <IndianRupee className="w-6 h-6" />, title: "Competitor Pricing Range", desc: "See the ₹ price band across top sellers in the category." },
              { icon: <Star className="w-6 h-6" />, title: "Review Sentiment Summary", desc: "Spot common complaints and what buyers actually praise." },
              { icon: <Target className="w-6 h-6" />, title: "Opportunity Insights", desc: "Understand where gaps exist and if this product is worth entering." },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all group">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY ANALYSIS MATTERS ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-6">Why Amazon Product Analysis Is Critical</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">Most sellers lose money because they launch without validating demand, ignore competitor strength, misjudge pricing, and miss review insights. This tool helps reduce guesswork before investing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Launch without validating demand",
              "Ignore competitor strength",
              "Misjudge pricing strategy",
              "Miss review-driven insights",
            ].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOSS FRAMING ─── */}
      <section className="py-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Skip Product Analysis?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                "Overstock unsellable inventory",
                "Enter saturated categories",
                "Undercut pricing without profit",
                "Ignore review-driven product gaps",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">Most sellers only realize mistakes after spending money.</p>
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN or Product Link", desc: "Paste any Amazon India product URL or ASIN code." },
              { step: "02", icon: <BarChart3 className="w-7 h-7" />, title: "Insydz Analyzes", desc: "We process demand, competition, reviews, and pricing signals." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Insights", desc: "Receive a clear snapshot to make an informed decision." },
            ].map((s, i) => (
              <div key={i} className="relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all">
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">{s.step}</div>
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500 mb-5 mt-2">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-300 dark:text-orange-700 z-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── SAMPLE OUTPUT / EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-3">Example Product Analysis Report</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">Here's what a typical analysis looks like so you know exactly what to expect.</p>

          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">Product Analysis Report</p>
                <p className="text-white font-bold text-lg mt-0.5">Stainless Steel Water Bottle · B09EXAMPLE</p>
              </div>
              <div className="text-right">
                <span className="bg-background opacity-100 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">Amazon India</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700 p-0">
              {[
                { label: "Demand Level", value: "Medium", sub: "Moderate buyer interest", icon: <TrendingUp className="w-5 h-5" />, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", indicator: "▲" },
                { label: "Competition", value: "High", sub: "Many established sellers", icon: <Users className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", indicator: "▼" },
                { label: "Avg. Price Band", value: "₹799–₹1,099", sub: "INR price range", icon: <IndianRupee className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", indicator: "" },
                { label: "Review Insight", value: "Poor packaging", sub: "Top complaint from buyers", icon: <MessageCircle className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", indicator: "" },
              ].map((metric, i) => (
                <div key={i} className="p-6 flex flex-col gap-2">
                  <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{metric.label}</p>
                  <p className={`text-xl font-black ${metric.color}`}>{metric.value} <span className="text-base">{metric.indicator}</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{metric.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISUAL DEMAND GRAPH ─── */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-3">Visual Demand & Competition Snapshot</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-sm leading-relaxed">This visual summary helps sellers understand opportunity in seconds.</p>

          <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Demand Trend */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Demand Trend</p>
                <div className="flex items-end gap-1.5 h-20">
                  {[30, 45, 40, 55, 60, 70, 78, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-400 dark:bg-green-600 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">↑ Rising demand</p>
              </div>

              {/* Competition Bar */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-red-500" /> Competition Level</p>
                <div className="space-y-3">
                  {[{ label: "Low", w: "25%", color: "bg-green-400" }, { label: "Medium", w: "55%", color: "bg-yellow-400" }, { label: "High", w: "85%", color: "bg-red-400" }].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>{bar.label}</span></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: bar.w }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-500 mt-3 font-semibold">High competition detected</p>
              </div>

              {/* Price Band */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-orange-500" /> Price Band (₹)</p>
                <div className="relative">
                  <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="absolute left-[20%] right-[15%] top-0 bottom-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2">
                    <span>₹399</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">₹799 – ₹1,199</span>
                    <span>₹2,499</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-3 font-semibold">Opportunity in ₹799–₹1,199 range</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGIN CAPTURE (after report) ─── */}
      <section className="py-14 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 shadow-sm text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Unlock the Full Product Intelligence Report</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">Sign in to receive extended competitor analysis, opportunity score breakdown, and pricing strategy insight.</p>
          {isLoggedIn ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> You're logged in full report access enabled.
            </div>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/login" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-sm hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold rounded-xl text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by Real Marketplace Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8 mb-6">
            {[
              "Analyzes thousands of product listings",
              "Processes large volumes of review signals",
              "Tracks competitor pricing behavior",
              "Built for Amazon India marketplace dynamics",
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2 leading-relaxed">This is not scraped guesswork it's structured marketplace intelligence.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 leading-relaxed">Used by sellers evaluating products across Amazon India categories.</p>
        </div>
      </section>

      {/* ─── WHO SHOULD USE ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">Who Should Use This Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white text-xl mb-5 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Best For</h3>
              <div className="space-y-3">
                {["New sellers validating product ideas", "Growing sellers expanding into new categories", "D2C brands testing Amazon as a channel", "Agencies evaluating market opportunities"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full shrink-0"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-8">
              <h3 className="font-black text-gray-900 dark:text-white text-xl mb-5 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-gray-400" /> Not Ideal For</h3>
              <div className="space-y-3">
                {["Sellers who only do offline retail", "Businesses not selling on Amazon India"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full shrink-0"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── WHY DIFFERENT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Built for Indian Marketplace Reality</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto text-sm leading-relaxed">Most tools are built for US sellers. This one is built for you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Globe className="w-6 h-6" />, text: "Amazon India data focus" },
              { icon: <IndianRupee className="w-6 h-6" />, text: "₹ pricing logic & benchmarks" },
              { icon: <Target className="w-6 h-6" />, text: "Competitor-level insights" },
              { icon: <Shield className="w-6 h-6" />, text: "Connected to full Insydz platform" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── UPGRADE PATH ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-100 dark:border-orange-900/40 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Want Deeper Insights?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">This free analyzer gives you a quick snapshot. Upgrade to track competitors, pricing, keywords, and reviews daily.</p>
           <a href="/signup" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-10 py-6 rounded-full shadow-2xl inline-flex items-center">
            Start Free Full Access <ArrowRight className="ml-2" />
          </a>
        </div>
      </section>

      {/* ─── SEPARATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-200 dark:hover:border-orange-700 transition-colors">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-orange-500" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO PARAGRAPH ─── */}
      <section className="py-8 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center leading-relaxed">
            This free Amazon product analyzer helps Indian sellers evaluate product demand, competition, pricing, and review sentiment before launching. Ideal for Amazon FBA sellers, private label brands, and D2C businesses looking to make data-driven decisions on the Amazon India marketplace.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-orange-500 to-amber-500 mb-20 lg:mb-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4 text-white">Stop Guessing. Validate Before You Invest ₹.</h2>
          <p className="text-orange-100 text-lg mb-10 leading-relaxed">One small analysis today can save months of loss.</p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-white text-orange-600 font-black px-12 py-5 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg inline-flex items-center gap-3"
          >
            Analyze Product Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-orange-200 dark:border-orange-800 px-4 py-3 shadow-2xl">
        <button
          onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {isLoggedIn ? <><BarChart3 className="w-4 h-4" /> Analyze Product Now Free</> : <><LogIn className="w-4 h-4" /> Log In to Analyze Free</>}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
