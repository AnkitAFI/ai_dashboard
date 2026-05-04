"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// TODO: Replace with Next.js auth context once migrated
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com";

// cookie helpers
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
}

export default function VerifyEmail() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = getCookie("verify_email");
    if (!storedEmail) {
      router.push("/signup");
      return;
    }
    setEmail(storedEmail);
  }, []);

  // countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      // clear verify_email cookie
      deleteCookie("verify_email");

      // session cookie set by backend, refresh user
      await refreshUser();
      
      toast({
        title: "Email verified!",
        description: "Welcome to Insydz!",
      });

      // Navigate to dashboard
      router.push("/dashboard");

    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Invalid or expired OTP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to resend OTP");
      }

      toast({
        title: "OTP resent",
        description: `New code sent to ${email}`,
      });

      setResendCooldown(60);

    } catch (err: any) {
      toast({
        title: "Failed to resend",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Insydz Logo" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-1">Insydz</h1>
        </div>

        <Card className="border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Check your inbox and spam folder
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify email"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isResending
                      ? "Sending..."
                      : "Resend code"}
                </Button>
              </div>

              <div className="text-center pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Wrong email?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-primary font-semibold"
                    onClick={() => {
                      deleteCookie("verify_email");
                      router.push("/signup");
                    }}
                  >
                    Back to signup
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
