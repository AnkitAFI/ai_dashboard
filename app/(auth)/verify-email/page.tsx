// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// // TODO: Replace with Next.js auth context once migrated
// import { useAuth } from "@/lib/auth-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com";

// // cookie helpers
// function getCookie(name: string): string | null {
//   const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//   return match ? decodeURIComponent(match[2]) : null;
// }

// function deleteCookie(name: string) {
//   document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
// }

// export default function VerifyEmail() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const { refreshUser } = useAuth();
//   const [otp, setOtp] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     const storedEmail = getCookie("verify_email");
//     if (!storedEmail) {
//       router.push("/signup");
//       return;
//     }
//     setEmail(storedEmail);
//   }, []);

//   // countdown timer for resend button
//   useEffect(() => {
//     if (resendCooldown <= 0) return;
//     const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
//     return () => clearTimeout(timer);
//   }, [resendCooldown]);

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (otp.length !== 6) {
//       toast({
//         title: "Invalid OTP",
//         description: "Please enter the 6-digit code.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Verification failed");
//       }

//       // clear verify_email cookie
//       deleteCookie("verify_email");

//       // session cookie set by backend, refresh user
//       await refreshUser();
      
//       toast({
//         title: "Email verified!",
//         description: "Welcome to Insydz!",
//       });

//       // Navigate to dashboard
//       router.push("/dashboard");

//     } catch (err: any) {
//       toast({
//         title: "Verification failed",
//         description: err.message || "Invalid or expired OTP.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (resendCooldown > 0) return;
//     setIsResending(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Failed to resend OTP");
//       }

//       toast({
//         title: "OTP resent",
//         description: `New code sent to ${email}`,
//       });

//       setResendCooldown(60);

//     } catch (err: any) {
//       toast({
//         title: "Failed to resend",
//         description: err.message,
//         variant: "destructive"
//       });
//     } finally {
//       setIsResending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <img src="/logo.png" alt="Insydz Logo" className="w-16 h-16 object-contain mx-auto mb-3" />
//           <h1 className="text-3xl font-bold mb-1">Insydz</h1>
//         </div>

//         <Card className="border shadow-xl">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl">Verify your email</CardTitle>
//             <CardDescription>
//               We sent a 6-digit code to <strong>{email}</strong>
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleVerify} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="otp">Verification code</Label>
//                 <Input
//                   id="otp"
//                   placeholder="000000"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
//                   maxLength={6}
//                   className="text-center text-2xl tracking-widest"
//                   disabled={isLoading}
//                   autoFocus
//                 />
//                 <p className="text-xs text-muted-foreground text-center">
//                   Check your inbox and spam folder
//                 </p>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading || otp.length !== 6}
//                 size="lg"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center gap-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Verifying...
//                   </span>
//                 ) : (
//                   "Verify email"
//                 )}
//               </Button>

//               <div className="text-center">
//                 <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleResend}
//                   disabled={isResending || resendCooldown > 0}
//                   className="w-full"
//                 >
//                   {resendCooldown > 0
//                     ? `Resend in ${resendCooldown}s`
//                     : isResending
//                       ? "Sending..."
//                       : "Resend code"}
//                 </Button>
//               </div>

//               <div className="text-center pt-2 border-t">
//                 <p className="text-sm text-muted-foreground">
//                   Wrong email?{" "}
//                   <Button
//                     type="button"
//                     variant="link"
//                     className="p-0 h-auto text-primary font-semibold"
//                     onClick={() => {
//                       deleteCookie("verify_email");
//                       router.push("/signup");
//                     }}
//                   >
//                     Back to signup
//                   </Button>
//                 </p>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }



"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Verification failed");
      deleteCookie("verify_email");
      await refreshUser();
      toast({ title: "Email verified!", description: "Welcome to Insydz!" });
      router.push("/dashboard");
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message || "Invalid or expired OTP.", variant: "destructive" });
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
      if (!response.ok) throw new Error(data.detail || "Failed to resend OTP");
      toast({ title: "OTP resent", description: `New code sent to ${email}` });
      setResendCooldown(60);
    } catch (err: any) {
      toast({ title: "Failed to resend", description: err.message, variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080e1c] p-4">

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(rgba(170,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(170,240,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
        {/* Radial glows */}
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(170,240,255,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 70%, rgba(99,102,241,0.06) 0%, transparent 70%)",
          }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <a href="/" className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ background: "rgba(170,240,255,0.08)", border: "1px solid rgba(170,240,255,0.18)" }}>
              <img src="/logo.png" alt="Insydz" className="w-9 h-9 object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Insydz</span>
          </a>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(170,240,255,0.11)",
            boxShadow: "0 0 60px rgba(170,240,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-[7px] h-[7px] rounded-full bg-[#AAF0FF] animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(170,240,255,0.9)" }} />
            <span className="text-[10px] text-[#AAF0FF] tracking-widest uppercase font-medium">Email verification</span>
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Check your inbox</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="text-[#AAF0FF]/80 font-medium">{email}</span>
          </p>

          {/* Email icon visual */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(170,240,255,0.06)",
                  border: "1px solid rgba(170,240,255,0.15)",
                }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AAF0FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl animate-ping"
                style={{ border: "1px solid rgba(170,240,255,0.15)", animationDuration: "2.5s" }} />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">

            {/* OTP input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-white/50">Verification code</Label>
              <Input
                id="otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                disabled={isLoading}
                autoFocus
                className="h-14 text-center text-2xl tracking-[14px] font-bold bg-white/[0.04] border-[#AAF0FF]/10 text-white placeholder:text-white/15 placeholder:tracking-normal focus-visible:ring-[#AAF0FF]/20 focus-visible:border-[#AAF0FF]/35 rounded-xl font-mono"
              />
              <p className="text-[11px] text-white/25 text-center">Check your inbox and spam folder</p>
            </div>

            {/* OTP progress dots */}
            <div className="flex justify-center gap-2">
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    background: i < otp.length ? "#AAF0FF" : "rgba(255,255,255,0.1)",
                    boxShadow: i < otp.length ? "0 0 6px rgba(170,240,255,0.6)" : "none",
                  }} />
              ))}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full h-12 rounded-xl font-bold text-[#051020] text-sm transition-all duration-200 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)",
                boxShadow: otp.length === 6 ? "0 0 24px rgba(170,240,255,0.25)" : "none",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#051020]/30 border-t-[#051020] rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : "Verify email"}
            </button>

            {/* Resend */}
            <div className="text-center space-y-2">
              <p className="text-xs text-white/30">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(170,240,255,0.1)",
                  color: resendCooldown > 0 ? "rgba(255,255,255,0.3)" : "rgba(170,240,255,0.8)",
                }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : isResending
                  ? "Sending..."
                  : "Resend code"}
              </button>
            </div>

            {/* Back to signup */}
            <div className="pt-3 border-t border-white/[0.06] text-center">
              <p className="text-xs text-white/30">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => { deleteCookie("verify_email"); router.push("/signup"); }}
                  className="text-[#AAF0FF] font-semibold bg-transparent border-none cursor-pointer hover:underline text-xs"
                >
                  Back to signup
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}