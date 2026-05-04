
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BarChart3,
  Package,
  ShoppingCart,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  onboarding_goal: string;
  onboarding_marketplace: string;
  onboarding_details: string;
  seller_id?: string;
}

const steps = [
  { id: 1, title: "Welcome to Insydz 👋", subtitle: "What brings you here?" },
  { id: 2, title: "Which marketplace?", subtitle: "Pick your main platform" },
  { id: 3, title: "Final details", subtitle: "Let's set up your dashboard" },
];

const MARKETPLACE_API_MAP: Record<string, string> = {
  amazon_india: "amazon",
  flipkart:     "flipkart",
  both:         "both",
};

async function fetchCategories(marketplace: string): Promise<string[]> {
  const param = MARKETPLACE_API_MAP[marketplace] ?? "amazon";
  const res = await fetch(
    `https://api.insydz.com/api/onboarding/categories?marketplace=${param}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories ?? [];
}

async function connectSellerAccount(sellerId: string, country: string): Promise<void> {
  const response = await fetch("https://api.insydz.com/api/seller/update-seller-id", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seller_id: sellerId, country }),
  });
  if (!response.ok) throw new Error("Failed to connect seller account");
}

// Marketplaces where existing seller is NOT yet supported
const COMING_SOON_SELLER_MARKETPLACES = ["flipkart", "both"];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    onboarding_goal:        "",
    onboarding_marketplace: "",
    onboarding_details:     "",
    seller_id:              "",
  });

  // Category fetch state
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  // Seller connection state
  const [sellerCountry, setSellerCountry] = useState("IN");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch categories when marketplace chosen and goal is new_seller
  useEffect(() => {
    if (!formData.onboarding_marketplace || formData.onboarding_goal !== "new_seller") return;

    setLoadingCategories(true);
    setCategoryError(false);
    setCategories([]);

    fetchCategories(formData.onboarding_marketplace)
      .then((cats) => {
        setCategories(cats);
        if (cats.length === 0) setCategoryError(true);
      })
      .catch(() => setCategoryError(true))
      .finally(() => setLoadingCategories(false));
  }, [formData.onboarding_marketplace, formData.onboarding_goal]);

  // Reset seller state when marketplace changes
  useEffect(() => {
    setIsConnected(false);
    setConnectionError(null);
    setFormData((prev) => ({ ...prev, onboarding_details: "", seller_id: "" }));
  }, [formData.onboarding_marketplace]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const isComingSoon =
    formData.onboarding_goal === "existing_seller" &&
    COMING_SOON_SELLER_MARKETPLACES.includes(formData.onboarding_marketplace);

  const handleConnectSeller = async () => {
    const sellerId = formData.onboarding_details.trim();
    if (!sellerId) {
      setConnectionError("Please enter a valid Seller ID");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await connectSellerAccount(sellerId, sellerCountry);
      setIsConnected(true);
      setFormData((prev) => ({ ...prev, seller_id: sellerId }));
    } catch (err: any) {
      setConnectionError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleComplete = () => {
    const finalData = { ...formData };
    if (formData.onboarding_goal === "existing_seller") {
      finalData.seller_id = formData.onboarding_details;
    }
    onComplete(finalData);
  };

  const isStepValid = () => {
    if (currentStep === 1) return !!formData.onboarding_goal;
    if (currentStep === 2) return !!formData.onboarding_marketplace;
    if (currentStep === 3) {
      if (isComingSoon) return true; // can proceed past coming soon
      if (formData.onboarding_goal === "existing_seller") return isConnected;
      return !!formData.onboarding_details;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">

        {/* Progress Header */}
        <div className="bg-[#0f2a43] p-6 text-white">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    currentStep >= step.id
                      ? "bg-amber-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  )}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                {step.id < 3 && (
                  <div
                    className={cn(
                      "h-[2px] flex-1 mx-2 transition-all duration-500",
                      currentStep > step.id ? "bg-amber-500" : "bg-slate-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
              Step {currentStep} of 3
            </span>
            <h2 className="text-2xl font-bold text-white">{steps[currentStep - 1].title}</h2>
            <p className="text-slate-400 text-sm">{steps[currentStep - 1].subtitle}</p>
          </div>
        </div>

        <div className="p-8 bg-white min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >

              {/* ── Step 1: Goal ── */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full py-4">
                  <button
                    onClick={() => setFormData({ ...formData, onboarding_goal: "new_seller" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                      formData.onboarding_goal === "new_seller"
                        ? "border-sky-500 bg-sky-50 shadow-md"
                        : "border-slate-100 hover:border-sky-200 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      formData.onboarding_goal === "new_seller"
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
                    )}>
                      <Search className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg mb-2">New Seller</span>
                    <p className="text-sm text-slate-500 text-center">
                      Research markets, find demand, check competition
                    </p>
                  </button>

                  <button
                    onClick={() => setFormData({ ...formData, onboarding_goal: "existing_seller" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                      formData.onboarding_goal === "existing_seller"
                        ? "border-sky-500 bg-sky-50 shadow-md"
                        : "border-slate-100 hover:border-sky-200 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      formData.onboarding_goal === "existing_seller"
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
                    )}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg mb-2">Existing Seller</span>
                    <p className="text-sm text-slate-500 text-center">
                      Track rankings, monitor competitors, get alerts
                    </p>
                  </button>
                </div>
              )}

              {/* ── Step 2: Marketplace ── */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  {[
                    { id: "amazon_india", label: "Amazon India", icon: Package },
                    { id: "flipkart",     label: "Flipkart",     icon: ShoppingCart },
                    { id: "both",         label: "Both / Meesho", icon: Globe },
                  ].map((market) => {
                    const isMarketComingSoon =
                      formData.onboarding_goal === "existing_seller" &&
                      COMING_SOON_SELLER_MARKETPLACES.includes(market.id);

                    return (
                      <button
                        key={market.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            onboarding_marketplace: market.id,
                            onboarding_details: "",
                          })
                        }
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group",
                          formData.onboarding_marketplace === market.id
                            ? "border-sky-500 bg-sky-50"
                            : isMarketComingSoon
                            ? "border-slate-100 bg-slate-50 opacity-70"
                            : "border-slate-100 hover:border-sky-200"
                        )}
                      >
                        {/* Coming soon badge on the card */}
                        {isMarketComingSoon && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Soon
                          </span>
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                          formData.onboarding_marketplace === market.id
                            ? "bg-sky-500 text-white"
                            : isMarketComingSoon
                            ? "bg-slate-200 text-slate-400"
                            : "bg-slate-100 text-slate-500"
                        )}>
                          <market.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{market.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Step 3: Details ── */}
              {currentStep === 3 && (
                <div className="space-y-6 py-4">

                  {/* NEW SELLER — category picker */}
                  {formData.onboarding_goal === "new_seller" && (
                    <div className="space-y-4">
                      <label className="text-base font-bold text-slate-800">
                        What category are you thinking about?
                      </label>
                      <p className="text-sm text-slate-500">
                        We'll show you the best opportunities there
                      </p>

                      {loadingCategories ? (
                        <div className="flex items-center gap-2 h-12 text-sm text-slate-500">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                          Loading categories…
                        </div>
                      ) : categoryError ? (
                        <div className="flex items-center gap-2 h-12 text-sm text-red-500">
                          Couldn't load categories. Please go back and retry.
                        </div>
                      ) : (
                        <Select
                          value={formData.onboarding_details}
                          onValueChange={(val) =>
                            setFormData({ ...formData, onboarding_details: val })
                          }
                        >
                          <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl overflow-hidden shadow-xl max-h-60">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, onboarding_details: "general" })}
                        className="text-sm text-sky-600 font-medium hover:underline"
                      >
                        Or skip this — I'll explore on my own
                      </button>
                    </div>
                  )}

                  {/* EXISTING SELLER — coming soon for flipkart/both */}
                  {formData.onboarding_goal === "existing_seller" && isComingSoon && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-8 gap-5 text-center"
                    >
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <Clock className="w-8 h-8 text-amber-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">Coming Soon</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                          Seller dashboard support for{" "}
                          <span className="font-semibold text-slate-700">
                            {formData.onboarding_marketplace === "flipkart" ? "Flipkart" : "Meesho / Both"}
                          </span>{" "}
                          is currently in development. We'll notify you when it's ready!
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        Expected: 2026
                      </div>
                      <button
                        type="button"
                        onClick={() => prevStep()}
                        className="text-sm text-sky-600 font-medium hover:underline"
                      >
                        Go back and choose Amazon India instead
                      </button>
                    </motion.div>
                  )}

                  {/* EXISTING SELLER — Amazon seller ID connection */}
                  {formData.onboarding_goal === "existing_seller" && !isComingSoon && (
                    <div className="space-y-4">

                      {/* Connected success state */}
                      {isConnected ? (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center justify-center py-6 gap-4"
                        >
                          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-800 text-lg">Store Connected!</p>
                            <p className="text-sm text-slate-500 mt-1">
                              Seller ID{" "}
                              <span className="font-mono font-semibold text-slate-700">
                                {formData.onboarding_details}
                              </span>{" "}
                              is linked.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsConnected(false);
                              setFormData((prev) => ({ ...prev, onboarding_details: "", seller_id: "" }));
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                          >
                            Use a different ID
                          </button>
                        </motion.div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <label className="text-base font-bold text-slate-800 block">
                                Connect your store
                              </label>
                              <p className="text-xs text-slate-400">
                                Enter your Amazon Merchant ID
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                              Seller / Merchant ID
                            </label>
                            <Input
                              placeholder="e.g. A2P3M1XXXXXXX"
                              className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0f2a43]"
                              value={formData.onboarding_details}
                              onChange={(e) => {
                                setConnectionError(null);
                                setFormData({ ...formData, onboarding_details: e.target.value });
                              }}
                              disabled={isConnecting}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                              Marketplace Region
                            </label>
                            <Select
                              value={sellerCountry}
                              onValueChange={setSellerCountry}
                              disabled={isConnecting}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN">India 🇮🇳</SelectItem>
                                <SelectItem value="US">United States 🇺🇸</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Data will be fetched specifically for this region.
                            </p>
                          </div>

                          {connectionError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>{connectionError}</span>
                            </div>
                          )}

                          <Button
                            onClick={handleConnectSeller}
                            disabled={isConnecting || !formData.onboarding_details.trim()}
                            className="w-full h-12 rounded-xl bg-[#0f2a43] hover:bg-[#1a3d5c] text-white font-bold transition-all"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Connecting your store…
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Connect Store
                              </>
                            )}
                          </Button>

                          <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
                            🔒 Secure Read-Only Access
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 mt-8">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            <Button
              disabled={!isStepValid()}
              onClick={currentStep === 3 ? handleComplete : nextStep}
              className={cn(
                "flex-[2] h-12 rounded-xl font-bold transition-all",
                currentStep === 3
                  ? "bg-[#0f2a43] hover:bg-[#1a3d5c] text-white"
                  : "bg-slate-300 text-slate-600"
              )}
            >
              {currentStep === 3 ? (
                <>
                  {formData.onboarding_goal === "new_seller"
                    ? "Show Me Opportunities"
                    : isComingSoon
                    ? "Got It, Notify Me"
                    : "Set Up My Dashboard"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}