"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, X, Loader2, AlertCircle, Crown, Zap, Building2, ArrowRight,
  Menu, X as XIcon, Sun, Moon, ChevronDown, ShoppingBag, Store,
  Briefcase, Users, Target, Package, BarChart3, MessageCircle,
  Bell, Search, TrendingDown, TrendingUp, Code, Globe, Trophy,
  ArrowLeft, BookOpen, Video, FileText, Flame, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useRouter } from "next/navigation";


interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  oldPrice?: number;
  description: string;
  bestFor: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  isPopular?: boolean;
  badge?: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Forever",
    bestFor: "New & growing sellers exploring insights",
    badge: "No Credit Card Required",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Basic dashboard access",
      "25 product tracking",
      "Top 5 products filter",
      "5 AI chat messages/month",
      "5 notifications",
      "Weekly reports",
    ],
    limitations: [
      "AI Chart Summaries",
      "Advanced analytics",
      "Real-time data",
      "Premium AI features",
      "Priority support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    oldPrice: 3999,
    description: "per month",
    bestFor: "Solo sellers getting serious",
    isPopular: true,
    icon: <Crown className="h-6 w-6" />,
    features: [
      "All Free features",
      "500 product tracking",
      "Top 20 products filter",
      "20 AI chat messages/month",
      "15 notifications",
      "AI Chart Summaries",
      "Daily reports",
      "Basic competitor alerts",
      "Email support",
    ],
    limitations: [
      "Real-time alerts",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2999,
    oldPrice: 7999,
    description: "per month",
    bestFor: "Full-time Amazon & Flipkart sellers",
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    features: [
      "All Basic features",
      "Unlimited product tracking",
      "Top 100 products filter",
      "Unlimited AI chat",
      "Unlimited notifications",
      "Advanced AI chatbot",
      "Real-time data & alerts",
      "Priority support",
      "Advanced analytics",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom pricing",
    bestFor: "Tailored solutions for large businesses",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    features: [
      "All Premium features",
      "White-label options",
      "24/7 premium support",
      "Dedicated account manager",
      "Custom integrations",
    ],
    limitations: [],
  },
];

const FAQS = [
  {
    question: "Is the free plan really free forever?",
    answer: "Yes! Our free plan is completely free forever. No credit card required, no hidden charges. Start tracking your products and competitors right away, and upgrade only when you see real value.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "Absolutely not. You can start with our free plan without entering any payment information. Just sign up and start exploring Insydz immediately.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you have complete flexibility. Upgrade when you need more features, downgrade if you need to scale back. No long-term contracts, no penalties. Your data and settings remain safe.",
  },
  {
    question: "Is pricing different for Amazon / Flipkart sellers?",
    answer: "No, our pricing is the same for all marketplaces. Whether you sell on Amazon, Flipkart, you get the same great value and features at the same price.",
  },
  {
    question: "Are there any hidden charges?",
    answer: "None whatsoever. The price you see is exactly what you pay. No setup fees, no extra charges, no surprises. We believe in transparent, honest pricing.",
  },
  {
    question: "Can agencies manage multiple clients?",
    answer: "Yes! Our Professional and Enterprise plans are designed for agencies. You can manage multiple brands, give team access, and even get white-label options on the Enterprise plan.",
  },
];


export default function PricingContent() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}

      {/* Hero Section */}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-red-200/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-4 border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-4 py-1">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
            Choose the plan that fits your <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">growth journey</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            From solo sellers to large enterprises, our tools are built to help you scale your Amazon and Flipkart business with confidence.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.isPopular 
                  ? 'border-orange-500 scale-105 shadow-xl shadow-orange-500/10' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-orange-200'
              }`}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  plan.isPopular ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline justify-center">
                  {plan.price !== undefined ? (
                    <>
                      <span className="text-4xl font-extrabold tracking-tight">₹{plan.price.toLocaleString()}</span>
                      <span className="ml-1 text-slate-500 font-medium">/{plan.id === 'free' ? 'forever' : 'mo'}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Contact Us</span>
                  )}
                </div>
                {plan.oldPrice && (
                  <div className="text-slate-400 line-through text-sm font-medium">₹{plan.oldPrice.toLocaleString()}</div>
                )}
                {plan.badge && (
                  <div className="mt-2 text-xs font-bold text-orange-600 uppercase tracking-wider">{plan.badge}</div>
                )}
                <CardDescription className="mt-4 min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="mb-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Best For</div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{plan.bestFor}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">What's Included</div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start opacity-40">
                      <X className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-slate-400 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <Button 
                    className={`w-full h-12 rounded-xl font-bold text-base transition-all ${
                      plan.isPopular 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                    }`}
                    onClick={() => router.push("/login")}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Detailed breakdown of what you get with each plan.</p>
        </div>

        <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-gray-900/50 w-1/3">Feature</th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="p-6 text-center text-sm font-bold uppercase tracking-widest">
                      <span className={plan.isPopular ? 'text-orange-600' : ''}>{plan.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-6 text-sm font-medium">Product Tracking</td>
                  <td className="p-6 text-center text-sm">25</td>
                  <td className="p-6 text-center text-sm">500</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Unlimited</td>
                  <td className="p-6 text-center text-sm">Custom</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">AI Chat Support</td>
                  <td className="p-6 text-center text-sm">5/mo</td>
                  <td className="p-6 text-center text-sm">20/mo</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Unlimited</td>
                  <td className="p-6 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">Marketplace Data</td>
                  <td className="p-6 text-center text-sm text-slate-400 italic">Delayed</td>
                  <td className="p-6 text-center text-sm">Daily</td>
                  <td className="p-6 text-center text-sm font-bold text-orange-600">Real-time</td>
                  <td className="p-6 text-center text-sm">Real-time</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">Email Alerts</td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-medium">WhatsApp Alerts</td>
                  <td className="p-6 text-center"><X className="h-5 w-5 text-slate-300 mx-auto" /></td>
                  <td className="p-6 text-center"><X className="h-5 w-5 text-slate-300 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about our pricing and plans.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-slate-200 dark:border-slate-800">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-orange-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-red-500 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8">Ready to grow your e-commerce business?</h2>
          <p className="text-xl mb-12 text-orange-50 font-medium opacity-90">
            Join 5,000+ sellers who are making data-driven decisions with Insydz. <br className="hidden md:block" />
            No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-6 rounded-2xl text-lg shadow-2xl"
              onClick={() => router.push("/login")}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-6 rounded-2xl text-lg"
              onClick={() => router.push("/about/contact-us")}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
