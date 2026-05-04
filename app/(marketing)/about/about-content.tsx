"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChartLine, Globe, Shield, Users, Zap, Target, Award } from "lucide-react";

const FEATURES = [
  {
    icon: <Brain className="h-6 w-6 text-blue-600" />,
    title: "AI-Powered Analytics",
    description:
      "Our advanced machine learning algorithms analyze millions of data points to provide actionable insights for your e-commerce business.",
  },
  {
    icon: <ChartLine className="h-6 w-6 text-green-600" />,
    title: "Real-Time Insights",
    description:
      "Get instant updates on market trends, competitor pricing, and product performance to make informed decisions faster.",
  },
  {
    icon: <Globe className="h-6 w-6 text-purple-600" />,
    title: "Multi-Platform Support",
    description:
      "Aggregate data from all major e-commerce platforms including Amazon, Flipkart, and Shopify for comprehensive market analysis.",
  },
  {
    icon: <Shield className="h-6 w-6 text-orange-600" />,
    title: "Secure & Private",
    description:
      "Your business data is protected with enterprise-grade security and encrypted storage. We never share your information with third parties.",
  },
];

const STATS = [
  { label: "Active Sellers", value: "Growing", icon: <Users className="h-5 w-5" /> },
  { label: "Products Tracked", value: "4000+", icon: <Target className="h-5 w-5" /> },
  { label: "Market", value: "India", icon: <Globe className="h-5 w-5" /> },
  { label: "Focus", value: "Data-Driven Decisions", icon: <Award className="h-5 w-5" /> },
];

const TEAM_VALUES = [
  {
    title: "Innovation",
    description: "We constantly push the boundaries of what's possible with AI and data analytics.",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
  },
  {
    title: "Transparency",
    description: "We believe in clear, honest communication and transparent business practices.",
    icon: <Shield className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Customer Success",
    description: "Your success is our success. We're dedicated to helping you achieve your business goals.",
    icon: <Target className="h-8 w-8 text-green-500" />,
  },
];

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-32">
      <main className="px-4 sm:px-6 flex-1 pb-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-background backdrop-blur-none rounded-2xl mb-4 shadow-sm mx-auto">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-sky-900">About Insydz</h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            We're democratizing e-commerce intelligence by making advanced analytics and AI-powered insights accessible to businesses of all sizes.
          </p>
        </div>

        {/* Mission */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              To democratize e-commerce intelligence by making advanced analytics and AI-powered insights accessible to businesses of all sizes, helping them compete and thrive in the digital marketplace.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="h-full shadow-md border border-slate-200 rounded-2xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <Card key={index} className="text-center p-6 shadow-md border border-slate-200 rounded-2xl">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Values */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM_VALUES.map((value, index) => (
              <Card key={index} className="text-center p-6 shadow-md border border-slate-200 rounded-2xl">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology */}
        <Card className="shadow-md border border-slate-200 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl">Our Technology</CardTitle>
            <CardDescription>
              Built with cutting-edge technologies for reliability and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
              {["AI/ML", "Real-time", "Secure", "Scalable"].map((tech) => (
                <div key={tech}>
                  <Badge variant="secondary" className="mb-2">{tech}</Badge>
                  <p className="text-sm text-slate-600">
                    {tech === "AI/ML"
                      ? "Advanced machine learning algorithms"
                      : tech === "Real-time"
                      ? "Live data processing and analytics"
                      : tech === "Secure"
                      ? "Enterprise-grade security"
                      : "Built to handle millions of products"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-muted/50 shadow-md border border-slate-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-slate-600 mb-6">
              Have questions about Insydz? We'd love to hear from you and help you succeed in your e-commerce journey.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{" "}
                <a 
                  href="mailto:contact@insydz.com" 
                  className="text-blue-600 hover:underline"
                >
                  contact@insydz.com
                </a>
              </p>

              <p>
                <strong>Support:</strong>{" "}
                <a 
                  href="mailto:support@insydz.com" 
                  className="text-blue-600 hover:underline"
                >
                  support@insydz.com
                </a>
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                <a 
                  href="tel:+911234567890" 
                  className="text-blue-600 hover:underline"
                >
                  +91 (0) 123 456 7890
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
