// app/(dashboard)/explorer/price-tracker/_components/PctBuyCreditsDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { pctApi } from "./pct-api";
import { X, Loader2, ShieldCheck, Plus, Minus, Info } from "lucide-react";

interface PctBuyCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];
const PRICE_PER_CREDIT = 49;

export function PctBuyCreditsDialog({ isOpen, onClose, onSuccess }: PctBuyCreditsDialogProps) {
  const { toast } = useToast();
  const [credits, setCredits] = useState<number>(25);
  const [inputValue, setInputValue] = useState<string>("25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCredits(25);
      setInputValue("25");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) {
      setInputValue("");
      setCredits(0);
      return;
    }
    let parsed = parseInt(raw, 10);
    if (parsed > 10000) {
      parsed = 10000;
      raw = "10000";
    }
    setInputValue(raw);
    setCredits(parsed);
  };

  const handleBlur = () => {
    if (!credits || credits < 1) {
      setCredits(1);
      setInputValue("1");
    } else {
      setInputValue(credits.toString());
    }
  };

  const handleAdjust = (delta: number) => {
    const newVal = Math.max(1, Math.min(10000, (credits || 0) + delta));
    setCredits(newVal);
    setInputValue(newVal.toString());
  };

  const handleSelectPreset = (amount: number) => {
    setCredits(amount);
    setInputValue(amount.toString());
  };

  const totalPrice = (credits || 0) * PRICE_PER_CREDIT;
  const isValid = credits >= 1 && credits <= 10000;

  const handleCheckout = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on server with exact credit amount
      const orderData = await pctApi.createWalletOrder(credits);

      // 2. Ensure Razorpay script is loaded
      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency || "INR",
        name: "Insydz",
        description: `Purchase ${credits} Price Tracker Credits (₹${PRICE_PER_CREDIT}/credit)`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await pctApi.verifyWalletOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({
              title: "Credits Added Successfully!",
              description: `${credits} extra credits have been added to your balance.`,
            });
            onSuccess();
            onClose();
          } catch (err: any) {
            const fallbackMsg = "Payment confirmation is in progress. If money was debited, your credits will update shortly.";
            setError(err.message || fallbackMsg);
            toast({
              title: "Payment Processing",
              description: err.message || fallbackMsg,
            });
          }
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment was not completed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Unable to start checkout right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
            ₹
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Purchase Extra Credits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Additional credits never expire • Rate: <strong>₹{PRICE_PER_CREDIT} per credit</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 my-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Custom Quantity Input Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter Number of Credits
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              Valid: 1 to 10,000 credits
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjust(-1)}
              disabled={credits <= 1}
              className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Decrease by 1"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full text-center text-2xl font-extrabold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                placeholder="Enter credits"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                credits
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleAdjust(1)}
              disabled={credits >= 10000}
              className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Increase by 1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {(!credits || credits < 1) && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
              Please enter at least 1 credit (Min: 1 credit = ₹49)
            </div>
          )}

          {credits >= 10000 && (
            <div className="flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 mt-2.5 font-medium bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-xl border border-blue-200/80 dark:border-blue-800/60 leading-tight">
              <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                Maximum 10,000 credits per order. You can easily top up another 10,000 credits anytime after completing this payment!
              </span>
            </div>
          )}

          {/* Quick Select Preset Pills */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick Select:
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isActive = credits === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {amt} Credits
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Price Summary Box */}
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between mb-5">
          <div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Total Amount Payable
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
              {credits || 0} credits × ₹{PRICE_PER_CREDIT}/credit
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              ₹{totalPrice.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              GST Invoice Included
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Secured via Razorpay. Credits added immediately upon payment confirmation.</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !isValid}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Proceed to Pay ₹{totalPrice.toLocaleString("en-IN")}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
