"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChartLine, Globe, Shield, Users, Zap, Target, Award, ExternalLink, MessageCircle, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    title: "AI-Powered Analytics",
    description:
      "Our advanced machine learning algorithms analyze millions of data points to provide actionable insights for your e-commerce business.",
  },
  {
    icon: <ChartLine className="h-6 w-6 text-green-600 dark:text-emerald-450" />,
    title: "Real-Time Insights",
    description:
      "Get instant updates on market trends, competitor pricing, and product performance to make informed decisions faster.",
  },
  {
    icon: <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
    title: "Multi-Platform Support",
    description:
      "Aggregate data from all major e-commerce platforms including Amazon, Flipkart, and Shopify for comprehensive market analysis.",
  },
  {
    icon: <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
    title: "Secure & Private",
    description:
      "Your business data is protected with enterprise-grade security and encrypted storage. We never share your information with third parties.",
  },
];

const STATS = [
  { label: "Active Sellers", value: "Growing", icon: <Users className="h-5 w-5" /> },
  { label: "Products Tracked", value: "4000+", icon: <Target className="h-5 w-5" /> },
  { label: "Market", value: "India", icon: <Globe className="h-5 w-5" /> },
  { label: "Focus", value: "Data-Driven", icon: <Award className="h-5 w-5" /> },
];

const TEAM_VALUES = [
  {
    title: "Innovation",
    description: "We constantly push the boundaries of what's possible with AI and data analytics.",
    icon: <Zap className="h-8 w-8 text-yellow-500 dark:text-amber-400" />,
  },
  {
    title: "Transparency",
    description: "We believe in clear, honest communication and transparent business practices.",
    icon: <Shield className="h-8 w-8 text-blue-500 dark:text-blue-450" />,
  },
  {
    title: "Customer Success",
    description: "Your success is our success. We're dedicated to helping you achieve your business goals.",
    icon: <Target className="h-8 w-8 text-green-500 dark:text-emerald-450" />,
  },
];

const QUICK_LINKS = [
  {
    label: "Expert Blog",
    description: "Learn e-commerce strategies and tips",
    href: "/resources/expert-blog",
    icon: <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
  },
  {
    label: "Contact Support",
    description: "Get help from our team",
    href: "/about/contact-us",
    icon: <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    label: "Our Vision",
    description: "Learn what drives us forward",
    href: "/about/our-vision",
    icon: <FileText className="h-5 w-5 text-green-600 dark:text-emerald-400" />,
  },
];

export default function DashboardAboutPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration warnings by returning a dummy layout or standard light layout on server/pre-mount
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="space-y-8 py-6">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00C6FF]/20 to-[#0072FF]/20 rounded-2xl mb-2 shadow-sm mx-auto border border-white/40 dark:border-slate-800">
          <Brain className="h-10 w-10 text-[#0072FF] dark:text-sky-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#003366] dark:text-slate-100">About Insydz</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We're democratizing e-commerce intelligence by making advanced analytics and AI-powered insights accessible to businesses of all sizes.
        </p>
      </div>

      {/* Mission */}
      <Card className="bg-gradient-to-r from-[#00C6FF]/10 to-[#0072FF]/10 dark:from-[#00C6FF]/5 dark:to-[#0072FF]/5 border border-[#00C6FF]/20 dark:border-slate-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-3 text-[#003366] dark:text-slate-100">Our Mission</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            To democratize e-commerce intelligence by making advanced analytics and AI-powered insights accessible to businesses of all sizes, helping them compete and thrive in the digital marketplace.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-[#003366] dark:text-slate-100 mb-5">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="h-full shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/70 dark:bg-slate-900/60 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <CardTitle className="text-base font-semibold text-[#003366] dark:text-slate-200">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-bold text-[#003366] dark:text-slate-100 mb-5">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <Card key={index} className="text-center p-4 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/70 dark:bg-slate-900/60">
              <div className="flex justify-center mb-2">
                <div className="w-9 h-9 bg-[#00C6FF]/10 dark:bg-[#00C6FF]/5 rounded-lg flex items-center justify-center text-[#0072FF] dark:text-sky-400">
                  {stat.icon}
                </div>
              </div>
              <div className="text-lg font-bold text-[#0072FF] dark:text-sky-400 mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-xl font-bold text-[#003366] dark:text-slate-100 mb-5">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEAM_VALUES.map((value, index) => (
            <Card key={index} className="text-center p-5 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/70 dark:bg-slate-900/60 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">{value.icon}</div>
              <h3 className="text-base font-semibold text-[#003366] dark:text-slate-200 mb-2">{value.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card className="bg-slate-50/80 dark:bg-slate-900/60 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold text-[#003366] dark:text-slate-100 mb-3">Get in Touch</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Have questions about Insydz? We'd love to hear from you and help you succeed in your e-commerce journey.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
            <p>
              <strong className="text-slate-700 dark:text-slate-300">Email: </strong>
              <a href="mailto:contact@insydz.com" className="text-blue-600 dark:text-sky-400 hover:underline">
                contact@insydz.com
              </a>
            </p>
            <p>
              <strong className="text-slate-700 dark:text-slate-300">Support: </strong>
              <a href="mailto:support@insydz.com" className="text-blue-600 dark:text-sky-400 hover:underline">
                support@insydz.com
              </a>
            </p>
            <p>
              <strong className="text-slate-700 dark:text-slate-300">Phone: </strong>
              <a href="tel:+911234567890" className="text-blue-600 dark:text-sky-400 hover:underline">
                +91 (0) 123 456 7890
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
