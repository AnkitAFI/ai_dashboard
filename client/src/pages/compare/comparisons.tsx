import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ChevronDown, ChevronRight, Check, ArrowRight,
  CheckCircle2, DollarSign, Globe, Bell, Zap, 
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  Mail, Smartphone, BarChart3, Package, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ComparisonsPage() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    setLocation("/signup");
  };

  const comparisonFeatures = [
    {
      area: 'Marketplace Coverage',
      insydz: 'Amazon + Flipkart',
      helium: 'Amazon only',
      insydzIcon: <Globe className="w-5 h-5 text-green-600" />,
      heliumIcon: <Package className="w-5 h-5 text-gray-500" />
    },
    {
      area: 'Pricing',
      insydz: '₹499–₹2,999/month',
      helium: '$39–$99/month',
      insydzIcon: <IndianRupee className="w-5 h-5 text-green-600" />,
      heliumIcon: <DollarSign className="w-5 h-5 text-gray-500" />
    },
    {
      area: 'Free Plan',
      insydz: 'Free forever',
      helium: 'Limited trial',
      insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" />
    },
    {
      area: 'Alerts',
      insydz: 'WhatsApp + Dashboard',
      helium: 'Email',
      insydzIcon: <Smartphone className="w-5 h-5 text-green-600" />,
      heliumIcon: <Mail className="w-5 h-5 text-gray-500" />
    },
    {
      area: 'Ease of Use',
      insydz: 'Action-driven',
      helium: 'Tool-heavy',
      insydzIcon: <Zap className="w-5 h-5 text-green-600" />,
      heliumIcon: <BarChart3 className="w-5 h-5 text-gray-500" />
    },
    {
      area: 'Language',
      insydz: 'Hindi + English',
      helium: 'English only',
      insydzIcon: <Users className="w-5 h-5 text-green-600" />,
      heliumIcon: <Globe className="w-5 h-5 text-gray-500" />
    }
  ];

  const comparisonReasons = [
    'Helium 10 pricing starts feeling expensive',
    'Flipkart becomes important',
    'Data feels overwhelming instead of actionable',
    'Manual work still takes too much time'
  ];

  const globalToolLimitations = [
    'Dollar pricing hurts smaller Indian sellers',
    'No Flipkart data',
    'Email alerts often ignored',
    'Built for US seller behavior, not Indian workflows'
  ];

  const insydzFitReasons = [
    'Sell on Amazon + Flipkart',
    'Want affordable pricing without feature overload',
    'Prefer WhatsApp alerts over emails',
    'Want clear recommendations, not just dashboards'
  ];

  const heliumFitReasons = [
    'You sell only in US or EU markets',
    'You need advanced PPC tooling',
    'You prefer deep data exploration over guided actions'
  ];

  const whyIndianSellersExplore = [
    'Rising costs of global tools',
    'Need for Flipkart insights',
    'Preference for WhatsApp-based alerts',
    'Desire for simpler, action-focused insights'
  ];

  const decisionCards = [
    {
      title: 'New or Growing Indian Sellers',
      recommendation: 'Insydz',
      reason: 'Lower cost, faster learning, easier decisions',
      color: 'from-blue-500 to-cyan-500',
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      title: 'Global / US-Focused Sellers',
      recommendation: 'Helium 10',
      reason: 'More suited to international Amazon markets',
      color: 'from-purple-500 to-pink-500',
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: 'Multi-Marketplace Sellers',
      recommendation: 'Insydz',
      reason: 'Built beyond Amazon',
      color: 'from-green-500 to-emerald-500',
      icon: <Package className="w-8 h-8" />
    }
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is Insydz a replacement for Helium 10?',
      answer: 'Insydz is built specifically for Indian sellers and multi-marketplace needs. If you primarily sell in India across Amazon, Flipkart, Insydz offers better value and relevance. However, if you focus on US/EU markets with advanced Amazon-only needs, Helium 10 may still be a better fit.'
    },
    {
      id: 'faq-2',
      question: 'Why is Insydz cheaper than Helium 10?',
      answer: 'Insydz is priced in rupees and built for the Indian market, which allows us to offer affordable pricing. We focus on clear, actionable insights rather than overwhelming toolsets, keeping costs lower while delivering what Indian sellers actually need.'
    },
    {
      id: 'faq-3',
      question: 'Does Insydz offer keyword and product research?',
      answer: 'Yes. Insydz provides keyword tracking, competitor analysis, and product insights tailored to Indian marketplaces including Amazon, Flipkart. Our approach focuses on actionable recommendations rather than raw data dumps.'
    },
    {
      id: 'faq-4',
      question: 'Can I use Insydz and Helium 10 together?',
      answer: 'Yes. Many sellers run Insydz alongside Helium 10 to compare value before making a decision. Insydz is designed to coexist — not force a risky switch.'
    },
    {
      id: 'faq-5',
      question: 'Which tool is better for Indian sellers?',
      answer: 'For sellers focused on Indian marketplaces (Amazon India, Flipkart) with budget constraints, Insydz is purpose-built for your needs. For sellers targeting US/EU markets exclusively, Helium 10 may offer more international-focused features.'
    },
    {
      id: 'faq-6',
      question: 'Is Insydz a cheaper alternative to Helium 10 for Indian sellers?',
      answer: 'Insydz is built specifically for Indian pricing sensitivity and offers similar intelligence at a significantly lower cost. It\'s not just cheaper — it\'s designed for how Indian sellers actually work.'
    },
    {
      id: 'faq-7',
      question: 'Will switching tools affect my Amazon account?',
      answer: 'No. Insydz uses read-only access and does not modify listings, prices, or ads. Your Amazon account remains completely safe during and after the switch.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-blue-200 shadow-lg"
            : "bg-white/80 backdrop-blur-md border-b border-blue-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setLocation("/")}
            >
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Insydz Logo" 
                  className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 object-contain"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Insydz
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ← Back to Home
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Intent Match */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">Built for Indian sellers 🇮🇳</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 mb-6">
              Insydz vs Helium 10 —
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Which Tool Fits Indian Sellers Better?
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Both tools help sellers grow on Amazon. The difference is who they're built for.
              <br />
              Compare pricing, marketplaces, alerts, and usability — then decide confidently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group"
              >
                👉 Start Free with Insydz
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg rounded-full"
              >
                Compare Features Below →
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Built for Indian sellers 🇮🇳</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>₹ pricing, not dollars</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Free plan available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When Sellers Compare These Tools */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-center text-gray-900">
            Why Sellers Compare
            <br />
            <span className="text-blue-600">Insydz and Helium 10</span>
          </h2>

          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            Sellers usually compare these tools when:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {comparisonReasons.map((reason, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed pt-2">{reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-3xl p-8 text-center shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900">
              Choosing the wrong tool at this stage can slow growth and hurt margins.
            </p>
          </div>
        </div>
      </section>

      {/* Why Indian Sellers Explore Insydz - MICRO PROOF */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            Why Indian Sellers
            <br />
            <span className="text-blue-600">Explore Insydz</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {whyIndianSellersExplore.map((reason, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed pt-1.5">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Level Positioning */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            How Insydz and Helium 10
            <br />
            <span className="text-blue-600">Are Different at the Core</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Helium 10 */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Helium 10</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Built primarily for <span className="font-bold">US & global Amazon sellers.</span>
                <br /><br />
                Powerful tools, but assumes higher budgets and Amazon-only focus.
              </p>
            </div>

            {/* Insydz */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-3xl p-8 hover:shadow-xl transition-all relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl px-4 py-2 shadow-xl">
                <p className="text-white font-bold text-sm">India-First 🇮🇳</p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Insydz</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Built specifically for <span className="font-bold">Indian sellers.</span>
                <br /><br />
                Focuses on affordability, multi-marketplace support, and clear actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-center text-gray-900">
            Insydz vs Helium 10 —
            <br />
            <span className="text-blue-600">Feature Comparison</span>
          </h2>

          <div className="bg-white border-2 border-blue-200 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">Area</th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">Insydz</th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">Helium 10</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr 
                      key={index}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-6 py-5 font-bold text-gray-900">{feature.area}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {feature.insydzIcon}
                          <span className="text-gray-700 font-medium">{feature.insydz}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {feature.heliumIcon}
                          <span className="text-gray-600">{feature.helium}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6 text-lg">
            This comparison focuses on what matters most to Indian sellers.
          </p>
        </div>
      </section>

      {/* The Real Cost Difference - COST REALITY SECTION */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            The Real Cost Difference
            <br />
            <span className="text-blue-600">for Indian Sellers</span>
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-8 mb-8 shadow-lg">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Helium 10 pricing may look standard globally, but for Indian sellers the real cost adds up due to dollar pricing, GST, and long-term subscriptions.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Helium 10 Cost */}
              <div className="bg-white border-2 border-red-300 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Helium 10</h3>
                </div>
                <p className="text-3xl font-black text-red-600 mb-2">$99/month</p>
                <p className="text-2xl font-bold text-gray-700">≈ ₹8,000+/month</p>
              </div>

              {/* Insydz Cost */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <IndianRupee className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Insydz</h3>
                </div>
                <p className="text-3xl font-black text-green-600 mb-2">₹1,299/month</p>
                <p className="text-lg font-semibold text-gray-700">with a free plan to start</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900">
              For most Indian sellers, <span className="text-blue-600">affordability directly impacts consistency</span> and long-term usage.
            </p>
          </div>
        </div>
      </section>

      {/* India-First Reality Check */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            Why Global Tools
            <br />
            <span className="text-blue-600">Don't Always Fit Indian Sellers</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {globalToolLimitations.map((limitation, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed pt-1.5">{limitation}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900">
              That's why many Indian sellers look for <span className="text-blue-600">alternatives built closer to home.</span>
            </p>
          </div>
        </div>
      </section>

      {/* When Insydz Is a Better Fit */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            Choose Insydz
            <br />
            <span className="text-blue-600">If You…</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {insydzFitReasons.map((reason, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-gray-900 font-semibold leading-relaxed pt-2.5 text-lg">{reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group"
            >
              👉 Try Insydz Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* When Helium 10 May Make More Sense */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            When Helium 10
            <br />
            <span className="text-gray-600">Might Be a Better Choice</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {heliumFitReasons.map((reason, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:border-gray-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed pt-1.5">{reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400 rounded-3xl p-8 text-center shadow-lg">
            <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-900">
              The best tool depends on <span className="text-gray-700">your selling model</span> — not hype.
            </p>
          </div>
        </div>
      </section>

      {/* Already Using Helium 10 - SWITCHING & COEXISTENCE */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            Already Using Helium 10?
            <br />
            <span className="text-blue-600">You Don't Have to Switch Overnight.</span>
          </h2>

          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-3xl p-8 mb-8 shadow-lg">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Many sellers start with Insydz alongside Helium 10 to:
            </p>

            <div className="space-y-4">
              {[
                'Compare insights using real data',
                'Reduce dependence on expensive plans',
                'Gradually move to a simpler, more affordable workflow'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg pt-1">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-3xl p-8 text-center shadow-lg">
            <p className="text-2xl font-bold text-gray-900">
              Insydz is designed to <span className="text-green-600">coexist</span> — not force a risky switch.
            </p>
          </div>
        </div>
      </section>

      {/* Real-World Decision Framework - DECISION SUMMARY */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-center text-gray-900">
            Which Tool
            <br />
            <span className="text-blue-600">Should You Choose?</span>
          </h2>

          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Quick Decision Guide
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {decisionCards.map((card, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-blue-400 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Recommended:</p>
                  <p className="text-lg font-black text-blue-900">{card.recommendation}</p>
                </div>
                <p className="text-gray-600 leading-relaxed">{card.reason}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border-2 border-blue-300 rounded-3xl p-8 shadow-lg">
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">Choose Insydz if:</p>
                  <p className="text-gray-700 leading-relaxed">
                    You're an Indian seller who values affordability, multi-marketplace coverage, and clear actions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">Choose Helium 10 if:</p>
                  <p className="text-gray-700 leading-relaxed">
                    You sell primarily in US/EU markets and need advanced Amazon-only tooling.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-2xl p-6 text-center">
              <p className="text-xl font-bold text-gray-900">
                The right tool depends on <span className="text-blue-600">where and how you sell.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free-First CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900">
            Try Before
            <br />
            <span className="text-blue-600">You Decide</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            You don't need to switch blindly. Start free with Insydz and compare using real data from your own products.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group"
          >
            👉 Start Free with Insydz
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-gray-500 mt-6">
            Start free. Compare with your own data before deciding.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black mb-12 text-center text-gray-900">
            Insydz vs Helium 10 – <span className="text-blue-600">FAQs</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-4 text-lg">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5 bg-gray-50">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
            Compare Clearly.
            <br />
            <span className="text-blue-100">Choose What Fits Your Business.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              👉 Start Free with Insydz
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => setLocation("/pricing")}
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-12 py-6 text-lg rounded-full border-2 border-blue-400"
            >
              View Pricing →
            </Button>
          </div>
          <p className="text-white/80 text-sm">
            ✓ No credit card required  ✓ Free plan forever  ✓ Compare with real data
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Insydz Logo" 
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Insydz
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered intelligence for Indian sellers
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => setLocation("/")} className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Home
                </button>
                <button onClick={() => setLocation("/pricing")} className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Pricing
                </button>
                <button onClick={handleGetStarted} className="block text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Login
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>contact@insydz.com</p>
                <p>+91 98765 43210</p>
                <p>New Delhi, India</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Insydz. All rights reserved. Built for Indian sellers 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
