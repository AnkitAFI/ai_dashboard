"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import Link from "next/link";
import { useRouter } from "next/navigation";
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


export const dynamic = "force-static";




// Navigation Menu Data
type MenuItemWithBadge = {
  name: string;
  icon: JSX.Element;
  badge?: string;
  route?: string;
};

type NavigationMenu = {
  Solutions: MenuItemWithBadge[];
  "Use Cases": MenuItemWithBadge[];
  Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[];
  Resources: MenuItemWithBadge[];
  Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[];
  About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <TrendingDown className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Mail className="w-4 h-4" />, route: "/about/contact-us" },
  ],

};

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

export default function Pricing() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
	

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      

      {/* Hero Section */}
      <section className="pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 text-center bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Simple Pricing.
            <br />
            <span className="text-orange-600">Pay Only When You See Value.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Start free. Upgrade only when Insydz actually helps you make better decisions and more profit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all w-full sm:w-auto inline-flex items-center justify-center">
              Start Free (No Credit Card)
              <ArrowRight className="ml-2" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-6 text-lg rounded-full w-full sm:w-auto hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Compare Plans →
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <span>Built for Indian sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">₹</span>
              <span>₹ pricing, not dollars</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Philosophy */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Why Insydz Pricing Is Different
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12">
            Most seller tools lock features behind expensive plans before you see value.
            <br className="hidden sm:block" />
            <span className="font-semibold text-slate-900 dark:text-white">Insydz works the opposite way.</span>
          </p>

          {/* Flow Diagram */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-green-200 dark:border-green-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">🆓</div>
              <div className="font-bold text-slate-900 dark:text-white">See real insights first</div>
            </div>
            <div className="text-2xl text-slate-400 rotate-90 sm:rotate-0">→</div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">💡</div>
              <div className="font-bold text-slate-900 dark:text-white">Value becomes clear</div>
            </div>
            <div className="text-2xl text-slate-400 rotate-90 sm:rotate-0">→</div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-orange-200 dark:border-orange-700 w-full sm:w-auto">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-bold text-slate-900 dark:text-white">Upgrade when ready</div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-green-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">See real insights first</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Start tracking immediately with our free plan</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-blue-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">Upgrade only when it helps</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pay only when you see business value</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Check className="h-8 w-8 text-orange-600 mb-3" />
              <div className="font-semibold text-slate-900 dark:text-white mb-2">No forced annual contracts</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Monthly billing, cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="plans" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Choose a Plan That Fits Your Selling Stage
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">Monthly pricing • No hidden fees • Cancel anytime</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = false;
              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl shadow-md border rounded-2xl ${
                    plan.isPopular ? "ring-2 ring-orange-500 ring-offset-2" : "border-slate-200 dark:border-gray-700"
                  } ${isCurrentPlan ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700" : "bg-white dark:bg-gray-900"}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 shadow-lg rounded-full">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-600 text-white px-3 py-1 shadow-lg rounded-full">
                        Current
                      </Badge>
                    </div>
                  )}

                  {plan.badge && !isCurrentPlan && !plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-slate-700 text-white px-3 py-1 text-xs whitespace-nowrap">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrentPlan ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-slate-100 dark:bg-gray-800'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {plan.name}
                    </CardTitle>

                    {plan.price !== undefined ? (
                      <div className="mb-2">
                        {plan.oldPrice && (
                          <div className="text-gray-400 text-lg line-through mb-1">
                            ₹{plan.oldPrice}
                          </div>
                        )}
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">
                          ₹{plan.price}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {plan.description}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                          Custom
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {plan.description}
                        </div>
                      </div>
                    )}

                    <CardDescription className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {plan.bestFor}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                      ))}

                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2 opacity-50">
                          <X className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-500 dark:text-slate-400 line-through">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
  {plan.id === "enterprise" ? (
    <Button
      variant="outline"
      className="w-full border-2 hover:bg-slate-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
      onClick={() => window.location.href = "mailto:sales@insydz.com?subject=Enterprise Plan Inquiry"}
    >
      Book a Demo
    </Button>
  ) : (
    <Link href="/login" className={`w-full inline-block text-center py-2 px-4 rounded-md font-medium ${
      plan.id === "free"
        ? "bg-slate-600 hover:bg-slate-700 text-white"
        : "bg-orange-600 hover:bg-orange-700 text-white"
    }`}>
      {plan.id === "free" ? "Start Free" : "Get Started"}
    </Link>
  )}
</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Reassurance */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8">
            Most Sellers Upgrade Only After Seeing This
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">🚨</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First competitor price alert</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">See when competitors undercut you</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">📉</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First keyword ranking drop</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Catch visibility issues early</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="text-3xl mb-3">⭐</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">First review insight</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Understand rating patterns</div>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 italic">
            That's when pricing stops feeling expensive.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Why Sellers Switch to Insydz
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-slate-600 dark:text-slate-400 font-semibold">Typical Seller Tools</th>
                  <th className="text-center py-4 px-4 text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/20">Insydz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Pricing</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">$39–99/month</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400 text-sm line-through">₹3,999–₹7,999</span>
                      <span>₹1999–₹2,999/month</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Free Access</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Limited trial</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">Free forever plan</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Product Tracking</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">10-50 products</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">25-Unlimited products</td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-gray-800">
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">AI Features</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Not available</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">AI chat & summaries</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">Support</td>
                  <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">Email only</td>
                  <td className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20">Email + Priority support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Pricing FAQs
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">Everything you need to know</p>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Start Free.
            <br />
            Upgrade Only When Insydz Helps You Win.
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90">
            No credit card required. No risk. Just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="bg-white text-orange-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-full shadow-2xl w-full sm:w-auto font-bold inline-flex items-center justify-center">
              Start Free Now
              <ArrowRight className="ml-2" />
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-background opacity-100 px-8 py-6 text-lg rounded-full w-full sm:w-auto"
              onClick={() => window.location.href = "mailto:sales@insydz.com"}
            >
              Talk to Sales →
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-6 px-4 text-center text-sm text-slate-500 dark:text-slate-500 bg-white dark:bg-gray-950 border-t dark:border-gray-800">
        <p>Built for Indian sellers 🇮🇳 • ₹ pricing • Cancel anytime</p>
      </div>

      
      {/* Footer */}
      
 
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
 

