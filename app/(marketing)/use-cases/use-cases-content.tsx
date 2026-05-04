"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, ChevronRight, Check, Zap, TrendingUp, Star, Search, 
  Package, DollarSign, BarChart3, AlertCircle, ArrowRight, CheckCircle2,
  Target, Users, Briefcase, Clock, TrendingDown, MessageCircle, X,
  Globe,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const UseCasesPage = () => {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleGetStarted = () => { router.push("/signup"); };

  const useCases = [
    {
      id: 'track-competitor-prices',
      icon: <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Track Competitor Prices',
      category: 'pricing',
      tag: 'Most Common',
      context: 'Common in price-sensitive categories on Amazon and Flipkart',
      problem: 'Know the moment a rival drops price on Amazon.in or Flipkart before your Buy Box rank slides. Get a WhatsApp alert and an AI-suggested reprice in seconds, not days.',
      steps: [
        'Connect ASINs or listings, auto-detect top competitors.',
        'Set alert thresholds, track 5%, 10% or custom price drops.',
        'Get instant alerts, see price changes & AI response price.',
        'Reprice confidently, protect margins above break-even.'
      ],
      roi: [
        { label: 'Weekly loss from late price response (before Insydz)', value: '−₹18,000', neg: true },
        { label: 'Weekly recovery after real-time alerts (with Insydz)', value: '+₹15,500', neg: false },
        { label: 'Monthly net gain', value: '+₹62,000', neg: false },
      ],
      outcomes: ['Marketplace Analytics Software', 'Buy Box tracking'],
      link: '/use-cases/track-competitor-prices',
      learnMore: { text: 'Amazon Price Tracker', href: '/features/competitor-price-tracking-feature' },
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'find-profitable-products',
      icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Find Profitable Products',
      category: 'product',
      tag: 'Popular',
      context: 'Ideal for seasonal & festive sellers launching new SKUs',
      problem: 'Surface high-demand, low-competition SKUs using real Indian marketplace data. The only ecommerce product research tool built for Amazon and Flipkart with margin intelligence',
      steps: [
        'Enter category or keyword, it scans Amazon & Flipkart demand.',
        'See demand vs competition, find high-intent low-competition gaps.',
        'Analyse review gaps, uncover complaints to improve products.',
        'Validate price points, know winning ranges before sourcing.'
      ],
      roi: [
        { label: 'Typical cost of failed product launch (dead inventory + ads)', value: '−₹2,50,000', neg: true },
        { label: 'Data-validated launch with Insydz first month GMV', value: '+₹3,40,000', neg: false },
      ],
      outcomes: ['Ecommerce Product Research Tool', 'Demand Data'],
      link: '/use-cases/find-profitable-products',
      learnMore: { text: 'Ecommerce Product Research Tool', href: '/features/product-research-feature' },
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'improve-amazon-flipkart-seo',
      icon: <Search className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Improve Amazon & Flipkart SEO',
      category: 'seo',
      context: 'Best for high-competition keywords and stagnating listings',
      problem: 'Find buyer-intent keywords your competitors rank for and close the gap. The only amazon seller analytics tool and flipkart seller analytics tool combined: daily rank tracking, keyword gap analysis, and plain-language listing fixes.',
      steps: [
        'Add ASINs or Flipkart listings, daily rank tracking starts instantly.',
        'Get keyword drop alerts, WhatsApp insights with causes.',
        'Receive AI fixes, title, bullets & keyword suggestions.',
        'Track recovery daily, see rankings improve fast.'
      ],
      roi: [
        { label: 'Monthly organic revenue lost during 6-week ranking drop', value: '−₹1,80,000', neg: true },
        { label: 'Organic revenue recovered after AI-guided listing fixes (30 days)', value: '+₹1,80,000', neg: false },
        { label: 'Ad spend saved (no longer compensating for lost organic rank)', value: '+₹42,000/month', neg: false },
      ],
      outcomes: ['Amazon Seller Analytics Tool', 'Flipkart Seller Analytics Tool'],
      link: '/use-cases/improve-seo',
      learnMore: { text: 'Flipkart & Amazon Keyword Rank Tracker', href: '/features/keyword-rank-tracking-feature' },
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analyze-customer-reviews',
      icon: <Star className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Analyse Customer Reviews',
      category: 'product',
      tag: '',
      context: 'Critical for listings with 100+ reviews before product update',
      problem: 'AI reads thousands of reviews across your listings and surfaces complaint patterns before they tank your rating. Insydz is the multi seller marketplace software that turns negative feedback into your next product improvement automatically.',
      steps: [
        'Add your ASIN or competitor, AI scans all reviews in seconds.',
        'See complaint clusters, top issues ranked with examples.',
        'Analyse 5-star reviews, discover what buyers love most.',
        'Get review alerts, notified on new negative trends.'
      ],
      roi: [
        { label: 'Monthly return cost before packaging fix (14% return rate)', value: '−₹28,000', neg: true },
        { label: 'Monthly return savings after fix (5% return rate)', value: '+₹22,400', neg: false },
        { label: 'Rating improvement (4.1 → 4.6) = estimated conversion rate uplift', value: '+₹35,000/month', neg: false },
      ],
      outcomes: ['Multi-Seller Marketplace Software', 'AI Sentiment Analysis'],
      link: '/use-cases/analyze-customer-reviews',
      learnMore: { text: 'AI Review Intelligence', href: '/features/review-analytics-feature' },
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'avoid-stockouts-missed-sales',
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: 'Avoid Stockouts & Missed Sales',
      category: 'inventory',
      tag: '',
      context: 'Essential during festive & high-demand sale periods on Amazon & Flipkart',
      problem: 'Insydz models demand spikes — Big Billion Days, Diwali, Republic Day Sale — up to 15 days ahead. Stock, price, and rank for festive keywords before the rush hits and rivals run out.',
      steps: [
        'Track competitor stock, spot early stockouts fast.',
        'Monitor sales velocity, predict days of stock left.',
        'Get demand alerts, detect spikes before sale events.',
        'Plan procurement smartly, order with confidence.'
      ],
      roi: [
        { label: 'Additional revenue from 250 extra units sourced using Insydz demand data', value: '+₹5,20,000', neg: false },
        { label: 'Post-stockout rank recovery cost avoided (ads + lost organic)', value: '+₹45,000', neg: false },
      ],
      outcomes: ['Festive Demand Forecasting', 'Inventory Planning'],
      link: '/use-cases/avoid-stockouts',
      learnMore: { text: 'Inventory Intelligence', href: '/features/product-research-feature' },
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const faqs = [
    { id: 'faq-1', question: 'Can I access multiple use cases on the free plan?', answer: 'Yes. The free plan includes access to core use cases competitor price tracking, basic keyword ranking, and review summaries with no credit card required. Advanced capabilities like price elasticity modelling, deep product research, and full inventory demand signals are available on paid plans.' },
    { id: 'faq-2', question: 'Do these use cases work for Amazon India and Flipkart?', answer: 'Yes. Every Insydz use case is built specifically for Amazon.in and Flipkart. All data is in INR, all competitor tracking covers Indian marketplace categories, and all keyword rankings are tracked on Indian marketplace search not US or global platforms.' },
    { id: 'faq-3', question: 'Are these separate tools or one platform?', answer: 'One platform. All five use cases run inside a single Insydz dashboard. Insights from one use case automatically connect to others. When a competitor stocks out (inventory use case), you\'ll also see their keyword ranking impact (SEO use case) in the same view.' },
    { id: 'faq-4', question: 'Which use case should I start with?', answer: 'New sellers: Find Profitable Products. Active sellers in competitive categories: Track Competitor Prices. Stagnating listings with unexplained sales drops: Improve SEO and Analyse Reviews ranking slippage and review quality deterioration are the two most common hidden causes.' },
    { id: 'faq-5', question: 'Can agencies use these use cases for clients?', answer: 'Yes. Insydz\'s agency plan lets you run all five use cases across multiple client accounts from one dashboard. Each client gets their own workspace with full use case access. White-label reports covering all active use cases can be generated per client in one click.' },
    { id: 'faq-6', question: 'Which use case gives the fastest ROI?', answer: 'Track Competitor Prices typically delivers the fastest measurable ROI often within the first week. For new sellers, Find Profitable Products delivers the highest long-term ROI by preventing costly launch mistakes. Review Analysis often delivers the most surprising ROI sellers frequently discover hidden product issues costing thousands in returns monthly.' },
    { id: 'faq-7', question: 'Do I need to use all use cases together?', answer: 'No. Start with one use case that solves your most urgent problem today. Most sellers begin with competitor price tracking or product research, then expand to SEO and review analysis as their business grows. Insydz is designed to start simple and scale with you.' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-orange-700">Ecommerce Seller Analytics Software </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white leading-relaxed">
                How Sellers Use Insydz
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  to Make Better
                </span>
                <br />
                Decisions.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most trusted <strong>ecommerce seller analytics software</strong> built around how sellers actually think. From tracking competitor prices to preventing festive season stockouts, Insydz solves real, everyday marketplace problems.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
                  Start Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => document.getElementById('use-cases-grid')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full transition-all">
                  See How It Works →
                </Button>
              </div>
            </div>

            {/* Use case cards */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-2 sm:space-y-3 transition-all hover:shadow-orange-500/10">
                {[
                  { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Track Competitor Prices', sub: 'Real-time alerts • Margin protection', color: 'from-orange-500 to-red-500' },
                  { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Find Profitable Products', sub: 'Demand analysis • Low competition', color: 'from-blue-500 to-cyan-500' },
                  { icon: <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Improve SEO Rankings', sub: 'Keyword tracking • Listing optimisation', color: 'from-purple-500 to-pink-500' },
                  { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Analyse Customer Reviews', sub: 'AI sentiment • Product insights', color: 'from-yellow-500 to-orange-500' },
                  { icon: <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, title: 'Avoid Stockouts & Missed Sales', sub: 'Demand signals • Inventory planning', color: 'from-green-500 to-emerald-500' },
                ].map((card, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 sm:p-3 hover:shadow-md transition-all group">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>{card.icon}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate leading-relaxed">{card.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-relaxed">{card.sub}</p>
                    </div>
                  </div>
                ))}
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm leading-relaxed">5 Use Cases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PAIN POINTS ══ */}
      <section className="pt-8 pb-18 sm:pt-10 sm:pb-12 lg:pt-10 lg:pb-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">
              Different Problems.
              <br />
              <span className="text-orange-600 dark:text-orange-500">One Intelligence Platform.</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Indian sellers don't wake up thinking 'I need marketplace analytics software.' They wake up with specific and urgent problems. Insydz is designed around those problems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competitors change prices without warning and steal your sales rank", color: "from-orange-500 to-red-500" },
              { icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Reviews hide critical product issues that cost you ratings and returns", color: "from-purple-500 to-pink-500" },
              { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Products don't rank for the right keywords and traffic disappears", color: "from-blue-500 to-cyan-500" },
              { icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Stockouts happen during peak demand right when you need inventory most", color: "from-green-500 to-emerald-500" }
            ].map((pain, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-orange-400 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed flex-grow">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
              Sellers don't wake up looking for <span className="text-orange-600 dark:text-orange-500">"features."</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg leading-relaxed">
              They look for answers to specific problems. Insydz is designed around how Indian sellers actually think and operate.
            </p>
          </div>
        </div>
      </section>

      {/* ══ USE CASES GRID ══ */}
      <section id="use-cases-grid" className="pt-6 pb-12 sm:pt-6 sm:pb-16 lg:pt-10 lg:pb-16 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Explore All
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Seller Use Cases</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {useCases.map((uc) => (
              <div key={uc.id} id={uc.category} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 hover:border-orange-400 hover:shadow-xl transition-all group flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${uc.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{uc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">{uc.title}</h3>
                        {uc.tag && <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex-shrink-0 leading-relaxed shadow-sm">{uc.tag}</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">{uc.context}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 flex-grow">{uc.problem}</p>

                {/* Steps */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 leading-relaxed">Step-by-Step with Insydz</p>
                  <div className="space-y-3">
                    {uc.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${uc.color} text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>{i + 1}</span>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcomes */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {uc.outcomes.map((outcome, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 
                      bg-gradient-to-r from-green-50 to-emerald-50 
                      dark:from-green-900/20 dark:to-emerald-900/20 
                      border border-green-300 dark:border-green-700 
                      text-green-700 dark:text-green-400 
                      rounded-lg text-[10px] sm:text-xs font-semibold leading-relaxed shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> 
                      {outcome}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link href={uc.link} className="block w-full">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold py-5 rounded-xl group text-sm sm:text-base transition-all">
                      Deep Dive: {uc.title}
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHERE TO START ══ */}
      <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-12 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Not Sure Which
              <br />
              <span className="text-orange-600 dark:text-orange-500">Use Case to Start With?</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Here's what we recommend based on where you are in your seller journey:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              { icon: <TrendingUp className="w-6 h-6 sm:w-10 sm:h-10" />, title: "New Sellers", tag: "Start with Find Profitable Products", desc: "Launch with data, not guesswork. Avoid costly inventory mistakes before they happen. Know your market before you invest your first rupee in stock.", link: "/use-cases/find-profitable-products", color: "from-blue-500 to-cyan-500" },
              { icon: <DollarSign className="w-6 h-6 sm:w-10 sm:h-10" />, title: "Active Sellers", tag: "Start with Track Competitor Prices", desc: "Protect margins and respond to market changes instantly. If you're doing ₹5L+ a month, every pricing lag is costing you measurable revenue.", link: "/use-cases/track-competitor-prices", color: "from-orange-500 to-red-500" },
              { icon: <Search className="w-6 h-6 sm:w-10 sm:h-10" />, title: "Struggling Listings", tag: "Start with Improve SEO & Analyse Reviews", desc: "Boost visibility and fix what's silently hurting conversion. If sales have dropped without obvious cause rankings and reviews are the first places to look.", link: "/use-cases/improve-seo", color: "from-purple-500 to-pink-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 hover:border-orange-400 hover:shadow-xl transition-all group flex flex-col h-full">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">{item.title}</h3>
                <p className="text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 uppercase tracking-wider leading-relaxed text-orange-600">{item.tag}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-xs sm:text-sm flex-grow">{item.desc}</p>
                <Link href={item.link}>
                  <Button variant="ghost" className="text-orange-600 dark:text-orange-500 hover:text-orange-700 font-semibold p-0 h-auto group text-sm transition-all">
                    Explore This Use Case <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group">
              Start Free & Explore
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ BETTER TOGETHER ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white leading-relaxed">
              Use Cases That
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Work Better Together</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most sellers face more than one problem at the same time. Insydz connects insights across use cases so decisions are faster and more complete.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { from: { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Profitable product" }, to: { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Price tracking" }, desc: "Launch smart, then immediately protect with competitor price tracking", gradient: "from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20", border: "border-blue-200 dark:border-blue-700" },
              { from: { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Review issues" }, to: { icon: <Search className="w-5 h-5 sm:w-6 sm:h-6" />, text: "SEO & listing fixes" }, desc: "Fix product problems, then push improved listing up search rankings", gradient: "from-yellow-50 to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20", border: "border-yellow-200 dark:border-yellow-700" },
              { from: { icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Demand spike" }, to: { icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Inventory planning" }, desc: "Detect unusual demand signals early, adjust procurement before lead times run out", gradient: "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20", border: "border-green-200 dark:border-green-700" }
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.gradient} border-2 ${item.border} rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all group flex flex-col h-full`}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">{item.from.icon}</div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">{item.to.icon}</div>
                </div>
                <p className="text-gray-900 dark:text-white font-bold text-center mb-2 text-sm sm:text-base leading-relaxed">{item.from.text} → {item.to.text}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed flex-grow">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IS INSYDZ RIGHT FOR YOU ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center text-gray-900 dark:text-white leading-relaxed">
            Is Insydz <span className="text-orange-600 dark:text-orange-500">Right for You?</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">Best For</h3>
              </div>
              <ul className="space-y-3">
                {['Active Amazon India or Flipkart marketplace sellers','Sellers in competitive price-sensitive categories','Sellers making or wanting to make data-driven decisions','Sellers doing ₹2L+ monthly who want to protect margins','D2C brands launching new products on Indian marketplaces','Agencies managing multiple Amazon/Flipkart seller clients','Brand managers tracking category market share in INR'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">Not Ideal For</h3>
              </div>
              <ul className="space-y-3">
                {['One-time sellers with a single product and no growth plan','Non-ecommerce businesses with no marketplace presence','Sellers whose primary challenge is logistics, not intelligence'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0 text-base sm:text-lg">•</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center text-gray-900 dark:text-white leading-relaxed">
            Use Cases <span className="text-orange-600 dark:text-orange-500">FAQs</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-sm">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg leading-relaxed">{faq.question}</span>
                  {expandedFaq === faq.id
                    ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-3 sm:pt-4 text-sm sm:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white leading-relaxed">Solve Real Seller Problems with Insydz</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For New Sellers</h3>
              <p className="text-xs font-semibold text-orange-600 mb-2 sm:mb-3 leading-relaxed">Free Plan</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Start with one use case. Setup in 2 minutes. Begin with Find Profitable Products and launch your next product with data, not guesswork.</p>
              <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-full text-sm py-5 transition-all">Start Free →</Button>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 border-2 border-orange-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all relative overflow-hidden flex flex-col h-full group hover:scale-[1.02]">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-md z-10">Most Popular</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-relaxed">For Growing Sellers</h3>
              <p className="text-xs font-semibold text-orange-100 mb-2 sm:mb-3 leading-relaxed">Growth Plan</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Managing ₹5L–₹50L monthly? Activate all 5 use cases with full tracking, WhatsApp alerts, AI recommendations, and daily reporting.</p>
              <Link href="/pricing" className="w-full bg-white hover:bg-gray-100 text-orange-700 font-bold rounded-full text-sm inline-block text-center py-2.5 px-4 transition-all">Try Growth Plan →</Link>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1 flex flex-col h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-relaxed">For Agencies</h3>
              <p className="text-xs font-semibold text-purple-600 mb-2 sm:mb-3 leading-relaxed">Agency Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 flex-grow">Managing multiple client accounts? Run all use cases across every client from one dashboard with white-label reporting.</p>
              <Link href="/solutions/ecommerce-agencies" className="w-full border-2 border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold rounded-full text-sm inline-block text-center py-2 px-4 transition-all">Book a Demo →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white leading-relaxed">
            Solve Real Seller Problems
            <br />
            <span className="text-orange-100">with Insydz</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            Start with one use case. Expand as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group transition-all">
              Start Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={() => document.getElementById('use-cases-grid')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full border-2 border-orange-400 transition-all">
              Explore All Use Cases →
            </Button>
          </div>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed">✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 2 minutes &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-orange-300 dark:border-orange-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base transition-all">
          Start Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-16 sm:h-20" />
    </div>
  );
}

export default UseCasesPage;
