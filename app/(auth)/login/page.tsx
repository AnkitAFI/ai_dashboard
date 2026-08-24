"use client";
import { useState, useEffect } from "react";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ShoppingCart,
  ShoppingBag,
  Moon,
  Sun,
  Star,
  TrendingUp,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ExpertButton from "../components/Expertbutton";
import VideoButton from "../components/Videobutton";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "otp" | "password">(
    "email",
  );
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If already logged in, redirect to verify mobile or dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.mobileNumber || user.mobileNumber.trim() === "") {
        router.replace("/verify-mobile");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember_me: rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404) {
          setErrorMessage(
            "No account found with this email. Please sign up first.",
          );
        } else if (response.status === 401) {
          setErrorMessage(
            "Incorrect password. Click 'Forgot Password' to reset.",
          );
        } else if (response.status === 403) {
          const detail = errorData.detail || "";
          if (detail.includes("verify")) {
            document.cookie = `verify_email=${formData.email}; path=/; max-age=600; SameSite=Strict`;
            toast({
              title: "Email not verified",
              description: "Please verify your email to continue.",
              variant: "destructive",
            });
            router.push("/verify-email");
            return;
          } else {
            setErrorMessage("Account is deactivated. Please contact support.");
          }
        } else {
          setErrorMessage(
            sanitizeApiError(
              errorData.detail,
              "Login failed. Please try again.",
            ),
          );
        }
        return;
      }

      // ==================== SUCCESS ====================
      const data = await response.json();

      if (data.status === "mfa_required") {
        setMfaStep(true);
        setTempToken(data.temp_token);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });

      // Wait for user context to populate before redirecting
      await refreshUser().catch((err) => {
        console.warn("Refresh user after login failed (non-critical)", err);
      });

      // Redirect immediately using window.location to bypass Next.js client cache
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false); // ← Always reset loading
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/mfa/verify-login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp_token: tempToken,
            code: mfaCode,
            remember_me: rememberMe,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.detail || "Invalid MFA code.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "MFA verified successfully.",
      });

      await refreshUser().catch(() => {});
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!forgotEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          sanitizeApiError(
            data.detail,
            "Failed to send OTP. Please try again.",
          ),
        );
      toast({
        title: "OTP Sent! 📱",
        description: "Please check your registered mobile number for the 6-digit SMS OTP",
      });
      setResetStep("otp");
      startOtpTimer();
    } catch (error: any) {
      toast({
        title: "Error",
        description: sanitizeApiError(
          error.message,
          "Failed to send OTP. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          sanitizeApiError(data.detail, "Invalid OTP. Please try again."),
        );
      toast({
        title: "OTP Verified! ✅",
        description: "Now set your new password",
      });
      setResetStep("password");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: sanitizeApiError(
          error.message,
          "Invalid OTP. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Password required",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password-with-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail,
            otp,
            new_password: newPassword,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          sanitizeApiError(
            data.detail,
            "Password reset failed. Please try again.",
          ),
        );
      toast({
        title: "Password Reset Successful! 🎉",
        description: "You can now login with your new password",
      });
      setShowForgotDialog(false);
      setResetStep("email");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: sanitizeApiError(
          error.message,
          "Password reset failed. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          sanitizeApiError(
            data.detail,
            "Failed to resend OTP. Please try again.",
          ),
        );
      toast({
        title: "OTP Resent! 📱",
        description: "A new SMS OTP has been sent to your registered mobile number",
      });
      setOtp("");
      startOtpTimer();
    } catch (error: any) {
      toast({
        title: "Error",
        description: sanitizeApiError(
          error.message,
          "Failed to resend OTP. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrorMessage("");
    };

  const handleForgotPasswordClick = () => {
    setForgotEmail(formData.email);
    setResetStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowForgotDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2b52cd] dark:bg-slate-950 transition-colors duration-300">
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

      <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 my-auto py-4 lg:py-4 xl:py-8">
          {/* ── Left Panel ── */}
          <div className="hidden lg:flex flex-col flex-1 max-w-3xl lg:pr-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 w-fit mb-4 xl:mb-6 group"
            >
              <img
                src="/logo.png"
                alt="Insydz Logo"
                className="w-10 h-10 xl:w-12 xl:h-12 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-2xl xl:text-3xl font-bold text-white tracking-tight">
                Insydz
              </span>
            </Link>

            {/* Heading */}
            <h1 className="text-[36px] xl:text-[46px] font-extrabold text-white leading-[1.1] mb-3 xl:mb-5 tracking-tight">
              Sell smarter on Amazon & Flipkart
            </h1>

            {/* Subtext */}
            <p className="text-white/80 dark:text-slate-300 text-base xl:text-lg leading-relaxed mb-4 xl:mb-6 max-w-2xl">
              Real-time pricing intelligence, AI market gap analysis, and review
              insights so you always know{" "}
              <strong className="text-white font-semibold">
                what to sell, where to price
              </strong>
              , and what competitors are missing.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 xl:mb-6">
              {[
                "Discover untapped niches with AI",
                "Know if your price is winning",
                "Get alerted before stock runs out",
                "Respond to bad reviews with AI",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 xl:w-5 xl:h-5 text-white/80 dark:text-slate-400 flex-shrink-0" />
                  <span className="text-xs xl:text-sm font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-4 xl:mb-6">
              <ExpertButton
                label="Talk to our experts"
                email="support@insydz.com"
                subject="Support Request – Insydz"
                body="Hi Insydz team,%0A%0AI have a question about..."
              />
              {/* <ExpertButton
                label="Talk to our experts"
                href="/contact"
                newTab={false}
              /> */}
              <VideoButton
                label="Watch video guide"
                href="https://www.youtube.com/watch?v=zZSPU5niazQ"
              />
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/20 dark:bg-white/10 mb-4 xl:mb-5" />

            {/* Stats */}
            <div className="flex items-center gap-10">
              <div>
                <div className="text-2xl xl:text-3xl font-extrabold text-white mb-1">
                  2,400+
                </div>
                <div className="text-white/70 dark:text-slate-400 text-xs">
                  Active sellers
                </div>
              </div>
              <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
              <div>
                <div className="text-2xl xl:text-3xl font-extrabold text-white mb-1">
                  ₹47Cr+
                </div>
                <div className="text-white/70 dark:text-slate-400 text-xs">
                  Opportunities found
                </div>
              </div>
              <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
              <div>
                <div className="text-2xl xl:text-3xl font-extrabold text-white mb-1">
                  50+
                </div>
                <div className="text-white/70 dark:text-slate-400 text-xs">
                  Intelligence tools
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Panel: Form ── */}
          <div className="w-full lg:w-[480px] shrink-0 flex justify-center">
            <div className="w-full max-w-sm">
              {/* Mobile logo */}
              <div className="flex lg:hidden flex-col items-center mb-8">
                <Link href="/" className="flex flex-col items-center group">
                  <img
                    src="/logo.png"
                    alt="Insydz"
                    className="w-14 h-14 object-contain mb-2 transition-transform group-hover:scale-110"
                  />
                  <span className="text-xl font-bold text-white">Insydz</span>
                </Link>
              </div>

              {/* White card */}
              <div className="rounded-2xl p-6 xl:p-8 bg-white dark:bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-[7px] h-[7px] rounded-full bg-blue-500 animate-pulse"
                    style={{ boxShadow: "0 0 8px rgba(59,130,246,0.5)" }}
                  />
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 tracking-widest uppercase font-bold">
                    Secure access
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                  Sign in to your analytics dashboard
                </p>

                {/* Error */}
                {errorMessage && (
                  <Alert
                    variant="destructive"
                    icon={<AlertCircle className="h-4 w-4" />}
                    description={errorMessage}
                    className="mb-5"
                  />
                )}

                {mfaStep ? (
                  <form onSubmit={handleMfaSubmit} className="space-y-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={mfaCode}
                        onChange={setMfaCode}
                      >
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

                    <button
                      type="submit"
                      disabled={isLoading || mfaCode.length !== 6}
                      className="w-full h-12 mt-4 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify Code"
                      )}
                    </button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setMfaStep(false)}
                        className="text-xs text-gray-500 hover:text-blue-600"
                      >
                        Cancel and return to login
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Google SSO Login Button */}
                    <div className="mb-4">
                      <GoogleLoginButton rememberMe={rememberMe} />
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-4">
                      <div className="w-full border-t border-gray-200 dark:border-slate-800" />
                      <span className="absolute bg-white dark:bg-[#0f172a] px-3 text-[11px] text-gray-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
                        or continue with email
                      </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleInputChange("email")}
                          disabled={isLoading}
                          required
                          className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Password
                        </Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange("password")}
                          disabled={isLoading}
                          required
                          className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                        />
                      </div>

                      {/* Remember + Forgot */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(c) => setRememberMe(c === true)}
                            disabled={isLoading}
                            className="border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <Label
                            htmlFor="remember"
                            className="text-xs text-gray-600 dark:text-slate-400 font-medium cursor-pointer"
                          >
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          onClick={handleForgotPasswordClick}
                          disabled={isLoading}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>
                  </>
                )}

                {/* Signup link */}
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 text-center space-y-3">
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Secure authentication with session management
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Full Width Footer ── */}
      <div className="hidden lg:flex w-full bg-white dark:bg-slate-900 py-5 px-6 sm:px-12 lg:px-20 items-center justify-between gap-4 mt-auto border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="text-xs font-bold text-[#8a94a6] dark:text-slate-500 tracking-widest uppercase">
          Trusted across India
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-[#4b5563] dark:text-slate-400">
            <div className="w-6 h-6 bg-[#f0f4f8] dark:bg-slate-800 rounded flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-[#5e6a7e] dark:text-slate-400" />
            </div>
            <span>
              <strong className="text-black dark:text-white font-bold">
                Amazon.in
              </strong>{" "}
              sellers
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4b5563] dark:text-slate-400">
            <div className="w-6 h-6 bg-[#f0f4f8] dark:bg-slate-800 rounded flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2874F0]" />
            </div>
            <span>
              <strong className="text-black dark:text-white font-bold">
                Flipkart
              </strong>{" "}
              sellers
            </span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2 text-sm text-[#4b5563] dark:text-slate-400">
            <div className="w-6 h-6 bg-[#f0f4f8] dark:bg-slate-800 rounded flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <span>
              <strong className="text-black dark:text-white font-bold">
                4.8 / 5
              </strong>{" "}
              average rating
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4b5563] dark:text-slate-400">
            <div className="w-6 h-6 bg-[#f0f4f8] dark:bg-slate-800 rounded flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span>
              <strong className="text-black dark:text-white font-bold">
                ₹47 Crore
              </strong>{" "}
              in opportunities found
            </span>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Dialog ── */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md bg-[#0d1628] border-[#AAF0FF]/15 text-white">
          {/* Step dots */}
          <div className="flex gap-2 mb-1">
            {["email", "otp", "password"].map((s, i) => (
              <div
                key={s}
                className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                style={{
                  background:
                    (resetStep === "otp" && i <= 1) ||
                    (resetStep === "password" && i <= 2) ||
                    (resetStep === "email" && i === 0)
                      ? "#AAF0FF"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>

          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {resetStep === "email" && "🔐 Forgot Password"}
              {resetStep === "otp" && "📱 Verify OTP"}
              {resetStep === "password" && "🔑 Set New Password"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {resetStep === "email" &&
                "Enter your email to receive an SMS OTP on your registered phone"}
              {resetStep === "otp" &&
                "Enter the 6-digit SMS code sent to your mobile number"}
              {resetStep === "password" &&
                "Create a strong new password for your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {resetStep === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 dark:text-white/50">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isProcessing}
                  className="bg-white dark:bg-white/[0.04] border-slate-200 dark:border-[#AAF0FF]/12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35"
                />
              </div>
            )}

            {resetStep === "otp" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 dark:text-white/50">
                    OTP Code
                  </Label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    disabled={isProcessing}
                    className="text-center text-2xl tracking-[12px] font-bold bg-white dark:bg-white/[0.04] border-slate-200 dark:border-[#AAF0FF]/12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35"
                  />
                  <p className="text-xs text-white/30 text-center">
                    OTP sent to {forgotEmail}
                  </p>
                </div>
                <div className="flex justify-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-white/30">
                      Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={isProcessing}
                      className="flex items-center gap-1 text-xs text-[#AAF0FF] bg-transparent border-none cursor-pointer hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}

            {resetStep === "password" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    disabled={isProcessing}
                    className="bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    disabled={isProcessing}
                    className="bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowForgotDialog(false);
                setResetStep("email");
              }}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm text-white/50 bg-white/[0.05] border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            {resetStep === "email" && (
              <button
                onClick={handleRequestOTP}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)",
                }}
              >
                {isProcessing ? "Sending..." : "Send OTP"}
              </button>
            )}
            {resetStep === "otp" && (
              <button
                onClick={handleVerifyOTP}
                disabled={isProcessing || otp.length !== 6}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)",
                }}
              >
                {isProcessing ? "Verifying..." : "Verify OTP"}
              </button>
            )}
            {resetStep === "password" && (
              <button
                onClick={handleResetPassword}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)",
                }}
              >
                {isProcessing ? "Resetting..." : "Reset Password"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
