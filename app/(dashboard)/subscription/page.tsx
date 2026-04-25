"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Building2, Loader2, AlertCircle, Sparkles, Infinity, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentModal, { type PaymentPlan } from "@/components/payment/PaymentModal";

const SUBSCRIPTION_PLANS = [
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
  { icon: <Zap className="h-5 w-5 text-sky-500" />, label: "Instant Activation", desc: "Plan changes take effect immediately" },
  { icon: <Check className="h-5 w-5 text-green-500" />, label: "Secure Payments", desc: "256-bit SSL secured by Razorpay" },
  { icon: <Infinity className="h-5 w-5 text-purple-500" />, label: "Unlimited Scale", desc: "Premium plan grows with your business" },
  { icon: <Shield className="h-5 w-5 text-amber-500" />, label: "Priority Support", desc: "Dedicated help on Basic+ plans" },
];

const FAQ = [
  { q: "Can I upgrade my plan anytime?", a: "Yes, you can upgrade at any time. If you're past the halfway mark of your billing cycle, you'll receive a prorated credit toward the new plan." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, and bank transfers for Indian customers via Razorpay." },
  { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption and secure servers for all customer data." },
  { q: "How does plan upgrading work?", a: "Upgrades are instant. If you upgrade mid-cycle, you only pay a prorated amount based on your remaining days." },
];

const PLAN_STYLES: Record<string, any> = {
  free: { iconBg: "bg-slate-100", ring: "", upgradeBtn: "bg-slate-500 hover:bg-slate-600 text-white", discountBadge: "bg-slate-500" },
  basic: { iconBg: "bg-sky-100", ring: "ring-2 ring-sky-500 ring-offset-4", upgradeBtn: "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-sky-200", discountBadge: "bg-sky-600" },
  premium: { iconBg: "bg-amber-100", ring: "", upgradeBtn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-200", discountBadge: "bg-amber-500" },
  enterprise: { iconBg: "bg-indigo-100", ring: "", upgradeBtn: "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-indigo-200", discountBadge: "bg-indigo-600" },
};

const PLAN_ORDER = ["free", "basic", "premium", "enterprise"];

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const { currentTier } = useSubscriptionLimits();
  const { getAIUsage } = useSubscriptionSync();

  const [loading, setLoading] = useState(false);
  const [previewLoadingPlan, setPreviewLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, month: "" });
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
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

    setPreviewLoadingPlan(planId);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/billing-preview/${user.id}/${planId}`, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to load billing info.");
      }
      const preview = await res.json();

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
          price: preview.charge,
          description: plan.description,
          priceNote: preview.explanation,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing info.");
    } finally {
      setPreviewLoadingPlan(null);
    }
  };

  const handlePaymentSuccess = async (planId: string) => {
    try {
      await refreshUser();
      const newUsage = await getAIUsage();
      setAiUsage(newUsage);
      setSuccess(`🎉 Successfully upgraded to ${planId.toUpperCase()} plan! Your new limits are now active.`);
    } catch (err) {
      console.error("Post-payment refresh failed:", err);
    }
    setPaymentPlan(null);
  };

  if (!user) return null;

  const usagePct = aiUsage.limit > 0 ? Math.min((aiUsage.used / aiUsage.limit) * 100, 100) : 0;
  const currentRank = PLAN_ORDER.indexOf(currentTier);
  const isUpgradeable = (planId: string) => PLAN_ORDER.indexOf(planId) > currentRank;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="px-4 py-1.5 text-xs font-black tracking-widest uppercase bg-sky-50/50 border-sky-100 text-sky-700">
          <Sparkles className="w-3 h-3 mr-2" /> Elevate Your Intelligence
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          The only <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-800">Growth Engine</span> your store needs
        </h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed">
          Unlock predictive insights, real-time competitor tracking, and unlimited AI power. Choose the plan that fuels your success.
        </p>
      </div>

      {/* AI Usage Card (Contextual) */}
      {aiUsage.limit > 0 && aiUsage.limit !== 999999 && (
        <Card className="max-w-md mx-auto border-none shadow-xl rounded-[2rem] bg-white p-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current AI Quota</span>
              <span className={`text-xs font-black ${usagePct > 80 ? 'text-rose-600' : 'text-sky-700'}`}>
                {aiUsage.used} / {aiUsage.limit} messages
              </span>
            </div>
            <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${usagePct > 80 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-sky-500 to-blue-700'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {usagePct > 80 && (
              <p className="text-[10px] text-center text-rose-500 font-bold mt-3">
                You're running low on AI capacity. Upgrade to maintain peak efficiency.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error/Success Alerts */}
      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/50 mb-6">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <AlertDescription className="text-rose-700 font-bold">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="rounded-2xl border-emerald-200 bg-emerald-50/50 mb-6">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-bold">{success}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const styles = PLAN_STYLES[plan.id] || PLAN_STYLES.free;
          const canUpgrade = isUpgradeable(plan.id);

          return (
            <Card key={plan.id} className={`relative flex flex-col border-none shadow-2xl rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 group ${isCurrent ? 'ring-4 ring-sky-500/10' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-sky-600 to-blue-800 text-white px-6 py-2 rounded-full shadow-xl text-[10px] font-black uppercase tracking-widest border-none">
                    Most Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-10 pb-6 px-8">
                <div className={`w-16 h-16 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner ${styles.iconBg}`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">{plan.name}</CardTitle>
                <div className="mt-4 flex flex-col items-center">
                  {plan.price !== undefined ? (
                    <div className="flex items-baseline gap-2">
                      {plan.oldPrice && <span className="text-slate-400 line-through text-lg">₹{plan.oldPrice}</span>}
                      <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-sm text-slate-400 font-medium">/mo</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-indigo-600">Enterprise</span>
                  )}
                  {plan.oldPrice && (
                    <Badge variant="secondary" className="mt-2 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px]">
                      SAVE {Math.round(((plan.oldPrice - plan.price!) / plan.oldPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-4 text-xs font-medium text-slate-500 px-4">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col px-8 pb-10">
                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{f}</span>
                    </div>
                  ))}
                  {plan.limitations.map((l, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-30">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-sm text-slate-400 font-medium line-through">{l}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <Button disabled className="w-full h-14 rounded-3xl bg-slate-50 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs opacity-100 cursor-default">
                    Your Active Plan
                  </Button>
                ) : plan.id === "enterprise" ? (
                  <Button variant="outline" className="w-full h-14 rounded-3xl border-2 border-indigo-100 text-indigo-600 font-black uppercase tracking-widest text-xs hover:bg-indigo-50" onClick={() => window.location.href = "mailto:sales@insydz.com"}>
                    Contact Sales
                  </Button>
                ) : canUpgrade ? (
                  <Button 
                    className={`w-full h-14 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 ${styles.upgradeBtn}`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!previewLoadingPlan}
                  >
                    {previewLoadingPlan === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : `Activate ${plan.name}`}
                  </Button>
                ) : (
                  <div className="w-full h-14 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lower Tier</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Why Choose Insydz?</h2>
          <p className="text-slate-500 font-medium">Join thousands of sellers who leverage our proprietary AI to dominate the Indian e-commerce landscape.</p>
          <div className="space-y-4">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-[1.5rem] bg-white shadow-sm border border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((item, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">{item.q}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
