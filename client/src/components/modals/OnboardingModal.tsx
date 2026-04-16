import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  CheckCircle2
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

const categories = [
  "Beauty & Personal Care",
  "Electronics",
  "Home & Kitchen",
  "Fashion & Apparel",
  "Health & Wellness",
  "Baby Products",
  "Groceries",
  "Toys & Games",
  "Other"
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    onboarding_goal: "",
    onboarding_marketplace: "",
    onboarding_details: "",
    seller_id: "",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
    if (currentStep === 3) return !!formData.onboarding_details;
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
                      formData.onboarding_goal === "new_seller" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
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
                      formData.onboarding_goal === "existing_seller" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
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

              {currentStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  {[
                    { id: "amazon_india", label: "Amazon India", icon: Package },
                    { id: "flipkart", label: "Flipkart", icon: ShoppingCart },
                    { id: "both", label: "Both / Meesho", icon: Globe },
                  ].map((market) => (
                    <button
                      key={market.id}
                      onClick={() => setFormData({ ...formData, onboarding_marketplace: market.id })}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group",
                        formData.onboarding_marketplace === market.id
                          ? "border-sky-500 bg-sky-50"
                          : "border-slate-100 hover:border-sky-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                        formData.onboarding_marketplace === market.id ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        <market.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{market.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 py-4">
                  {formData.onboarding_goal === "new_seller" ? (
                    <div className="space-y-4">
                      <label className="text-base font-bold text-slate-800">
                        What category are you thinking about?
                      </label>
                      <p className="text-sm text-slate-500">We'll show you the best opportunities there</p>
                      <Select
                        value={formData.onboarding_details}
                        onValueChange={(val) => setFormData({ ...formData, onboarding_details: val })}
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl overflow-hidden shadow-xl">
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase().replace(/ /g, "_")}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, onboarding_details: "general" })}
                        className="text-sm text-sky-600 font-medium hover:underline"
                      >
                        Or skip this - I'll explore on my own
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-base font-bold text-slate-800">
                        Add your seller ID to track
                      </label>
                      <p className="text-sm text-slate-500 text-pretty">
                        We'll set up your personal dashboard for your specific account.
                      </p>
                      <Input
                        placeholder="Enter your Merchant/Seller ID"
                        className="h-12 rounded-xl border-slate-200"
                        value={formData.onboarding_details}
                        onChange={(e) => setFormData({ ...formData, onboarding_details: e.target.value })}
                      />
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <span>🔒 We only READ your data. We never change anything in your account.</span>
                      </div>
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
                currentStep === 3 ? "bg-[#0f2a43] hover:bg-[#1a3d5c] text-white" : "bg-slate-300 text-slate-600"
              )}
            >
              {currentStep === 3 ? (
                <>
                  {formData.onboarding_goal === "new_seller" ? "Show Me Opportunities" : "Set Up My Dashboard"}
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
