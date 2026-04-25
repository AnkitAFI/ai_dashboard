"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BarChart3, Package, ShoppingCart, Globe, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
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
  { id: 1, title: "Welcome 👋", subtitle: "What brings you here?" },
  { id: 2, title: "Marketplace?", subtitle: "Pick your platform" },
  { id: 3, title: "Details", subtitle: "Set up your dashboard" },
];

const categories = ["Electronics", "Home & Kitchen", "Beauty", "Fashion", "Health", "Toys", "Groceries"];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({ onboarding_goal: "", onboarding_marketplace: "", onboarding_details: "", seller_id: "" });

  const isStepValid = () => {
    if (currentStep === 1) return !!formData.onboarding_goal;
    if (currentStep === 2) return !!formData.onboarding_marketplace;
    if (currentStep === 3) return !!formData.onboarding_details;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
        <div className="bg-sky-950 p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", currentStep >= s.id ? "bg-amber-500" : "bg-sky-900")}>{currentStep > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}</div>
                {s.id < 3 && <div className={cn("h-0.5 flex-1 mx-2", currentStep > s.id ? "bg-amber-500" : "bg-sky-900")} />}
              </div>
            ))}
          </div>
          <h2 className="text-xl font-bold">{steps[currentStep - 1].title}</h2>
          <p className="text-sky-200 text-xs">{steps[currentStep - 1].subtitle}</p>
        </div>
        <div className="p-8 bg-white min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="flex-1">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => setFormData({ ...formData, onboarding_goal: "new_seller" })} className={cn("p-4 rounded-2xl border-2 text-center", formData.onboarding_goal === "new_seller" ? "border-sky-500 bg-sky-50" : "border-slate-100")}>
                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-2"><Search className="w-5 h-5 text-sky-600" /></div>
                    <span className="font-bold text-sm">New Seller</span>
                  </button>
                  <button onClick={() => setFormData({ ...formData, onboarding_goal: "existing_seller" })} className={cn("p-4 rounded-2xl border-2 text-center", formData.onboarding_goal === "existing_seller" ? "border-sky-500 bg-sky-50" : "border-slate-100")}>
                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-2"><BarChart3 className="w-5 h-5 text-sky-600" /></div>
                    <span className="font-bold text-sm">Existing Seller</span>
                  </button>
                </div>
              )}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[ { id: "amazon", l: "Amazon", i: Package }, { id: "flipkart", l: "Flipkart", i: ShoppingCart }, { id: "both", l: "Both", i: Globe } ].map((m) => (
                    <button key={m.id} onClick={() => setFormData({ ...formData, onboarding_marketplace: m.id })} className={cn("p-4 rounded-xl border-2 text-center", formData.onboarding_marketplace === m.id ? "border-sky-500 bg-sky-50" : "border-slate-100")}>
                      <m.i className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                      <span className="text-xs font-bold">{m.l}</span>
                    </button>
                  ))}
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-800">Final Step</label>
                  {formData.onboarding_goal === "new_seller" ? (
                    <Select value={formData.onboarding_details} onValueChange={(v) => setFormData({ ...formData, onboarding_details: v })}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Enter Merchant ID" className="h-12 rounded-xl" value={formData.onboarding_details} onChange={(e) => setFormData({ ...formData, onboarding_details: e.target.value })} />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} className="flex-1 h-12 rounded-xl">Back</Button>}
            <Button disabled={!isStepValid()} onClick={() => currentStep === 3 ? onComplete(formData) : setCurrentStep(s => s + 1)} className="flex-[2] h-12 rounded-xl bg-sky-950 hover:bg-sky-900 text-white font-bold">{currentStep === 3 ? "Complete" : "Next"} <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
