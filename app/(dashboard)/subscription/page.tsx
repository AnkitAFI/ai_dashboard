"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Building2, Loader2, AlertCircle, Sparkles, Infinity as InfinityIcon, Shield, } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentModal, { type PaymentPlan } from "@/components/payment/payment-modal";

const API_BASE = API_BASE_URL;

interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  oldPrice?: number;
  description: string;
  features: string[];
  limitations: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
}

interface BillingPreview {
  scenario: string;   // already_active | upgrade_full | upgrade_prorated | new_subscription
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
      "Basic dashboard access",
      "25 product tracking",
      "Top 5 products filter",
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
    description: "Ideal for growing businesses",
    icon: <Crown className="h-6 w-6" />,
    isPopular: true,
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
    limitations: ["Real-time alerts", "Priority support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2999,
    oldPrice: 7999,
    description: "For serious e-commerce professionals",
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
    description: "Tailored solutions for businesses",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    features: [
      "All Premium features",
      "White-label options",
      "24/7 premium support",
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
    iconBg: "bg-slate-100",
    ring: "",
    upgradeBtn: "bg-slate-500 hover:bg-slate-600 text-white",
    discountBadge: "bg-slate-500",
  },
  basic: {
    iconBg: "bg-sky-100",
    ring: "ring-2 ring-sky-500 ring-offset-2",
    upgradeBtn: "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-sky-200",
    discountBadge: "bg-sky-600",
  },
  premium: {
    iconBg: "bg-amber-100",
    ring: "",
    upgradeBtn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-200",
    discountBadge: "bg-amber-500",
  },
  enterprise: {
    iconBg: "bg-indigo-100",
    ring: "",
    upgradeBtn: "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-indigo-200",
    discountBadge: "bg-indigo-600",
  },
};

const PLAN_ORDER = ["free", "basic", "premium", "enterprise"];

export default function Subscription() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { currentTier } = useSubscriptionLimits();
  const { getAIUsage } = useSubscriptionSync();

