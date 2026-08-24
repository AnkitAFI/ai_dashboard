"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Smartphone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Moon,
  Sun,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "next-themes";
import { sanitizeApiError } from "@/lib/sanitize-error";

export default function VerifyMobilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auth Protection Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.mobileNumber && user.mobileNumber.trim().length >= 10) {
        // If mobile already verified, route to dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/mobile/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ mobile_number: cleanMobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send OTP.");
      }

      toast({
        title: "OTP Sent!",
        description: `Verification code sent to +91 ${cleanMobile}`,
      });

      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setStep("otp");
      setResendTimer(60);
    } catch (err: any) {
      setErrorMessage(sanitizeApiError(err.message, "Error sending verification code."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (otp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsLoading(true);

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, "");
      const response = await fetch(`${API_BASE_URL}/api/auth/mobile/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mobile_number: cleanMobile,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid OTP code.");
      }

      toast({
        title: "Mobile Verified!",
        description: "Your mobile number has been successfully verified.",
      });

      // Refresh user state in AuthContext
      await refreshUser();

      router.replace("/dashboard");
    } catch (err: any) {
      setErrorMessage(sanitizeApiError(err.message, "Verification failed. Please check the code."));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Checking authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#2b52cd] dark:bg-slate-950 transition-colors duration-300 relative px-4 py-8">
      {/* Theme Toggle */}
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

      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Insydz Logo"
              className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
            />
            <span className="text-3xl font-bold text-white tracking-tight">Insydz</span>
          </Link>
        </div>

        {/* White Main Card */}
        <div className="rounded-2xl p-8 bg-white dark:bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-800 transition-colors duration-300">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-[7px] h-[7px] rounded-full bg-blue-500 animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(59,130,246,0.5)" }}
            />
            <span className="text-[10px] text-blue-600 dark:text-blue-400 tracking-widest uppercase font-bold">
              Account Security
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
            Verify Mobile Number
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            Complete your profile setup by verifying your Indian mobile number
          </p>

          {/* Error Message */}
          {errorMessage && (
            <Alert
              variant="destructive"
              icon={<AlertCircle className="h-4 w-4" />}
              description={errorMessage}
              className="mb-5"
            />
          )}

          {step === "mobile" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Mobile Number *
                </Label>
                <div className="flex gap-2">
                  <div className="h-11 px-3 flex items-center justify-center bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 shrink-0">
                    🇮🇳 +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    required
                    className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl font-medium tracking-wide"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  We'll send a 6-digit verification code via SMS
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || mobileNumber.replace(/\D/g, "").length !== 10}
                className="w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <Smartphone className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    +91 {mobileNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("mobile");
                    setOtp("");
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Edit number
                </button>
              </div>

              <div className="space-y-3 flex flex-col items-center">
                <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Enter 6-digit OTP code
                </Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex items-center justify-between text-xs">
                {resendTimer > 0 ? (
                  <span className="text-gray-400 dark:text-slate-500">
                    Resend code in <strong className="text-gray-700 dark:text-slate-300 font-semibold">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Card Footer */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Required for DPDP compliance and account recovery
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
