"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Globe,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Google Ads Conversion Event - Signup
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "conversion_event_signup_2", {
        // event_parameters can be added here if needed
      });
    }
  }, []);

  const userName =
    user?.firstName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("thank_you_seen", "true");
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#2b52cd] dark:bg-slate-950 transition-colors duration-300 relative px-4 py-10 overflow-y-auto">
      {/* ── Theme Toggle ── */}
      <div className="absolute top-6 right-8 z-50">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          title="Toggle Theme"
        >
          {mounted &&
            (resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            ))}
        </button>
      </div>

      <div className="w-full max-w-xl my-auto">
        {/* ── Header Logo ── */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Insydz Logo"
              className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
            />
            <span className="text-3xl font-bold text-white tracking-tight">
              Insydz
            </span>
          </Link>
        </div>

        {/* ── Main Thank You Card ── */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            {/* Animated Celebration Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/30 transition-transform hover:scale-105">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md animate-bounce">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            {/* Tagline Badge */}
            <div className="-mt-1.5 mb-0.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Account Verified & Ready
            </div>

            {/* Title & Greeting */}
            <div className="space-y-1.5 max-w-lg">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Thank You for Registering! 🎉
              </h1>
              <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {userName ? `Welcome ${userName}! ` : "Welcome to Insydz! "}
                Your profile has been created successfully.
              </p>
            </div>

            {/* Value Statement */}
            <div className="w-full bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                What's Next?
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                Let's customize your market intelligence dashboard in 30 seconds
                so you get relevant category insights and competitor tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-800 dark:text-slate-200">
                      Tailored Intelligence
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      Market data filtered for your specific platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-800 dark:text-slate-200">
                      Real-Time Tracking
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      Monitor prices, rankings & market gaps instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full pt-2">
              <Button
                onClick={handleContinue}
                className="w-full h-12 sm:h-13 rounded-2xl font-bold text-white text-base transition-all duration-200 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
                data-track-id="thank-you-continue-cta"
              >
                <span>Continue to Dashboard Setup</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-white/70">
          Need assistance? Contact us at{" "}
          <a
            href="mailto:support@insydz.com"
            className="text-white underline font-medium hover:text-white/90"
          >
            support@insydz.com
          </a>
        </div>
      </div>
    </div>
  );
}
