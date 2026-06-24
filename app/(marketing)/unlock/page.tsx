"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";

// Platform configuration
const PLATFORMS: Record<string, {
  name: string;
  url: string;
  color: string;
  hoverColor: string;
  promoCode: string;
  actionText: string;
}> = {
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61586202582209",
    color: "#1877F2",
    hoverColor: "#166fe5",
    promoCode: "INSYDZ-FB-2FJDN9",
    actionText: "Follow us on Facebook"
  },
  x: {
    name: "X (Twitter)",
    url: "https://x.com/growwithinsydz",
    color: "#000000",
    hoverColor: "#333333",
    promoCode: "INSYDZ-X-V4PH4P",
    actionText: "Follow us on X"
  },
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/growwithinsydz/",
    color: "#E1306C",
    hoverColor: "#C13584",
    promoCode: "INSYDZ-IG-14NMHZ",
    actionText: "Follow us on Instagram"
  },
  linkedin: {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/insydz/?viewAsMember=true",
    color: "#0A66C2",
    hoverColor: "#004182",
    promoCode: "INSYDZ-IN-BM48ZZ",
    actionText: "Follow us on LinkedIn"
  },
  youtube: {
    name: "YouTube",
    url: "https://www.youtube.com/@growwith_Insydz?sub_confirmation=1",
    color: "#FF0000",
    hoverColor: "#CC0000",
    promoCode: "INSYDZ-YT-R2I43W",
    actionText: "Subscribe on YouTube"
  }
};

function UnlockContent() {
  const searchParams = useSearchParams();
  const platformParam = searchParams.get("p")?.toLowerCase() || "instagram"; // Default to IG if none provided
  const platform = PLATFORMS[platformParam] || PLATFORMS["instagram"];

  const [step, setStep] = useState<"initial" | "verifying" | "unlocked">("initial");
  const [copied, setCopied] = useState(false);

  // Verification Logic
  useEffect(() => {
    let focusListener: () => void;
    let fallbackTimeout: NodeJS.Timeout;

    if (step === "verifying") {
      // Logic 1: Listen for user returning to the tab
      focusListener = () => {
        // Add a slight delay to make the transition feel natural
        setTimeout(() => setStep("unlocked"), 1000);
      };
      window.addEventListener("focus", focusListener);

      // Logic 2: Fallback timeout just in case focus event fails (e.g., mobile Safari quirks)
      fallbackTimeout = setTimeout(() => {
        setStep("unlocked");
      }, 8000);
    }

    return () => {
      if (focusListener) window.removeEventListener("focus", focusListener);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [step]);

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open in new tab
    window.open(platform.url, "_blank");
    // Move to verification state
    setStep("verifying");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(platform.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Area */}
        <div 
          className="h-32 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: platform.color }}
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <h1 className="text-3xl font-black text-white relative z-10 tracking-tight shadow-sm">
            INSYDZ
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Unlock Your 20% Discount
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Complete the action below to instantly unlock your exclusive promo code. No sign-up required.
            </p>
          </div>

          {/* STEP 1: INITIAL ACTION */}
          {step === "initial" && (
            <div className="space-y-4">
              <button
                onClick={handleActionClick}
                className="w-full flex items-center justify-center gap-3 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                style={{ backgroundColor: platform.color }}
              >
                <span>{platform.actionText}</span>
                <ExternalLink size={18} className="opacity-80" />
              </button>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                Step 1 of 1
              </p>
            </div>
          )}

          {/* STEP 2: VERIFYING */}
          {step === "verifying" && (
            <div className="space-y-5 py-4">
              <div className="flex justify-center">
                <Loader2 size={40} className="animate-spin" style={{ color: platform.color }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Verifying Action...</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Waiting for you to return. If a new tab opened, complete the action and come back here.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: UNLOCKED */}
          {step === "unlocked" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Success! Unlocked.</h3>
                <p className="text-sm text-slate-500 mb-5">Tap below to copy your code.</p>
                
                <div 
                  onClick={handleCopy}
                  className="relative group cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 transition-all hover:bg-slate-100 hover:border-slate-400"
                >
                  <p className="text-2xl font-black text-slate-800 tracking-wider">
                    {platform.promoCode}
                  </p>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600">
                    {copied ? <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">COPIED!</span> : <Copy size={20} />}
                  </div>
                </div>
              </div>
              
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Secure verification provided by Insydz
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={40} />
      </div>
    }>
      <UnlockContent />
    </Suspense>
  );
}
