import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Mail, Lock, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// Environment config
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshUser } = useAuth(); // ✅ Changed from login to refreshUser
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot Password Flow States
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Login Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔍 Attempting login for:", formData.email);

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        credentials: "include", // ✅ Important: sends cookies
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember_me: rememberMe
        }),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Login error:", errorData);

        if (response.status === 404) {
          setErrorMessage("No account found with this email. Please sign up first.");
        } else if (response.status === 401) {
          setErrorMessage("Incorrect password. Click 'Forgot Password' to reset.");
        } else if (response.status === 403) {
          const detail = errorData.detail || "";
          if (detail.includes("verify your email")) {
            document.cookie = `verify_email=${formData.email}; path=/; max-age=600; SameSite=Strict`;
            toast({
              title: "Email not verified",
              description: "Please verify your email to continue.",
              variant: "destructive"
            });
            setIsLoading(false);
            setLocation("/verify-email");
            return;
          } else {
            setErrorMessage("Account is deactivated. Please contact support.");
          }
        }
        else {
          setErrorMessage(errorData.detail || "Login failed. Please try again.");
        }

        setIsLoading(false);
        return;
      }

      // Login successful - backend has set the session cookie
      const data = await response.json();
      console.log("✅ Login successful");

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      // ✅ Refresh user data from session cookie, then redirect
      await refreshUser();
      setLocation("/dashboard");

    } catch (error: any) {
      console.error("❌ Network error:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!forgotEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent! 📧",
        description: "Please check your email for the 6-digit OTP code",
      });

      setResetStep('otp');
      startOtpTimer();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP code",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid OTP");
      }

      toast({
        title: "OTP Verified! ✅",
        description: "Now set your new password",
      });

      setResetStep('password');

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Password required",
        description: "Please enter and confirm your new password",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password-with-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otp,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Password reset failed");
      }

      toast({
        title: "Password Reset Successful! 🎉",
        description: "You can now login with your new password",
      });

      // Reset all states
      setShowForgotDialog(false);
      setResetStep('email');
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to resend OTP");
      }

      toast({
        title: "OTP Resent! 📧",
        description: "A new OTP has been sent to your email",
      });

      setOtp("");
      startOtpTimer();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // OTP Timer
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

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrorMessage("");
  };

  const handleForgotPasswordClick = () => {
    setForgotEmail(formData.email);
    setResetStep('email');
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowForgotDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex flex-col items-center group">
              <img
                src="/logo.png"
                alt="Insydz Logo"
                className="w-20 h-20 object-contain mb-3 transition-transform group-hover:scale-110"
              />
              <h1 className="text-3xl font-bold text-foreground mb-1">Insydz</h1>
            </a>
          </Link>

          <p className="text-muted-foreground">
            Real-time insights from your review data
          </p>
        </div>

        <Card className="border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your analytics dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {errorMessage && (
              <Alert
                variant="destructive"
                icon={<AlertCircle className="h-4 w-4" />}
                description={errorMessage}
              />
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-blue-700 hover:text-blue-800 font-medium"
                  onClick={handleForgotPasswordClick}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup">
                  <Button variant="link" className="p-0 h-auto text-blue-700 hover:text-blue-800 font-semibold">
                    Create account
                  </Button>
                </Link>
              </p>
            </div>

            {/* Info Note */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Secure authentication with session management
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Powered by Insydz</p>
        </div>
      </div>

      {/* Forgot Password Dialog with OTP Flow */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {resetStep === 'email' && '🔐 Forgot Password'}
              {resetStep === 'otp' && '📧 Verify OTP'}
              {resetStep === 'password' && '🔑 Set New Password'}
            </DialogTitle>
            <DialogDescription>
              {resetStep === 'email' && 'Enter your email to receive an OTP code'}
              {resetStep === 'otp' && 'Enter the 6-digit code sent to your email'}
              {resetStep === 'password' && 'Create a strong new password for your account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step 1: Email Input */}
            {resetStep === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {resetStep === 'otp' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp-input">OTP Code</Label>
                  <Input
                    id="otp-input"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-bold"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    OTP sent to {forgotEmail}
                  </p>
                </div>

                <div className="flex justify-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={isProcessing}
                      className="text-sm"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Resend OTP
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Step 3: New Password */}
            {resetStep === 'password' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      className="pl-10"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      className="pl-10"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowForgotDialog(false);
                setResetStep('email');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            {resetStep === 'email' && (
              <Button
                onClick={handleRequestOTP}
                disabled={isProcessing}
              >
                {isProcessing ? "Sending..." : "Send OTP"}
              </Button>
            )}

            {resetStep === 'otp' && (
              <Button
                onClick={handleVerifyOTP}
                disabled={isProcessing || otp.length !== 6}
              >
                {isProcessing ? "Verifying..." : "Verify OTP"}
              </Button>
            )}

            {resetStep === 'password' && (
              <Button
                onClick={handleResetPassword}
                disabled={isProcessing}
              >
                {isProcessing ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