  const [selectedPlan, setSelectedPlan] = useState<string>(currentTier);
  const [loading, setLoading] = useState(false);
  const [previewLoadingPlan, setPreviewLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, month: "" });
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);

  useEffect(() => {
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
      alert("Please contact our sales team at sales@insydz.com for Enterprise plan.");
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
        throw new Error(d.detail || "Failed to load billing info.");
      }
      preview = await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing details unavailable. Please refresh.");
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
        price: preview.charge,       // prorated amount, not list price
        description: plan.description,
        priceNote: preview.explanation,  // shown in PriceCard
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
          <div className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-600
                          animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usagePct = aiUsage.limit > 0 ? Math.min((aiUsage.used / aiUsage.limit) * 100, 100) : 0;
  const limitReached = aiUsage.limit > 0 && aiUsage.used >= aiUsage.limit;
  const currentRank = PLAN_ORDER.indexOf(currentTier);
  const isUpgradeable = (planId: string) => PLAN_ORDER.indexOf(planId) > currentRank;

  return (
    <div className="space-y-10">

      {/* Alerts */}
      {error && (
        <Alert variant="destructive"
          className="mx-auto max-w-4xl rounded-2xl border-rose-200 bg-rose-50">
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

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200
                        rounded-full px-4 py-1.5 text-xs font-bold text-sky-700
                        uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          Choose Your Plan
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Unlock the full potential of{" "}
          <span className="text-sky-600">AI-powered analytics</span>
        </h2>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
          From smart insights to real-time alerts — pick the plan that fits your growth.
        </p>

        {/* AI usage bar */}
        {aiUsage.limit > 0 && aiUsage.limit !== Infinity && (
          <div className="mt-4 bg-white rounded-2xl p-5 max-w-sm mx-auto
                          border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                AI Chat Usage This Month
              </p>
              <span className={`text-xs font-extrabold
                ${limitReached ? "text-rose-600" : "text-sky-700"}`}>
                {aiUsage.used} / {aiUsage.limit}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700
                  ${limitReached
                    ? "bg-gradient-to-r from-rose-400 to-rose-600"
                    : usagePct > 75
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-sky-500 to-blue-600"
                  }`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {limitReached && (
              <p className="text-xs text-rose-600 mt-2 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Limit reached! Upgrade for more AI chats.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentTier;
          const canUpgrade = isUpgradeable(plan.id);
          const isThisLoading = previewLoadingPlan === plan.id;
          const styles = PLAN_STYLES[plan.id] || PLAN_STYLES.free;

          return (
            <Card key={plan.id}
              className={`
                    relative flex flex-col transition-all duration-300
                    hover:shadow-xl hover:-translate-y-0.5 shadow-md border rounded-3xl
                    ${styles.ring}
                    ${isCurrentPlan ? "bg-sky-50/70 border-sky-300" : "bg-white border-slate-200"}
                  `}>

              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-600
                                    text-white px-4 py-1.5 shadow-lg rounded-full
                                    flex items-center gap-1 text-xs font-bold">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3.5 right-4 z-10">
                  <Badge className="bg-green-500 text-white px-3 py-1.5 shadow-lg
                                    rounded-full flex items-center gap-1 text-xs font-bold">
                    <Check className="h-3 w-3" /> Current
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-7">
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center
                                   justify-center ${styles.iconBg}`}>
                    {plan.icon}
                  </div>
                </div>

                <CardTitle className="text-xl mb-1 font-extrabold text-slate-900">
                  {plan.name}
                </CardTitle>

                {plan.id !== "enterprise" ? (
                  <div className="flex items-baseline justify-center gap-1.5 mt-2 mb-1">
                    {plan.oldPrice && (
                      <span className="text-slate-400 text-lg line-through">
                        ₹{plan.oldPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-sky-900">
                      {plan.price === 0 ? "Free" : `₹${plan.price!.toLocaleString("en-IN")}`}
                    </span>
                    {plan.price !== 0 && (
                      <span className="text-sm font-normal text-slate-400 self-end pb-0.5">
                        /month
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-extrabold text-indigo-700 mt-2 mb-1">
                    Custom Pricing
                  </div>
                )}

                {plan.oldPrice && plan.price !== undefined && (
                  <div className="flex justify-center mt-1">
                    <Badge className={`text-[10px] font-bold px-2.5 py-0.5
                                       rounded-full text-white ${styles.discountBadge}`}>
                      {Math.round(((plan.oldPrice - plan.price) / plan.oldPrice) * 100)}% OFF
                    </Badge>
                  </div>
                )}

                <CardDescription className="text-xs text-slate-400 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex flex-col flex-1 pb-6">
                <div className="space-y-2 flex-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center
                                      justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-2 opacity-40">
                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center
                                      justify-center flex-shrink-0 mt-0.5">
                        <X className="h-2.5 w-2.5 text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-400 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <div className="pt-2">
                  {plan.id === "enterprise" ? (
                    <Button variant="outline"
                      className="w-full h-11 rounded-xl border-2 border-indigo-200
                                       text-indigo-700 hover:bg-indigo-50 font-bold text-sm"
                      onClick={() => alert("Contact our sales team at sales@insydz.com")}>
                      Contact Sales
                    </Button>

                  ) : isCurrentPlan ? (
                    <Button disabled
                      className="w-full h-11 rounded-xl bg-green-50 border-2
                                       border-green-200 text-green-700 font-bold
                                       text-sm cursor-not-allowed opacity-100">
                      <Check className="h-4 w-4 mr-2" /> Current Plan
                    </Button>

                  ) : canUpgrade ? (
                    // Upgrade button — only shown for higher-tier plans
                    <Button
                      className={`w-full h-11 rounded-xl font-bold text-sm shadow-lg
                                  transition-all duration-200 ${styles.upgradeBtn}`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading || previewLoadingPlan !== null}
                    >
                      {isThisLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Upgrade to {plan.name}</>
                      )}
                    </Button>

                  ) : (
                    // Lower than current plan — no button (downgrade not supported)
                    <div className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200
                                    flex items-center justify-center">
                      <span className="text-xs text-slate-400 font-medium">
                        Lower than current plan
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100
                                  shadow-sm p-4 flex flex-col gap-2">
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
              {item.icon}
            </div>
            <p className="text-sm font-bold text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-4 max-w-4xl mx-auto">
        <h3 className="text-xl font-extrabold text-slate-900 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100
                                    shadow-sm p-5 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 mb-2 text-sm">{item.q}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
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
