"use client";

import React, { useState, useEffect } from "react";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Crown,
  Zap,
  Building2,
  Loader2,
  AlertCircle,
  Sparkles,
  Infinity as InfinityIcon,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PaymentModal, { type PaymentPlan } from "@/components/payment/payment-modal";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

const API_BASE = API_BASE_URL;

interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  oldPrice?: number;
  description: string;
  features: (string | { title: string; detail: string })[];
  limitations: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
}

interface BillingPreview {
  scenario: string; // already_active | upgrade_full | upgrade_prorated | new_subscription
  charge: number;
  full_price: number;
  explanation: string;
  requires_payment: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Basic Explorer Dashboard for Flipkart and Amazon",
      "Explore Categories",
      "Best Sellers",
      "Niche Finder - 3 uses/month + limited data",
      "Top Competitors Score - 1 use/month",
      "Product Ideas - 1 use/month",
      "Best Price Finder - Calculator tab only",
      "Amazon Seller Integration",
      "Amazon Ads Integration",
      "View Campaigns, Orders and Revenue",
    ],
    limitations: [
      "Keyword Research",
      "AI Advisor",
      "Original Profit and Margins",
      "Restock Planner",
      "Review Automator",
      "Refund Finder",
      "Amazon Ads Automation",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 499,

    description: "Essential insights for budding sellers",
    icon: <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    features: [
      "Basic Explorer Dashboard for Flipkart and Amazon",
      "Explore Categories",
      "Best Sellers",
      "Niche Finder - 5 uses/month + full data",
      "Top Competitors Score - 5 uses/month",
      "Product Ideas - 5 uses/month",
      "Best Price Finder - Calculator tab + Cost Waterfall",
      "Keyword Research - 1 use/month",
      "AI Advisor - 5 uses/month",
      "Amazon Seller Integration",
      "Amazon Ads Integration",
      "View Campaigns, Orders and Revenue",
    ],
    limitations: [
      "Original Profit and Margins",
      "Restock Planner",
      "Review Automator",
      "Refund Finder",
      "Amazon Ads Automation",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    oldPrice: 3999,
    description: "Ideal for growing businesses",
    icon: <Crown className="h-6 w-6" />,
    isPopular: true,
    features: [
      "Basic Explorer Dashboard for Flipkart and Amazon",
      "Explore Categories",
      "Best Sellers",
      "Niche Finder - 20 uses/month + full data",
      "Top Competitors Score - 10 uses/month",
      "Product Ideas - 20 uses/month",
      "Best Price Finder - Calculator tab + Cost Waterfall",
      "Keyword Research - 2 uses/month",
      "AI Advisor - 20 uses/month",
      "Amazon Seller Integration",
      "Amazon Ads Integration",
      "View Campaigns, Orders and Revenue",
    ],
    limitations: [
      "Original Profit and Margins",
      "Restock Planner",
      "Review Automator",
      "Refund Finder",
      "Amazon Ads Automation",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2999,
    oldPrice: 7999,
    description: "For serious e-commerce professionals",
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    features: [
      "Basic Explorer Dashboard for Flipkart and Amazon",
      "Explore Categories",
      "Best Sellers",
      "Niche Finder - Unlimited uses/month + full data",
      "Top Competitors Score - Unlimited uses/month",
      "Product Ideas - Unlimited uses/month",
      "Best Price Finder - Calculator tab + Cost Waterfall + Scenarios + AI",
      "Keyword Research - 20 uses/month",
      "AI Advisor - Unlimited uses/month",
      "Amazon Seller Integration",
      "Amazon Ads Integration",
      "View Campaigns, Orders and Revenue",
      "Original Profit and Margins",
      "Restock Planner",
      "Review Automator",
      "Refund Finder",
      "Amazon Ads - Bid Automation, Campaign Scheduling, Auto-Boost Winning Placements, Auto-Negate Bleeding Search Terms, Smart Budget Scaling",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Tailored solutions for businesses",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    features: [
      "All Premium features",
      "White-label options",
      "Premium support",
      "Custom integrations",
    ],
    limitations: [],
  },
];

const TRUST_ITEMS = [
  {
    icon: <Zap className="h-5 w-5 text-sky-500" />,
    label: "Instant Activation",
    desc: "Plan changes take effect immediately",
  },
  {
    icon: <Check className="h-5 w-5 text-green-500" />,
    label: "Secure Payments",
    desc: "256-bit SSL secured by Razorpay",
  },
  {
    icon: <InfinityIcon className="h-5 w-5 text-purple-500" />,
    label: "Unlimited Scale",
    desc: "Premium plan grows with your business",
  },
  {
    icon: <Shield className="h-5 w-5 text-amber-500" />,
    label: "Priority Support",
    desc: "Dedicated help on Basic+ plans",
  },
];

const FAQ = [
  {
    q: "Can I upgrade my plan anytime?",
    a: "Yes, you can upgrade at any time. If you're past the halfway mark of your billing cycle, you'll receive a prorated credit toward the new plan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, UPI, and bank transfers for Indian customers via Razorpay.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade encryption and secure servers for all customer data.",
  },
  {
    q: "How does plan upgrading work?",
    a: "Upgrades are instant. If you upgrade mid-cycle, you only pay a prorated amount based on your remaining days.",
  },
];

const PLAN_STYLES: Record<
  string,
  { iconBg: string; ring: string; upgradeBtn: string; discountBadge: string }
> = {
  free: {
    iconBg: "bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300",
    ring: "",
    upgradeBtn: "bg-slate-500 hover:bg-slate-600 text-white",
    discountBadge: "bg-slate-500",
  },
  starter: {
    iconBg: "bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400",
    ring: "",
    upgradeBtn:
      "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-200 dark:shadow-none",
    discountBadge: "bg-emerald-600",
  },
  basic: {
    iconBg: "bg-sky-100 dark:bg-sky-950/45 text-sky-700 dark:text-sky-450",
    ring: "ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900",
    upgradeBtn:
      "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-sky-200 dark:shadow-none",
    discountBadge: "bg-sky-600",
  },
  premium: {
    iconBg: "bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400",
    ring: "",
    upgradeBtn:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-200 dark:shadow-none",
    discountBadge: "bg-amber-500",
  },
  enterprise: {
    iconBg: "bg-indigo-100 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400",
    ring: "",
    upgradeBtn:
      "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-indigo-200 dark:shadow-none",
    discountBadge: "bg-indigo-600",
  },
};

const PLAN_ORDER = ["free", "starter", "basic", "premium", "enterprise"];

export default function Subscription() {
  const { t } = useTranslation();
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { currentTier } = useSubscriptionLimits();
  const { getAIUsage } = useSubscriptionSync();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === "dark";

  const [selectedPlan, setSelectedPlan] = useState<string>(currentTier);
  const [loading, setLoading] = useState(false);
  const [previewLoadingPlan, setPreviewLoadingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Card expand/collapse states
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const allExpanded = SUBSCRIPTION_PLANS.every((p) => expandedCards[p.id]);

  const toggleCardExpanded = (planId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const toggleAllCards = () => {
    const next = !allExpanded;
    const newState: Record<string, boolean> = {};
    SUBSCRIPTION_PLANS.forEach((p) => {
      newState[p.id] = next;
    });
    setExpandedCards(newState);
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/api/payments/cancel-subscription`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to cancel subscription");

      setSuccess(
        data.message || "Subscription auto-renewal cancelled successfully. It will not auto-renew."
      );
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, month: "" });
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);

  useEffect(() => {
    setMounted(true);
    setSelectedPlan(currentTier);
    if (user) {
      getAIUsage().then(setAiUsage).catch(console.error);
    }
  }, [currentTier, user]);

  const handleUpgrade = async (planId: string) => {
    setError(null);
    setSuccess(null);

    if (!user?.id) {
      setError("Please login to change your subscription.");
      return;
    }
    if (planId === currentTier) {
      setError("You are already on this plan.");
      return;
    }
    if (planId === "enterprise") {
      window.location.href = "mailto:support@insydz.com";
      return;
    }

    // Fetch billing preview
    setPreviewLoadingPlan(planId);
    let preview: BillingPreview;
    try {
      const res = await fetch(
        `${API_BASE}/api/payments/billing-preview/${user.id}/${planId}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(sanitizeApiError(d.detail, "Failed to load billing info."));
      }
      preview = await res.json();
    } catch (err) {
      setError(
        err instanceof Error
          ? sanitizeApiError(err.message, "Billing details unavailable. Please refresh.")
          : "Billing details unavailable. Please refresh."
      );
      setPreviewLoadingPlan(null);
      return;
    } finally {
      setPreviewLoadingPlan(null);
    }

    if (preview.scenario === "already_active") {
      setError(`You already have an active ${planId} plan.`);
      return;
    }

    if (preview.requires_payment) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) return;
      setPaymentPlan({
        id: plan.id,
        name: plan.name,
        price: preview.charge, // prorated amount, not list price
        description: plan.description,
        priceNote: preview.explanation, // shown in PriceCard
      });
    }
  };

  const handlePaymentSuccess = async (planId: string) => {
    try {
      await refreshUser();
      const newUsage = await getAIUsage();
      setAiUsage(newUsage);
      setSelectedPlan(planId);
      setSuccess(`🎉 Successfully upgraded to ${planId.toUpperCase()} plan! Your new limits are now active.`);
    } catch (err) {
      console.error("Post-payment refresh failed:", err);
    }
    setPaymentPlan(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div
            className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-600
                          animate-spin mx-auto"
          />
          <p className="text-slate-600 font-medium">
            {t("subscription.loadingPlans", "Loading subscription plans...")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle>{t("subscription.authRequired", "Authentication Required")}</CardTitle>
            <CardDescription>
              {t("subscription.loginToView", "Please login to view subscription plans")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold"
            >
              {t("subscription.goToLogin", "Go to Login")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRank = PLAN_ORDER.indexOf(currentTier);
  const isUpgradeable = (planId: string) => PLAN_ORDER.indexOf(planId) > currentRank;

  // Reusable CTA button renderer
  const renderPlanCTA = (plan: SubscriptionPlan) => {
    const isCurrentPlan = plan.id === currentTier;
    const canUpgrade = isUpgradeable(plan.id);
    const isThisLoading = previewLoadingPlan === plan.id;
    const styles = PLAN_STYLES[plan.id] || PLAN_STYLES.free;

    if (isCurrentPlan) {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <Button
            disabled
            className="w-full h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-400 font-bold text-xs cursor-not-allowed opacity-100 shadow-none"
          >
            <Check className="h-3.5 w-3.5 mr-1.5 stroke-[2.5]" />
            {t("subscription.currentPlan", "Current Plan")}
          </Button>
          <div className="min-h-[26px] flex items-center justify-center">
            {plan.id !== "free" &&
              (user?.hasAutoRenew !== false ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancelling}
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 mx-auto w-fit h-7 px-2"
                    >
                      {cancelling ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Cancel Auto Renewal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Auto Renewal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your auto-renewing subscription? Your current premium
                        access will continue until the end of your billing cycle. No refund will be issued.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={cancelSubscription}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Auto-Renewal: Off
                </span>
              ))}
          </div>
        </div>
      );
    }

    if (plan.id === "enterprise") {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs transition-colors"
            onClick={() => (window.location.href = "mailto:support@insydz.com")}
          >
            {t("subscription.contactSales", "Contact Sales")}
          </Button>
          <div className="min-h-[26px]" />
        </div>
      );
    }

    if (canUpgrade) {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <Button
            className={cn(
              "w-full h-11 rounded-xl font-bold text-xs shadow-md transition-all duration-200",
              styles.upgradeBtn
            )}
            onClick={() => handleUpgrade(plan.id)}
            disabled={loading || previewLoadingPlan !== null}
          >
            {isThisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {t("subscription.upgradeTo", "Upgrade to")} {plan.name}
              </>
            )}
          </Button>
          <div className="min-h-[26px]" />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {t("subscription.lowerThanCurrent", "Lower tier")}
          </span>
        </div>
        <div className="min-h-[26px]" />
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mx-auto max-w-4xl rounded-2xl border-rose-200 bg-rose-50">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <AlertDescription className="text-rose-700">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mx-auto max-w-4xl rounded-2xl bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-left space-y-1">
          <h1 className="page-title">{t("subscription.title", "My Plan")}</h1>
          <p className="page-subtitle">
            {t(
              "subscription.subtitle",
              "Unlock the full potential of AI-powered analytics. Pick the plan that fits your growth."
            )}
          </p>
        </div>

        {/* Quick expand/collapse button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllCards}
          className="h-9 px-3 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
        >
          {allExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
              <span>{t("subscription.collapseAll", "Collapse Details")}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              <span>{t("subscription.expandAll", "Expand All Details")}</span>
            </>
          )}
        </Button>
      </div>

      {/* PLAN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-[94rem] mx-auto items-stretch pt-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentTier;
          const styles = PLAN_STYLES[plan.id] || PLAN_STYLES.free;
          const isExpanded = expandedCards[plan.id] ?? false;

          const INITIAL_VISIBLE_COUNT = 5;
          const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, INITIAL_VISIBLE_COUNT);
          const remainingFeaturesCount = Math.max(0, plan.features.length - INITIAL_VISIBLE_COUNT);
          const hiddenItemsCount = remainingFeaturesCount + plan.limitations.length;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 shadow-md border rounded-3xl",
                styles.ring,
                isCurrentPlan
                  ? "bg-sky-50/70 border-sky-300 dark:bg-sky-950/20 dark:border-sky-850"
                  : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              )}
            >
              {/* Symmetrically Centered Top Badge */}
              {isCurrentPlan ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                  <Badge className="bg-emerald-600 text-white px-3.5 py-1 shadow-md rounded-full flex items-center gap-1.5 text-xs font-bold ring-2 ring-emerald-200 dark:ring-emerald-900">
                    <Check className="h-3 w-3 stroke-[2.5]" /> {t("subscription.current", "Current Plan")}
                  </Badge>
                </div>
              ) : plan.isPopular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3.5 py-1 shadow-md rounded-full flex items-center gap-1.5 text-xs font-bold ring-2 ring-sky-200 dark:ring-sky-900">
                    <Sparkles className="h-3 w-3" /> {t("subscription.mostPopular", "Most Popular")}
                  </Badge>
                </div>
              ) : null}

              <CardHeader className="text-center pb-3 pt-7">
                <div className="flex justify-center mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
                    {plan.icon}
                  </div>
                </div>

                <CardTitle className={cn("text-xl mb-1 font-extrabold", isDark ? "text-slate-100" : "text-slate-900")}>
                  {plan.name}
                </CardTitle>

                <div className="h-9 flex items-baseline justify-center gap-1.5 mt-1.5 mb-1">
                  {plan.id !== "enterprise" ? (
                    <>
                      <span className={cn("text-3xl font-extrabold", isDark ? "text-[#AAF0FF]" : "text-sky-900")}>
                        {plan.price === 0 ? t("subscription.free", "Free") : `₹${plan.price!.toLocaleString("en-IN")}`}
                      </span>
                      {plan.price !== 0 && (
                        <span className={cn("text-xs font-normal self-end pb-0.5", isDark ? "text-slate-500" : "text-slate-400")}>
                          {t("subscription.month", "/month")}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={cn("text-xl font-extrabold self-center", isDark ? "text-indigo-400" : "text-indigo-700")}>
                      {t("subscription.customPricing", "Custom Pricing")}
                    </span>
                  )}
                </div>

                <div className="h-10 flex items-center justify-center">
                  <CardDescription className={cn("text-xs line-clamp-2 text-center", isDark ? "text-slate-400" : "text-slate-500")}>
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex flex-col flex-1 pb-6 pt-1">
                {/* Features & Limitations */}
                <div className="space-y-2 flex-1 flex flex-col">
                  {visibleFeatures.map((feature, index) => {
                    const isObj = typeof feature === "object";
                    const title = isObj ? feature.title : (feature as string);
                    const detail = isObj ? feature.detail : null;

                    return (
                      <div key={index} className="flex items-start gap-2 w-full">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        </div>
                        {detail ? (
                          <details className="group cursor-pointer flex-1">
                            <summary className="list-none outline-none text-xs border-b border-dashed border-slate-300 dark:border-slate-600 pb-0.5 w-fit font-medium">
                              <span className={cn(isDark ? "text-slate-300" : "text-slate-700")}>{title}</span>
                            </summary>
                            <div className="pt-1.5 pb-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pr-2">
                              {detail}
                            </div>
                          </details>
                        ) : (
                          <span className={cn("text-xs leading-snug font-medium", isDark ? "text-slate-300" : "text-slate-700")}>
                            {title}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Limitations (shown when card is expanded) */}
                  {isExpanded &&
                    plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2 opacity-50">
                        <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <span className={cn("text-xs leading-snug line-through", isDark ? "text-slate-400" : "text-slate-500")}>
                          {limitation}
                        </span>
                      </div>
                    ))}

                  {/* Interactive inline toggle button */}
                  {hiddenItemsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleCardExpanded(plan.id)}
                      className={cn(
                        "w-full py-1.5 px-2.5 rounded-xl border border-dashed transition-all duration-200 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2",
                        isExpanded
                          ? "border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                          : "border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 text-sky-700 dark:text-sky-350 hover:bg-sky-100/70 dark:hover:bg-sky-900/50"
                      )}
                    >
                      <span>
                        {isExpanded
                          ? t("subscription.showLess", "Show less")
                          : t("subscription.showMoreFeatures", `+ ${hiddenItemsCount} more features & limits`)}
                      </span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>

                {/* CTA button */}
                <div className="pt-2 mt-auto">{renderPlanCTA(plan)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-4 max-w-4xl mx-auto">
        <h3 className={cn("text-xl font-extrabold mb-6 text-center", isDark ? "text-slate-100" : "text-slate-900")}>
          {t("subscription.faq", "Frequently Asked Questions")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow",
                isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100"
              )}
            >
              <h4 className={cn("font-bold mb-2 text-sm", isDark ? "text-slate-200" : "text-slate-800")}>{item.q}</h4>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentPlan && (
        <PaymentModal
          isOpen={!!paymentPlan}
          onClose={() => setPaymentPlan(null)}
          plan={paymentPlan}
          userId={user.id}
          userEmail={user.email}
          userName={user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : ""}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
