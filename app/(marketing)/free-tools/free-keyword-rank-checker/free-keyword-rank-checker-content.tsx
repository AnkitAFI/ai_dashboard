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
  LogIn, Lock, Hash, BarChart2, ArrowUp, ArrowDown, Flame, Mail, LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const schemaSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Insydz Free Amazon Keyword Rank Checker India",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/free-tools/free-keyword-rank-checker",
  "description": "Instantly check where your product ranks for any keyword on Amazon India — so you can optimize your listing, close visibility gaps, and outrank competitors on the search results page. Free forever.",
  "featureList": [
    "Current keyword rank position on Amazon India",
    "Page position — Page 1, Page 2, or Page 3+",
    "Rank movement week-over-week — improving, stable, or declining",
    "Search visibility score (0-100)",
    "Hindi + English keyword support"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free forever — no credit card required"
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this Amazon keyword rank checker free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz's Amazon keyword rank checker is completely free — no credit card required. Create a free account in 60 seconds and start checking keyword rankings on Amazon India immediately. The free tool shows current rank position, page position, rank movement week-over-week, and search visibility score — in Hindi and English. Paid plans (₹1,999/month) unlock daily rank tracking across all keywords, WhatsApp alerts when a keyword drops a page, 90-day historical rank curves, multi-keyword dashboard (20-50 keywords per product), keyword opportunity scoring, and competitor keyword gap analysis."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work for Amazon India only?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The free Amazon keyword rank checker is calibrated specifically for Amazon India (amazon.in) — it scans Amazon India's live organic search results, not Amazon.com data. This matters significantly: keyword rankings on Amazon India differ from Amazon.com because the search index, buyer behaviour, and A9 algorithm weights vary. A tool calibrated for Amazon.com gives you the wrong ranking data for your Amazon India listings. Insydz reads Amazon India's live search results directly — including Hindi and English keyword searches."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the rank data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The free Amazon keyword rank checker scans Amazon India's live organic search results at the time of your check — it reads where your product actually appears in the search results page. This is direct search result data, not estimated or modelled rank data. Position #14 means your product appears at result 14 on Amazon India for that keyword right now. Rank movement reflects change since the previous check."
      }
    },
    {
      "@type": "Question",
      "name": "Can I check keyword rankings for competitor products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The free keyword rank checker works on any Amazon India product ASIN — including competitor products. Enter a competitor's ASIN and check what keywords they rank for and at what position."
      }
    },
    {
      "@type": "Question",
      "name": "Is login required?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, a free Insydz account is required — just an email address, no credit card. Login saves your rank check history and unlocks additional features."
      }
    }
  ]
};

const schemaHowTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Check Amazon India Keyword Rankings for Free",
  "description": "Check where your Amazon India product ranks for any keyword in 3 steps.",
  "totalTime": "PT2M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Enter ASIN + Keyword",
      "text": "Provide the product ASIN and the keyword in English or Hindi."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Insydz Scans Search Results",
      "text": "We scan Amazon India's live organic search results to find exactly where your product appears."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Get Instant Rank Position",
      "text": "See current rank, page position, visibility score, and rank movement instantly."
    }
  ]
};


const schemaBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://insydz.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Free Tools",
      "item": "https://insydz.com/free-tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Free Amazon Keyword Rank Checker",
      "item": "https://insydz.com/free-tools/free-keyword-rank-checker"
    }
  ]
};

const SCHEMAS = [
  schemaSoftware,
  schemaFAQ,
  schemaHowTo,
  schemaBreadcrumb
];

export default function FreeKeywordRankCheckerPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [asinInput, setAsinInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-krc-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-krc-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  const handleCheck = () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!asinInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is this keyword rank checker free?',
      answer: "Yes. Insydz's Amazon keyword rank checker is completely free no credit card required, no trial period, no expiry. Create a free account (60 seconds) and start checking keyword rankings on Amazon India immediately. The free tool shows current rank position, rank movement week-over-week, search visibility score, and keyword opportunity signals. Paid plans (₹1,999/month) unlock daily tracking, WhatsApp alerts when a keyword drops, 90-day historical rank curves, and competitor keyword gap analysis.",
    },
    {
      id: 'faq-2',
      question: 'Does it work for Amazon India only?',
      answer: "The free Amazon keyword rank checker is calibrated specifically for Amazon India (amazon.in) it scans Amazon India's live organic search results, not Amazon.com data. This matters significantly: keyword rankings on Amazon India differ from Amazon.com because the search index, buyer behaviour, and A9 algorithm weights vary. A tool calibrated for Amazon.com gives you the wrong ranking data for your Amazon India listings. Insydz reads Amazon India's live search results directly including Hindi and English keyword searches.",
    },
    {
      id: 'faq-3',
      question: 'How accurate is the rank data?',
      answer: "The free Amazon keyword rank checker scans Amazon India's live organic search results at the time of your check it reads where your product actually appears in the results page. This is direct search result data, not estimated or modelled data. Position #14 means your product appears at result 14 on Amazon India for that keyword right now. Rank changes (e.g. ↑+6 from #20 to #14) reflect movement since the last check date.",
    },
    {
      id: 'faq-4',
      question: 'Can I check rankings for competitor products?',
      answer: "Yes. The free keyword rank checker works on any Amazon India product ASIN including competitor products. Enter a competitor's ASIN and check what keywords they rank for and at what position. If a competitor ranks #3 for a 40,000/month search term, you know that keyword is worth targeting. If they rank #47 for a term buyers frequently use, you have a clear gap to build a listing around and potentially outrank them.",
    },
    {
      id: 'faq-5',
      question: 'Is login required?',
      answer: "Yes, a free Insydz account is required just an email address, no credit card. Login saves your rank check history so you can compare rankings across sessions and track keyword movement over time. Your free account also unlocks basic versions of all Insydz features product analysis, competitor price checking, and review sentiment analysis not just the keyword rank checker.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-violet-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Free Tool · NEW · Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-5">
            Free Amazon Keyword
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Rank Checker for India</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instantly check where your product ranks for any keyword on Amazon India so you can optimize your listing, close visibility gaps, and outrank competitors on the search results page.
          </p>

          {/* LOGIN GATE */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-gray-700 p-10 flex flex-col items-center gap-6">
                <div className="text-5xl">🔒</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to use this tool</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                    Create a free Insydz account or log in to start checking keyword rankings on Amazon India instantly. Free forever no credit card required.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <a href="/login" className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </a>
                  <a href="/signup" className="flex-1 px-6 py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2">
                    Sign Up Free
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Free forever · No credit card required</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={asinInput} onChange={(e) => setAsinInput(e.target.value)} placeholder="Enter ASIN (e.g. B09XYZ123)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm" />
                  <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="Enter keyword (e.g. steel water bottle)" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <button onClick={handleCheck} disabled={analyzing} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Checking Rank...</> : <><Search className="w-4 h-4" /> Check Keyword Rank</>}
                </button>
              </div>
              <p className="text-xs text-green-500 dark:text-green-400 mt-3 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Logged in ready to check keyword rankings.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── WHAT THIS TOOL SHOWS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Tool Overview</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What This Free Rank Checker <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Shows You</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Four keyword intelligence signals that reveal your Amazon India search visibility so you know exactly which listings to fix, which keywords to add, and which ranking wins to protect.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Hash className="w-6 h-6" />, title: "Current Keyword Rank", desc: "See exactly where your product appears in Amazon India search results for a keyword. Position #3 is very different from position #43 and this tool shows you exactly which one you're at.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "hover:border-indigo-300" },
              { icon: <Search className="w-6 h-6" />, title: "Search Visibility Score", desc: "Understand how visible your product is for the keywords that matter most. A visibility score across your tracked keywords shows whether you're gaining or losing organic ground overall.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", border: "hover:border-violet-300" },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Rank Movement", desc: "See if your ranking is improving, declining, or stable compared to last week. A keyword that slipped from #8 to #24 needs immediate attention. One that moved from #31 to #14 deserves to be protected.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "hover:border-blue-300" },
              { icon: <Target className="w-6 h-6" />, title: "Keyword Opportunity", desc: "Discover high-traffic keywords where small rank improvements drive big results. Moving from page 2 to page 1 can multiply organic traffic by 8–10x on the same keyword.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "hover:border-purple-300" },
            ].map((card, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg ${card.border} transition-all group relative overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
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
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Why It Matters</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Why Keyword Rank Tracking Is <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Critical</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Over 70% of Amazon shoppers never go past the first page of search results. If your product isn't ranking for the right keywords, it simply doesn't exist to most buyers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Products buried on page 3+ get near-zero organic traffic", "Listing optimizations without rank data are guesswork", "Competitors climb rankings while yours drops silently", "Missing high-volume keywords means invisible products"].map((reason, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
              </div>
            ))}
          </div>

          {/* Skip box */}
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-100 dark:border-red-900/40 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 text-center">What Happens When You Don't Track Keyword Rankings?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {["You lose organic visibility without knowing why sales dropped", "Listing changes have no measurable impact because you can't see what moved", "Competitors close the rank gap while you're unaware", "Ad spend rises as organic performance falls and you compensate with PPC"].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic border-t border-red-200 dark:border-red-800/50 pt-4">Sellers who track keyword rank can fix problems before they become expensive.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">How It <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Two inputs. Instant result. Provide the product ASIN and the keyword and see exactly where your listing appears in Amazon India's organic search results right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 z-0"></div>
            {[
              { step: "01", icon: <Search className="w-7 h-7" />, title: "Enter ASIN + Keyword", desc: "Provide the product ASIN and the keyword you want to check rank for on Amazon India. Works on any ASIN yours or a competitor's product." },
              { step: "02", icon: <Hash className="w-7 h-7" />, title: "Insydz Scans Search Results", desc: "We scan Amazon India's live organic search results to find exactly where your product appears for that keyword not estimated data, actual search position." },
              { step: "03", icon: <Zap className="w-7 h-7" />, title: "Get Instant Rank Position", desc: "See the current rank, page position, and visibility score instantly. Plus rank movement compared to last week so you know if you're climbing or slipping." },
            ].map((s, i) => (
              <div key={i} className="relative z-10 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-black text-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">{s.step}</div>
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
             <a href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Check Your Keyword Rank Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── EXAMPLE REPORT ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Example Output</div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Example Keyword Rank <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Report</span></h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Here's what a real keyword rank snapshot looks like for an Amazon India product so you know exactly what you'll receive before signing in.</p>
          </div>

          {/* Report card */}
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Keyword Rank Report</p>
                <p className="text-white font-bold text-lg">Steel Water Bottle · B09EXAMPLE</p>
              </div>
              <span className="bg-background opacity-100 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">Amazon India</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
              {[
                { label: "Keyword", value: "steel water bottle", sub: "Search term checked", color: "text-indigo-500" },
                { label: "Current Rank", value: "#14", sub: "Page 1 position 14", color: "text-gray-900 dark:text-white" },
                { label: "Rank Change", value: "↑ +6", sub: "Improved from #20 last week", color: "text-green-500" },
                { label: "Visibility Score", value: "72 / 100", sub: "Above-average visibility", color: "text-orange-500" },
              ].map((m, i) => (
                <div key={i} className="p-5 sm:p-6">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-xl font-black ${m.color} leading-tight`}>{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual snapshot */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">Visual Keyword Rank <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Snapshot</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">See rank position, movement, and opportunity across multiple keywords at once so you can prioritise which keywords to work on first.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-9 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rank trend */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Rank Trend (30 Days)</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[52, 48, 44, 46, 42, 40, 38, 36, 34, 30].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}px`, background: i === 9 ? '#6366F1' : '#A5B4FC', opacity: 0.85 }}></div>
                    ))}
                  </div>
                  <p className="text-xs text-green-500 mt-2 font-semibold">↑ Climbing — rank improving steadily</p>
                  <p className="text-xs text-gray-400 mt-0.5">(Lower bar = better rank position)</p>
                </div>

                {/* Keyword rankings table */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><Hash className="w-4 h-4 text-violet-500" /> Top Keyword Rankings</p>
                  <div className="space-y-2.5">
                    {[
                      { kw: "steel water bottle", rank: "#14", change: "↑ +6", up: true },
                      { kw: "insulated bottle", rank: "#31", change: "↓ -3", up: false },
                      { kw: "water bottle 1 litre", rank: "#8", change: "↑ +12", up: true },
                      { kw: "gym water bottle", rank: "#22", change: "→ +1", up: null },
                    ].map((item) => (
                      <div key={item.kw} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[120px]">{item.kw}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.rank}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.up === true ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : item.up === false ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visibility bars */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500" /> Search Visibility</p>
                  <div className="space-y-3">
                    {[
                      { label: "Page 1 Keywords", pct: 35, opacity: 1 },
                      { label: "Page 2 Keywords", pct: 42, opacity: 0.6 },
                      { label: "Page 3+ Keywords", pct: 23, opacity: 0.35 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{item.label}</span><span>{item.pct}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${item.pct}%`, opacity: item.opacity }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-500 mt-3 font-semibold">35% of tracked keywords on Page 1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell */}
          <div className="mt-14 bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Unlock the Full Keyword Intelligence Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Sign in to access multi-keyword rank tracking, historical trend data, and keyword opportunity scoring plus daily rank monitoring and WhatsApp alerts when a keyword drops a page.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/login" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                <LogIn className="w-4 h-4" /> Log In to Access
              </a>
              <a href="/signup" className="px-6 py-3 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── PRIYA SCENARIO ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Real Seller Story</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">What Most Keyword Tools <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Don't Tell You</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Most tools show a number. This tool shows the visibility gap. Closing that gap often means the difference between a failing product and a bestseller.</p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 text-white" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <h3 className="font-black text-xl sm:text-2xl mb-1 text-indigo-200">Priya's Home Decor Rank Rescue — 14 Days to Page 1</h3>
          <p className="text-xs mb-8 text-indigo-300/60 uppercase tracking-widest">Home Decor Seller, Bangalore | Amazon India | Macrame Wall Hanging | Organic Sales: 2/day → 18/day</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "The Problem", text: "Priya's sales had plateaued at 2 units/day despite having 4.5-star reviews. She assumed it was a 'demand issue'. A single check on the free Amazon keyword rank checker revealed her main keyword 'macrame wall hanging' was ranking on Page 4 (#87)." },
              { label: "The Strategy", text: "Using the rank checker, she identified 3 long-tail keywords where she was ranking on Page 2 (#22-#28). She optimized her listing title and backend keywords specifically for these 3 terms to 'climb' the easiest ranks first." },
              { label: "The Result", text: "Within 6 days, those 3 terms moved to Page 1 (#9, #12, #14). This drove enough initial organic sales to push her main keyword from Page 4 to Page 2, and eventually Page 1 (#16) within 14 days." },
              { label: "The Outcome", text: "Organic sales increased from 2/day to 18/day. Ad spend (PPC) was reduced by 40% because her organic visibility was finally doing the work. Total revenue grew 9x." },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-indigo-400">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="text-sm leading-relaxed text-indigo-100/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── DATA CREDIBILITY ─── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full mb-4">Data Quality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Powered by Live <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Search Results</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">We scan Amazon India's live organic search results in real-time. This is direct marketplace data, not estimated or stored data from last month.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            {["Scans live Amazon India search results", "Tracks organic ranking position accurately", "Calibrated for India-specific A9 algorithm", "Supports English and Hindi keyword searches"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl px-5 py-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 text-left leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Want Deeper Insights?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 text-sm leading-relaxed">This free checker gives you a quick snapshot. Upgrade to track multi-keyword ranking daily, get WhatsApp alerts for rank drops, and see your 90-day rank history.</p>
             <a href="/signup" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-10 py-3 rounded-full shadow-xl inline-flex items-center">
              Start Free Full Access <ArrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-8" />

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Frequently Asked <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Questions</span></h2>
            <p className="text-gray-500 dark:text-gray-400">Everything you need to know about checking Amazon India keyword rankings for free.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
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
      <section className="py-10 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">The free Amazon India keyword rank checker by Insydz is built to help Indian marketplace sellers monitor organic search visibility, track rank movement, and optimize listings for maximum visibility on amazon.in. Ideal for Amazon FBA sellers, private label brands, and D2C businesses competing in high-volume Indian categories like Electronics, Home, and Fashion. Hindi and English keyword support included.</p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-center mb-20 lg:mb-0">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Stop Guessing. Start Ranking on Page 1.</h2>
          <p className="text-indigo-100 text-lg mb-10">Check any Amazon India keyword rank for free and close your visibility gaps today.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-indigo-600 font-black px-10 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 inline-flex items-center gap-3 text-lg">
            Check Keyword Rank Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-gray-900 border-t-2 border-indigo-100 dark:border-indigo-800 px-4 py-3 shadow-2xl">
        <button
          onClick={() => { if (!isLoggedIn) { router.push('/login'); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {isLoggedIn ? <><Search className="w-4 h-4" /> Check Keyword Rank Free</> : <><LogIn className="w-4 h-4" /> Log In to Check Free</>}
        </button>
      </div>
    </div>
  );
}
