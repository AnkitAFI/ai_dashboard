"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { 
  ChevronDown, ChevronRight, Check, ArrowRight,
  CheckCircle2, DollarSign, Globe, Smartphone, BarChart3, Package, Shield,
  Zap, Search, MessageCircle, TrendingDown,
  Flame, Mail, IndianRupee, AlertCircle, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-static";

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Viral Launch", "item": "https://insydz.com/compare/insydz-vs-viral-launch" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is Insydz a replacement for Viral Launch?", "acceptedAnswer": { "@type": "Answer", "text": "For Indian sellers on Amazon India, Flipkart — yes. Insydz covers Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence that Viral Launch cannot provide. If you sell on Amazon.com and rely on Viral Launch's Kinetic PPC automation and US launch sequences, those capabilities don't have a direct equivalent in Insydz — you'd want to keep Viral Launch for that specific use case." } },
      { "@type": "Question", "name": "Why is Insydz cheaper than Viral Launch?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is priced in INR starting at ₹1,999/month vs Viral Launch's $69/month (~₹5,800). The difference reflects both currency and scope: Viral Launch is a broad platform built for Amazon.com sellers globally with 15+ tools. Insydz focuses on five high-value intelligence use cases built for Indian marketplace sellers. Lower cost, faster onboarding, and features calibrated for India — not adapted from US data." } },
      { "@type": "Question", "name": "Can I use Insydz and Viral Launch together?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — sellers with cross-border operations do exactly this. Viral Launch for Amazon.com PPC automation and US market product launches. Insydz for Indian marketplace intelligence: Flipkart tracking, Hindi review analysis, WhatsApp alerts, and festive demand forecasting. If India and USA are both active channels, this combination covers the full picture without compromise." } },
      { "@type": "Question", "name": "Does Viral Launch work for Amazon India sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Viral Launch supports Amazon India to a limited extent — product research and keyword tracking on Amazon.in are possible. However, the data is calibrated for Amazon.com dynamics. Keyword volumes, demand projections, and revenue estimates are not India-specific. There is no Flipkart support, no WhatsApp alerts, no Hindi review analysis, and no Indian festive demand modelling. For precision India-market decisions, Amazon.in-native data from Insydz is significantly more accurate." } },
      { "@type": "Question", "name": "What is the best Viral Launch alternative for India?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is the most purpose-built Viral Launch alternative for Indian sellers — covering Amazon India, Flipkart with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. A permanent free plan is available — no credit card required. SellerApp covers some Amazon India use cases but has no Flipkart support. Helium 10 is USD-priced and Amazon.com-focused. For India-first sellers, Insydz is the only purpose-built option of the three." } },
      { "@type": "Question", "name": "How much does Viral Launch cost in India in INR?", "acceptedAnswer": { "@type": "Answer", "text": "Viral Launch pricing in India converts to approximately: Essentials at $69/month (~₹5,800), Pro at $99/month (~₹8,300), and Pro Plus at $199/month (~₹16,700) at current USD/INR rates. Since billing is in USD, your actual INR cost changes every month with currency movements. Over 12 months on Viral Launch Pro, you'd pay ~₹99,600 — compared to Insydz Premium at ₹35,988/year for a tool that covers Amazon India, Flipkart." } },
      { "@type": "Question", "name": "Does Insydz work for Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz provides competitor price tracking, keyword rank monitoring, review sentiment analysis, and inventory management for Flipkart sellers. Viral Launch has no Flipkart support. If Flipkart is part of your business, Insydz is the only tool in this comparison that covers it." } },
      { "@type": "Question", "name": "Is there a free plan for Insydz?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz has a permanent free plan — not a trial. Covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Viral Launch has no free plan — only a 14-day trial that requires a credit card upfront." } }
    ]
  }
];

export default function InsydzVsViralLaunchPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-virallaunch-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => {
      SCHEMAS.forEach((_, i) => {
        const el = document.getElementById(`insydz-virallaunch-schema-${i}`);
        if (el) el.remove();
      });
    };
  }, []);

  const handleGetStarted = () => router.push("/signup");

  // Comparison data
  const comparisonFeatures = [
    { area: 'Marketplace Coverage', insydz: 'Amazon India + Flipkart', competitor: 'Amazon.com only no Amazon.in, no Flipkart', insydzIcon: <Globe className="w-5 h-5 text-green-600" />, competitorIcon: <Package className="w-5 h-5 text-gray-500" /> },
    { area: 'Pricing', insydz: '₹0 / ₹1,999 / ₹2,999/month in INR', competitor: '$69–$199/month (~₹5,800–₹16,700). Billed in USD.', insydzIcon: <IndianRupee className="w-5 h-5 text-green-600" />, competitorIcon: <DollarSign className="w-5 h-5 text-gray-500" /> },
    { area: 'Free Plan', insydz: 'Free forever — 25 products, no credit card', competitor: 'No free plan. 14-day trial. Credit card required upfront.', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Alert Channel', insydz: 'WhatsApp + Dashboard', competitor: 'Email + Dashboard only', insydzIcon: <Smartphone className="w-5 h-5 text-green-600" />, competitorIcon: <Mail className="w-5 h-5 text-gray-500" /> },
    { area: 'Language Support', insydz: 'Hindi + Hinglish + English review analysis', competitor: 'English only', insydzIcon: <Users className="w-5 h-5 text-green-600" />, competitorIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Keyword Research', insydz: 'Amazon.in + Flipkart data in Indian volumes', competitor: 'Amazon.com keyword data — not calibrated for Indian search', insydzIcon: <Search className="w-5 h-5 text-green-600" />, competitorIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Competitor Price Tracking', insydz: 'Real-time, WhatsApp alert, AI reprice in INR', competitor: 'Competitor tracking on Amazon.com only', insydzIcon: <TrendingDown className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Review Analysis', insydz: 'AI clustering in Hindi & English', competitor: 'English only', insydzIcon: <MessageCircle className="w-5 h-5 text-green-600" />, competitorIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Inventory Management', insydz: 'AI stockout prediction with Indian festive demand multipliers', competitor: 'Not a core Viral Launch feature', insydzIcon: <Package className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Festive Demand Intelligence', insydz: 'Diwali, Big Billion Days, GIF, Republic Day forecasting', competitor: 'Not available — built for US market', insydzIcon: <Flame className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Data Accuracy for India', insydz: 'Built from Amazon.in + Flipkart data directly', competitor: 'US-calibrated data — directional but not India-accurate', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-orange-500" /> },
    { area: 'Ease of Use', insydz: 'Action-driven every alert includes next step', competitor: 'Tool-heavy requires setup and interpretation', insydzIcon: <Zap className="w-5 h-5 text-green-600" />, competitorIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Customer Support', insydz: 'Hindi + English support', competitor: 'English only', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, competitorIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Product Launch Tools', insydz: 'Product research for Indian markets no launch sequencing', competitor: 'Launch sequences, PPC automation, Kinetic Ads — for Amazon.com', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, competitorIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
    { area: 'Amazon PPC Management', insydz: 'Not available (focus: organic intelligence)', competitor: 'Kinetic PPC — automated Amazon Ads for Amazon.com', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, competitorIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is Insydz a replacement for Viral Launch?',
      answer: "For Indian sellers on Amazon India, Flipkart yes. Insydz covers Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence that Viral Launch cannot provide. If you sell on Amazon.com and rely on Viral Launch's Kinetic PPC automation and US launch sequences, those capabilities don't have a direct equivalent in Insydz you'd want to keep Viral Launch for that specific use case."
    },
    {
      id: 'faq-2',
      question: 'Why is Insydz cheaper than Viral Launch?',
      answer: "Insydz is priced in INR starting at ₹1,999/month vs Viral Launch's $69/month (~₹5,800). The difference reflects both currency and scope: Viral Launch is a broad platform built for Amazon.com sellers globally with 15+ tools. Insydz focuses on five high-value intelligence use cases built for Indian marketplace sellers. Lower cost, faster onboarding, and features calibrated for India not adapted from US data."
    },
    {
      id: 'faq-3',
      question: 'Can I use Insydz and Viral Launch together?',
      answer: "Yes. Sellers with cross-border operations do exactly this. Viral Launch for Amazon.com PPC automation and US market product launches. Insydz for Indian marketplace intelligence: Flipkart tracking, Hindi review analysis, WhatsApp alerts, and festive demand forecasting. If India and USA are both active channels, this combination covers the full picture without compromise."
    },
    {
      id: 'faq-4',
      question: 'Does Viral Launch work for Amazon India sellers?',
      answer: "Viral Launch supports Amazon India to a limited extent product research and keyword tracking on Amazon.in are possible. However, the data is calibrated for Amazon.com dynamics. Keyword volumes, demand projections, and revenue estimates are not India-specific. There is no Flipkart support, no WhatsApp alerts, no Hindi review analysis, and no Indian festive demand modelling. For precision India-market decisions, Amazon.in-native data from Insydz is significantly more accurate."
    },
    {
      id: 'faq-5',
      question: 'What is the best Viral Launch alternative for India?',
      answer: "Insydz is the most purpose-built Viral Launch alternative for Indian sellers covering Amazon India, Flipkart with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. A permanent free plan is available no credit card required. SellerApp covers some Amazon India use cases but has no Flipkart support. Helium 10 is USD-priced and Amazon.com-focused. For India-first sellers, Insydz is the only purpose-built option of the three."
    },
    {
      id: 'faq-6',
      question: 'How much does Viral Launch cost in India in INR?',
      answer: "Viral Launch pricing in India converts to approximately: Essentials at $69/month (~₹5,800), Pro at $99/month (~₹8,300), and Pro Plus at $199/month (~₹16,700) at current USD/INR rates. Since billing is in USD, your actual INR cost changes every month with currency movements. Over 12 months on Viral Launch Pro, you'd pay ~₹99,600 compared to Insydz Premium at ₹35,988/year for a tool that covers Amazon India, Flipkart."
    },
    {
      id: 'faq-7',
      question: 'Does Insydz work for Flipkart sellers?',
      answer: "Yes. Insydz provides competitor price tracking, keyword rank monitoring, review sentiment analysis, and inventory management for Flipkart sellers. Viral Launch has no Flipkart support. If Flipkart is part of your business, Insydz is the only tool in this comparison that covers it."
    },
    {
      id: 'faq-8',
      question: 'Is there a free plan for Insydz?',
      answer: "Yes. Insydz has a permanent free plan not a trial. Covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Viral Launch has no free plan only a 14-day trial that requires a credit card upfront."
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium text-blue-700">🇮🇳 Built for Indian Sellers</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
            Insydz vs Viral Launch
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Which Tool Fits Indian Sellers Better?</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Both tools help sellers grow on Amazon. The difference is who they're built for. Compare pricing, marketplaces, alerts, and usability then decide confidently.
          </p>

          {/* Verdict Strip */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 mb-10 max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium pb-3 pr-6 leading-relaxed">Metric</th>
                  <th className="text-left text-blue-400 font-bold pb-3 pr-6 leading-relaxed">Insydz</th>
                  <th className="text-left text-gray-400 font-medium pb-3 leading-relaxed">Viral Launch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { label: 'Starting Price', insydz: '₹0/month forever', competitor: '~₹5,800+/month ($69)' },
                  { label: 'Flipkart Support', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'WhatsApp Alerts', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'Hindi Review Analysis', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'Free Plan (Permanent)', insydz: '✅ Yes, no credit card', competitor: '✗ 14-day trial only' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-gray-400 py-2.5 pr-6 text-left leading-relaxed">{row.label}</td>
                    <td className="text-green-400 font-semibold py-2.5 pr-6 text-left leading-relaxed">{row.insydz}</td>
                    <td className="text-gray-500 py-2.5 text-left leading-relaxed">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group">
              Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="lg"
              className="border-2 border-blue-400 text-blue-600 dark:text-blue-400 font-bold px-8 py-6 rounded-full"
            >
              See Full Comparison ↓
            </Button>
          </div>
        </div>
      </section>

      {/* Why Indian Sellers Struggle with Viral Launch */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            Why Indian Sellers Struggle with Viral Launch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto leading-relaxed">
            Viral Launch was built to help Amazon sellers launch and rank products. It does that well for Amazon.com. Here's where Indian sellers run into walls, fast.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                title: 'Entry price is ₹5,800 with no free plan',
                desc: "Viral Launch's cheapest plan is $69/month (~₹5,800 at current rates). There's no free tier at all just a 14-day trial. For a seller still validating their niche or managing tight working capital, paying ₹5,800 before seeing a single result is a steep ask.",
                color: 'from-red-500 to-orange-500',
              },
              {
                number: '02',
                title: 'Built for Amazon.com not Amazon.in or Flipkart',
                desc: "Viral Launch is designed for Amazon.com. Its market intelligence, keyword data, and competitor tracking are calibrated for US market dynamics not Indian search behaviour, INR margins, or the Flipkart sellers competing alongside you for the same Indian buyer.",
                color: 'from-orange-500 to-yellow-500',
              },
              {
                number: '03',
                title: 'Tool-heavy, dashboard-first not mobile-ready',
                desc: "Viral Launch is a desktop-first platform that delivers alerts by email. Indian sellers operate from phones, manage WhatsApp with suppliers, and make decisions on the move. A tool that requires logging into a dashboard to see what's happening isn't built for how India works.",
                color: 'from-yellow-500 to-green-500',
              },
              {
                number: '04',
                title: 'No festive season intelligence for Indian calendars',
                desc: "Viral Launch has no concept of Diwali demand spikes, Big Billion Days inventory pressure, or Great Indian Festival keyword surges. For Indian sellers, these 4–6 week windows can make or break the entire year. A tool blind to that seasonality is flying you into peak season without a map.",
                color: 'from-blue-500 to-cyan-500',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white font-black text-lg shrink-0`}>
                    {item.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-3xl mx-auto text-center">
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              <strong>A fair note:</strong> Viral Launch has strong product launch and rank-tracking tools for Amazon.com sellers. If Amazon USA is your primary market, it has real strengths. This comparison is specifically for Indian sellers operating on Amazon India, Flipkart where the platform gap is stark.
            </p>
          </div>
        </div>
      </section>

      {/* Full Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            Insydz vs Viral Launch Every Dimension That Matters for Indian Sellers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            A complete comparison including areas where Viral Launch has a real edge no cherry-picking.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <th className="px-6 py-4 text-left text-white font-bold leading-relaxed">Feature Area</th>
                  <th className="px-6 py-4 text-left text-white font-bold leading-relaxed">🇮🇳 Insydz</th>
                  <th className="px-6 py-4 text-left text-white font-bold leading-relaxed">Viral Launch</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={i} className={`border-b border-gray-200 dark:border-gray-700 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white leading-relaxed">{feature.area}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.insydzIcon}
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feature.insydz}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.competitorIcon}
                        <span className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            Insydz vs Viral Launch Pricing Viral Launch Costs ₹5,800 Before You've Sold a Single Unit
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto leading-relaxed">
            Viral Launch pricing in India translates to $69–$199/month once the rupee conversion happens. Every month, that number shifts with the exchange rate.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Insydz Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🇮🇳</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-relaxed">Insydz Pricing</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Free Plan', price: '₹0/month always', desc: '25 products, no credit card, no expiry date' },
                  { plan: 'Basic', price: '₹1,999/month', desc: 'Competitor price tracking, keyword monitoring, review analysis' },
                  { plan: 'Premium', price: '₹2,999/month', desc: 'All features, all three marketplaces, priority support' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">Billed in INR. No USD conversion surprises month to month. Upgrade only when you're seeing real value.</span>
                </li>
              </ul>
            </div>

            {/* Viral Launch Pricing */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-relaxed">Viral Launch Pricing (India Reality)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Essentials', price: '$69/month (~₹5,800)', desc: 'Basic research tools' },
                  { plan: 'Pro', price: '$99/month (~₹8,300)', desc: 'Core research + keyword tracking' },
                  { plan: 'Pro Plus', price: '$199/month (~₹16,700)', desc: 'Full suite including PPC tools' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                {[
                  'No free plan. 14-day trial — credit card required upfront.',
                  'Billing in USD means your INR cost rises whenever the rupee weakens.',
                  'All plans cover Amazon.com only — not Amazon.in or Flipkart.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROI Callout */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-black mb-3 leading-relaxed">12-Month Real Cost Comparison</h3>
            <p className="text-white/90 text-lg max-w-3xl mx-auto leading-relaxed">
              A seller on Viral Launch Pro pays ~<strong>₹99,600/year</strong>. Insydz Premium is <strong>₹35,988/year</strong> covering Amazon India, Flipkart, with WhatsApp alerts and Hindi review analysis.
            </p>
            <p className="text-white font-black text-3xl mt-4 leading-relaxed">That's ₹63,612 per year back into inventory or ads.</p>
          </div>
        </div>
      </section>

      {/* Real Seller Scenario */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            What Most Tools Don't Tell You The Launch That Nearly Went Wrong
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto leading-relaxed">
            Viral Launch is built around product launches. So is every Indian seller's plan going into festive season. Here's where the data gap bites hardest.
          </p>
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-relaxed">
              Deepa's Great Indian Festival Launch Baby Products Category, Amazon India
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { label: 'The situation', value: "Launching baby bottles, ₹599 price point, targeting Great Indian Festival for initial ranking boost" },
                    { label: 'What went wrong', value: "Launched 3 weeks before GIF. 'BPA free baby bottle' had 4× search volume spike during festival. Out of stock on Day 6 of a 14-day launch window." },
                    { label: 'Why it happened', value: "Viral Launch data showed keyword volume but not the Indian festive demand multiplier. No WhatsApp alert. Dashboard showed stockout after it had already happened." },
                    { label: 'The cost', value: '₹1.8L in missed GIF revenue. Launch ranking reset. Spent ₹42,000 on PPC to recover position.' },
                    { label: 'With Insydz (same scenario)', value: 'Festive demand alert 16 days before GIF. Insydz flagged 3.8× demand multiplier for category. Deepa doubled launch stock to 380 units.', highlight: true },
                    { label: 'Outcome difference', value: 'Completed 14-day launch window. Achieved Page 1 ranking. ₹2.7L GIF revenue zero ranking recovery spend.', highlight: true },
                  ].map((row, i) => (
                    <tr key={i} className={row.highlight ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                      <td className="py-4 pr-6 font-bold text-gray-700 dark:text-gray-300 w-1/3 leading-relaxed">{row.label}</td>
                      <td className={`py-4 leading-relaxed ${row.highlight ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm leading-relaxed">
              The problem wasn't Deepa's product or her instincts. The problem was that her tool's demand data was built for Seattle, not Surat and the alert arrived in her email, not her WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Assessment */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            Insydz vs Viral Launch Where Each Tool Actually Wins
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto leading-relaxed">
            No cherry-picking. A straight honest take on which tool fits which seller.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-relaxed">🇮🇳 Choose Insydz if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell on Flipkart alongside Amazon India',
                  'Want WhatsApp alerts not email digests you check tomorrow',
                  'Need pricing in INR with no USD exchange rate risk',
                  'Have customers who review in Hindi or Hinglish',
                  'Need festive demand intelligence (Diwali, BBD, GIF, Republic Day)',
                  'Are building or launching a product on Indian marketplaces',
                  'Want action-driven recommendations — not data to interpret',
                  'Are a new, growing, or D2C seller who needs value before scale',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-relaxed">Choose Viral Launch if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell on Amazon.com (US marketplace) as your primary channel',
                  'Need structured Amazon.com product launch sequences',
                  'Run Amazon US PPC and want Kinetic campaign automation',
                  'Are an experienced Amazon US seller scaling to 7–8 figures',
                  'Want AI-assisted Amazon.com listing optimisation',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm leading-relaxed">
                Viral Launch has strong Amazon.com tools for US sellers. But if your customers are Indian and your inventory planning needs Diwali in the model the tool you need was built here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Alerts */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white leading-relaxed">
            The Alert That Gets Read in 4 Minutes, Not 4 Hours
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto leading-relaxed">
            Viral Launch sends alerts to your email. Insydz sends them to WhatsApp with the action already calculated, the moment the data changes.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: 'Competitor Price Drop',
                icon: <IndianRupee className="w-6 h-6" />,
                color: 'from-green-500 to-emerald-500',
                message: "Competitor dropped price on Baby Bottles (250ml). Their new price: ₹499 (was ₹599). Your price: ₹599. Suggested response: ₹539 above your ₹490 margin floor.",
              },
              {
                type: 'Festive Launch Warning',
                icon: <Flame className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
                message: "Great Indian Festival in 16 days. Category demand multiplier: 3.8×. Current launch stock: 200 units (covers 5.3 days at festive velocity). Recommended reorder: 560 units before Day 1.",
              },
              {
                type: 'Ranking Drop',
                icon: <TrendingDown className="w-6 h-6" />,
                color: 'from-red-500 to-rose-500',
                message: '"BPA free baby bottle 250ml" dropped from #8 → #19. Competitor updated primary image 4 days ago higher CTR likely. Suggested fix: A/B test infographic main image.',
              },
            ].map((alert, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className={`bg-gradient-to-r ${alert.color} p-4 flex items-center gap-3`}>
                  <div className="w-8 h-8 bg-background opacity-100 rounded-lg flex items-center justify-center text-white shrink-0">{alert.icon}</div>
                  <span className="font-bold text-white text-sm leading-relaxed">WhatsApp Alert {alert.type}</span>
                </div>
                <div className="p-5">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center text-gray-900 dark:text-white leading-relaxed">
            FAQs Insydz vs Viral Launch
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4 leading-relaxed">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5 leading-relaxed">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white leading-relaxed">Compare Clearly. Choose What Fits.</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Start with the free plan no credit card, no 14-day expiry. See Insydz vs Viral Launch on your own products, with your own data, before spending a rupee.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icp: 'New Seller', headline: 'Just starting on Amazon India or Flipkart', cta: 'Start Free →', action: () => router.push('/signup') },
              { icp: 'Growing Seller', headline: 'Scaling to ₹5L+ monthly on Indian marketplaces', cta: 'Try Growth Plan →', action: () => router.push('/pricing') },
              { icp: 'Agency', headline: 'Managing multiple seller accounts across platforms', cta: 'Book Demo →', action: () => router.push('/about/contact-us') },
            ].map((card, i) => (
              <div key={i} className="bg-background opacity-100 backdrop-blur rounded-2xl p-6 text-white border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 leading-relaxed">{card.icp}</p>
                <p className="text-sm mb-4 text-white/90 leading-relaxed">{card.headline}</p>
                 {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center leading-relaxed">{card.cta}</Link>
                ) : card.cta === "Book Demo →" ? (
                  <Link href="/about/contact-us" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center leading-relaxed">{card.cta}</Link>
                ) : (
                  <a href="/signup" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center leading-relaxed">{card.cta}</a>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-700 font-bold px-12 py-6 rounded-full shadow-2xl group leading-relaxed">
            Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
}
