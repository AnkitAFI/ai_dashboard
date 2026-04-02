import { useState, useEffect } from "react";
import { useAuth } from "@/App";
import {
  Store,
  Search,
  ShoppingCart,
  Smartphone,
  Home,
  Shirt,
  BookOpen,
  Dumbbell,
  Sparkles,
  Car,
  Baby,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────
interface OnboardingData {
  userType: string;
  marketplace: string;
  primaryCategory: string;
  displayName: string;
  sellerId: string;
  investmentBudget: string;
}

const CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: Zap },
  { id: "mobiles_accessories", label: "Mobile & Accessories", icon: Smartphone },
  { id: "home_kitchen", label: "Home & Kitchen", icon: Home },
  { id: "fashion_clothing", label: "Fashion & Clothing", icon: Shirt },
  { id: "books_stationery", label: "Books & Stationery", icon: BookOpen },
  { id: "sports_fitness", label: "Sports & Fitness", icon: Dumbbell },
  { id: "beauty_grooming", label: "Beauty & Grooming", icon: Sparkles },
  { id: "automotive", label: "Automotive", icon: Car },
  { id: "baby_kids", label: "Baby & Kids", icon: Baby },
];

const BUDGET_OPTIONS = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹5,00,000",
  "₹5,00,000 – ₹10,00,000",
  "₹10,00,000+",
];

