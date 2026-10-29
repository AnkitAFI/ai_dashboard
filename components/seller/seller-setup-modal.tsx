"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  User,
  X,
  Clock,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";

interface SellerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlatformOption {
  id: string;
  name: string;
  desc: string;
}

const PLATFORMS: PlatformOption[] = [
  {
    id: "amazon",
    name: "Amazon India",
    desc: "Seller account creation & 5 product listings",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    desc: "Seller account creation & 5 product listings",
  },
  {
    id: "meesho",
    name: "Meesho",
    desc: "Supplier account setup & 5 product listings",
  },
];

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) return resolve(true);
    if (document.getElementById("rzp-sdk")) return resolve(true);
    const s = document.createElement("script");
    s.id = "rzp-sdk";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function SellerSetupModal({ isOpen, onClose, onSuccess }: SellerSetupModalProps) {
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["amazon"]);
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Map of already paid platforms -> { orderId: number }
  const [paidPlatformsMap, setPaidPlatformsMap] = useState<Record<string, { orderId: number }>>({});

  const fetchExistingOrders = async () => {
    try {
      setFetchingOrders(true);
      const res = await fetch(`${API_BASE_URL}/api/seller-services/my-orders`, {
        credentials: "include",
      });
      if (res.ok) {
        const orders = await res.json();
        const map: Record<string, { orderId: number }> = {};
        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            if (o.status === "paid" && Array.isArray(o.platforms)) {
              o.platforms.forEach((p: string) => {
                const key = p.toLowerCase();
                if (!map[key]) {
                  map[key] = { orderId: o.id };
                }
              });
            }
          });
        }
        setPaidPlatformsMap(map);

        // Auto-select the first available unbooked platform
        setSelectedPlatforms((prev) => {
          const unbooked = PLATFORMS.map((p) => p.id).filter((id) => !map[id]);
          const currentValid = prev.filter((id) => !map[id]);
          if (currentValid.length > 0) return currentValid;
          return unbooked.slice(0, 1);
        });
      }
    } catch (err) {
      console.error("Failed to check existing orders:", err);
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !loading) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (user?.name && !fullName) setFullName(user.name);
      fetchExistingOrders();
    }
    if (!isOpen) {
      setError(null);
      setSuccessOrder(null);
    }
  }, [user, isOpen]);

  const togglePlatform = (id: string) => {
    // Cannot toggle if already booked and paid
    if (paidPlatformsMap[id]) return;

    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((p) => p !== id)
          : prev
        : [...prev, id]
    );
  };

  // Only calculate price for unpaid platforms
  const unbookedSelected = selectedPlatforms.filter((id) => !paidPlatformsMap[id]);
  const totalPrice = unbookedSelected.length * 999;
  const allPlatformsBooked = PLATFORMS.every((p) => !!paidPlatformsMap[p.id]);

  const isFormValid =
    unbookedSelected.length > 0 &&
    fullName.trim().length >= 2 &&
    whatsappNumber.replace(/\D/g, "").length >= 10 &&
    agreedToTerms;

  const handlePay = async () => {
    if (!isFormValid) return;
    setError(null);
    setLoading(true);

    try {
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        setError("Unable to connect to payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      let res;
      try {
        res = await fetch(`${API_BASE_URL}/api/seller-services/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            platforms: unbookedSelected,
            whatsapp_number: whatsappNumber.trim(),
            full_name: fullName.trim(),
            gst_number: null,
            checklist_accepted: true,
          }),
        });
      } catch (networkErr) {
        console.error("Network error:", networkErr);
        setError("Connection issue. Please check your internet connection and try again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("Order init error:", errJson);
        setError(errJson?.detail || "Unable to process request right now. Please try again in a moment.");
        setLoading(false);
        return;
      }

      const orderData = await res.json();

      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Seller Account Setup",
        description: `Store Setup & 5 Listings (${unbookedSelected.join(", ").toUpperCase()})`,
        order_id: orderData.razorpay_order_id,
        prefill: {
          name: fullName.trim(),
          email: user?.email || "",
          contact: whatsappNumber ? `+91${whatsappNumber.replace(/\D/g, "")}` : "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verifyRes = await fetch(`${API_BASE_URL}/api/seller-services/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => null);
              console.error("Verification issue:", verifyErr);
              setError("Payment is being verified. Our team will confirm your booking on WhatsApp shortly.");
              setLoading(false);
              return;
            }

            const verifyData = await verifyRes.json();
            setSuccessOrder({
              orderId: verifyData.order_id,
              platforms: unbookedSelected,
              amount: totalPrice,
              whatsapp: whatsappNumber,
            });

            // Refresh existing orders to mark newly paid platform as booked
            fetchExistingOrders();
            if (onSuccess) onSuccess();
          } catch (verErr) {
            console.error("Verification error:", verErr);
            setError("Payment is being verified. Our team will confirm your booking on WhatsApp shortly.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong while processing. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-[95vw] max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-slate-950 flex flex-col focus:outline-none overscroll-contain animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sleek Top Header Bar with Single Dedicated Close Button */}
        <div className="shrink-0 sticky top-0 z-20 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Seller Account Setup
              </span>
              <span className="text-xs text-slate-400 ml-2 font-medium hidden sm:inline">
                Assisted Store Creation • 5 Free Listings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Checkout</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {successOrder ? (
          /* Success Screen */
          <div className="p-6 sm:p-10 text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-md">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Payment Received
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Your store setup booking for <strong>{successOrder.platforms.join(", ").toUpperCase()}</strong> has been placed.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-left space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">#{successOrder.orderId}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-emerald-600">₹{successOrder.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">WhatsApp Contact:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+91 {successOrder.whatsapp}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200 text-left leading-relaxed">
              <MessageCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Our team will message you directly on your WhatsApp number to collect the required business details and start setting up your store.</span>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl font-bold text-sm transition-all"
            >
              Back to Store
            </Button>
          </div>
        ) : (
          /* Clean Two-Column Layout (With Duplicate-Payment Prevention) */
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1">
            
            {/* Left Column: Marketplace Selection (6 cols) */}
            <div className="lg:col-span-6 p-4 sm:p-5 lg:p-6 bg-slate-50/60 dark:bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-slate-800/80 flex flex-col justify-between space-y-3 sm:space-y-4">
              
              <div className="space-y-3 sm:space-y-3.5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Includes 5 Free Product Listings</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Launch Your Online Store
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Select the marketplaces where you want our team to set up your seller accounts and add your first 5 products.
                  </p>
                </div>

                {/* Marketplace Cards */}
                <div className="space-y-1.5 sm:space-y-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
                    Choose Marketplaces (₹999 each)
                  </span>

                  <div className="space-y-1.5 sm:space-y-2">
                    {PLATFORMS.map((plat) => {
                      const isPaid = !!paidPlatformsMap[plat.id];
                      const paidInfo = paidPlatformsMap[plat.id];
                      const isSelected = selectedPlatforms.includes(plat.id);

                      if (isPaid) {
                        /* Already Paid & Booked Card (Disabled to prevent duplicate payment) */
                        return (
                          <div
                            key={plat.id}
                            className="rounded-xl border-2 border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-2.5 sm:p-3 flex items-center justify-between cursor-default transition-all"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <div className="w-4 h-4 rounded flex items-center justify-center bg-emerald-600 border border-emerald-600 text-white">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                    {plat.name}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    ✓ Setup in Progress (Order #{paidInfo.orderId})
                                  </span>
                                </div>
                                <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                  {plat.desc}
                                </p>
                              </div>
                            </div>

                            <div className="text-right pl-3 shrink-0">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                                Booked
                              </span>
                            </div>
                          </div>
                        );
                      }

                      /* Standard Selectable Card */
                      return (
                        <div
                          key={plat.id}
                          onClick={() => togglePlatform(plat.id)}
                          className={`cursor-pointer rounded-xl border-2 p-2.5 sm:p-3 transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-blue-600 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-blue-600/20"
                              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-900/30"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="space-y-0.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                                {plat.name}
                              </span>
                              <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                {plat.desc}
                              </p>
                            </div>
                          </div>

                          <div className="text-right pl-3 shrink-0">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                              ₹999
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Minimal Perks Bar */}
              <div className="pt-2 sm:pt-2.5 pb-0.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> Registration
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> 5 Listings
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> WhatsApp Support
                </span>
              </div>
            </div>

            {/* Right Column: Contact Details or All-Booked Banner (6 cols) */}
            <div className="lg:col-span-6 p-4 sm:p-5 lg:p-6 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-3 sm:space-y-3.5">
              
              {allPlatformsBooked ? (
                /* All Marketplaces Already Booked View */
                <div className="text-center p-6 sm:p-8 space-y-4 my-auto">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      All Marketplaces Booked! 🎉
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You already have active store setup bookings for Amazon India, Flipkart, and Meesho.
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3.5 text-xs text-blue-900 dark:text-blue-200 text-left leading-relaxed">
                    Our onboarding specialist is coordinating directly with you on WhatsApp to create your seller stores and list your products.
                  </div>
                  <Button
                    onClick={onClose}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-xs transition-all"
                  >
                    Done & Close
                  </Button>
                </div>
              ) : (
                /* Contact Details & Checkout for Remaining Unbooked Platforms */
                <>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Your Contact Details
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-400">
                          Our specialist will coordinate via WhatsApp
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900">
                        <Lock className="w-2.5 h-2.5" /> Confidential
                      </span>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="rounded-lg py-1.5 px-2.5 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ramesh Kumar"
                            className="h-9 text-xs pl-8 rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          WhatsApp Number
                        </Label>
                        <div className="relative">
                          <div className="absolute left-2.5 top-2 flex items-center pointer-events-none text-[11px] font-bold text-slate-500">
                            +91
                          </div>
                          <Input
                            type="tel"
                            maxLength={10}
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="9876543210"
                            className="h-9 text-xs pl-10 rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Compact Order Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-lg p-2 sm:p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                          Total Fee: ₹{totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {unbookedSelected.length} platform{unbookedSelected.length > 1 ? "s" : ""} selected • Includes 5 listings each
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* 3-Point Terms & Conditions */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-2 sm:p-2.5 space-y-1.5 text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] sm:text-[10.5px]">
                        Terms & Conditions
                      </div>
                      <div className="max-h-20 sm:max-h-24 overflow-y-auto pr-1 space-y-1">
                        <ol className="list-decimal list-outside pl-3.5 space-y-1 leading-normal">
                          <li>
                            <strong>Platform Approval:</strong> Account approval and listing activation depend on the respective marketplace (Amazon, Flipkart, or Meesho). Insydz assists with the onboarding process but does not control marketplace decisions.
                          </li>
                          <li>
                            <strong>Processing Fee:</strong> The service fee is non-refundable once document processing has started, regardless of the marketplace&apos;s approval or rejection.
                          </li>
                          <li>
                            <strong>Document Responsibility:</strong> The subscriber is responsible for providing genuine and accurate documents, whatsoever required by the platforms including PAN, GSTIN, identity proof, and product details, in compliance with applicable laws.
                          </li>
                        </ol>
                      </div>
                      
                      <label className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 cursor-pointer">
                        <Checkbox
                          checked={agreedToTerms}
                          onCheckedChange={(c) => setAgreedToTerms(!!c)}
                          className="rounded h-3.5 w-3.5"
                        />
                        <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          I have read and agree to the terms & conditions outlined above
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Action Button & Payment Footer */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 pb-1">
                    <Button
                      onClick={handlePay}
                      disabled={!isFormValid || loading || unbookedSelected.length === 0}
                      className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting to Payment Gateway...
                        </>
                      ) : (
                        <>
                          Pay ₹{totalPrice.toLocaleString()} via UPI / Card <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>100% Confidential • Instant WhatsApp Assistance</span>
                    </div>
                  </div>
                </>
              )}

            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