// ─── Component ────────────────────────────
export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    userType: "",
    marketplace: "",
    primaryCategory: "",
    displayName: "",
    sellerId: "",
    investmentBudget: "",
  });

  // Animate in
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // ─── Validation ──────────────────
  const canContinue = () => {
    switch (step) {
      case 1: return !!data.userType;
      case 2: return !!data.marketplace;
      case 3: return !!data.primaryCategory;
      case 4:
        if (!data.displayName.trim()) return false;
        if (data.userType === "researcher" && !data.investmentBudget) return false;
        return true;
      default: return false;
    }
  };

  // ─── Submit ──────────────────────
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: data.userType,
          marketplace: data.marketplace,
          primary_category: data.primaryCategory,
          display_name: data.displayName.trim(),
          seller_id: data.userType === "active_seller" ? data.sellerId.trim() || null : null,
          investment_budget: data.userType === "researcher" ? data.investmentBudget : null,
        }),
      });

      if (res.ok) {
        onComplete();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Onboarding error:", err);
        alert("Something went wrong. Please try again.");
      }
    } catch (e) {
      console.error("Onboarding error:", e);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Progress Bar ────────────────
  const progressColors = [
    "from-orange-500 to-orange-400",
    "from-orange-500 via-amber-400 to-amber-400",
    "from-orange-500 via-amber-400 to-yellow-400",
    "from-orange-500 via-amber-400 via-yellow-400 to-green-400",
  ];

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5 flex-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-100"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${s <= step
                    ? `bg-gradient-to-r ${progressColors[step - 1]}`
                    : ""
                  }`}
                style={{ width: s <= step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-3 font-medium tabular-nums">
          {step} / 4
        </span>
      </div>
    </div>
  );

  // ─── Reusable Card ──────────────
  const SelectCard = ({
    selected,
    onClick,
    icon,
    title,
    description,
  }: {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group
        ${selected
          ? "border-orange-400 bg-orange-50/60 shadow-sm shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
        }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200
          ${selected ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-400"}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${selected ? "text-gray-900" : "text-gray-700"}`}>
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );

  // ─── Category Card ──────────────
  const CategoryCard = ({
    id,
    label,
    icon: Icon,
    selected,
    onClick,
  }: {
    id: string;
    label: string;
    icon: any;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
        ${selected
          ? "border-orange-400 bg-orange-50/60 shadow-sm shadow-orange-100"
          : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
        }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200
          ${selected ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-xs font-medium text-center leading-tight ${selected ? "text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
    </button>
  );

  // ─── Tag Pill ───────────────────
  const TagPill = ({ label, color }: { label: string; color: string }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );

  // ─── Render Steps ───────────────
  const renderStep = () => {
    switch (step) {
      // ====== STEP 1: Welcome ======
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Insydz</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">How will you use the platform?</p>
            <div className="space-y-3">
              <SelectCard
                selected={data.userType === "active_seller"}
                onClick={() => setData({ ...data, userType: "active_seller" })}
                icon={<Store className="w-5 h-5" />}
                title="I am an Active Seller"
                description="Track my store, competitors & sales analytics"
              />
              <SelectCard
                selected={data.userType === "researcher"}
                onClick={() => setData({ ...data, userType: "researcher" })}
                icon={<Search className="w-5 h-5" />}
                title="I am Researching"
                description="Find winning products & market opportunities"
              />
            </div>
          </div>
        );

      // ====== STEP 2: Marketplace ======
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Marketplace</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">Which platform do you focus on primarily?</p>
            <div className="space-y-3">
              <SelectCard
                selected={data.marketplace === "amazon_india"}
                onClick={() => setData({ ...data, marketplace: "amazon_india" })}
                icon={
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                    IN
                  </span>
                }
                title="Amazon India"
                description="India's largest marketplace"
              />
              <SelectCard
                selected={data.marketplace === "flipkart"}
                onClick={() => setData({ ...data, marketplace: "flipkart" })}
                icon={
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    IN
                  </span>
                }
                title="Flipkart"
                description="India's second largest marketplace"
              />
              <SelectCard
                selected={data.marketplace === "both"}
                onClick={() => setData({ ...data, marketplace: "both" })}
                icon={<ShoppingCart className="w-5 h-5" />}
                title="Both"
                description="Analyse both platforms together"
              />
            </div>
          </div>
        );

      // ====== STEP 3: Category ======
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900">Pick Your Primary Category</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Your dashboard will be personalised with insights for this category
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  label={cat.label}
                  icon={cat.icon}
                  selected={data.primaryCategory === cat.id}
                  onClick={() => setData({ ...data, primaryCategory: cat.id })}
                />
              ))}
            </div>
          </div>
        );

      // ====== STEP 4: Final ======
      case 4:
        const isSeller = data.userType === "active_seller";
        const marketplaceLabel =
          data.marketplace === "amazon_india"
            ? "Amazon India"
            : data.marketplace === "flipkart"
              ? "Flipkart"
              : "Both";
        const categoryLabel =
          CATEGORIES.find((c) => c.id === data.primaryCategory)?.label || data.primaryCategory;

        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSeller ? "Set Up Your Store" : "Set Your Research Profile"}
            </h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">Almost there — a few final details</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <TagPill
                label={isSeller ? "Seller" : "Researcher"}
                color="text-orange-600 bg-orange-50 border border-orange-200"
              />
              <TagPill
                label={marketplaceLabel}
                color="text-green-600 bg-green-50 border border-green-200"
              />
              <TagPill
                label={categoryLabel}
                color="text-purple-600 bg-purple-50 border border-purple-200"
              />
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                Your Display Name
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => setData({ ...data, displayName: e.target.value })}
                placeholder="e.g. Rahul Sharma or Sharma Enterprises"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300
                  focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200"
              />
            </div>

            {/* Conditional Field */}
            {isSeller ? (
              <div className="mb-2">
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Amazon Seller ID{" "}
                  <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.sellerId}
                  onChange={(e) => setData({ ...data, sellerId: e.target.value })}
                  placeholder="e.g. A0221101309HP90NS2C7U"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300
                    focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200"
                />
              </div>
            ) : (
              <div className="mb-2">
                <label className="block text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-1.5">
                  Investment Budget
                </label>
                <div className="relative">
                  <select
                    value={data.investmentBudget}
                    onChange={(e) => setData({ ...data, investmentBudget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 appearance-none bg-white
                      focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200"
                  >
                    <option value="">Select budget range</option>
                    {BUDGET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Main Render ────────────────
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500
        ${visible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"}`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 transition-all duration-500 ease-out
          ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
      >
        <ProgressBar />
        {renderStep()}

        {/* Navigation Buttons */}
        <div className={`flex items-center mt-8 ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => canContinue() && setStep(step + 1)}
              disabled={!canContinue()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                ${canContinue()
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5"
                  : "bg-orange-100 text-orange-300 cursor-not-allowed"
                }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canContinue() || isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                ${canContinue() && !isSubmitting
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5"
                  : "bg-orange-100 text-orange-300 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Launch Dashboard
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
