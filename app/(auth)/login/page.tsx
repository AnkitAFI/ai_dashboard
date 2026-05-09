// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// // TODO: Replace with Next.js auth context once migrated
// import { useAuth } from "@/lib/auth-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { AlertCircle, Mail, Lock, RefreshCw } from "lucide-react";
// import { Alert } from "@/components/ui/alert";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// // Environment config
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function Login() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const { refreshUser } = useAuth(); // ✅ Changed from login to refreshUser
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   // Forgot Password Flow States
//   const [showForgotDialog, setShowForgotDialog] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState("");
//   const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [otpTimer, setOtpTimer] = useState(0);

//   // Login Handler
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMessage("");

//     if (!formData.email || !formData.password) {
//       setErrorMessage("Please fill in all required fields.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       console.log("🔍 Attempting login for:", formData.email);

//       const response = await fetch(`${API_BASE_URL}/users/login`, {
//         method: "POST",
//         credentials: "include", // ✅ Important: sends cookies
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//           remember_me: rememberMe
//         }),
//       });

//       console.log("📥 Response status:", response.status);

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("❌ Login error:", errorData);

//         if (response.status === 404) {
//           setErrorMessage("No account found with this email. Please sign up first.");
//         } else if (response.status === 401) {
//           setErrorMessage("Incorrect password. Click 'Forgot Password' to reset.");
//         } else if (response.status === 403) {
//           const detail = errorData.detail || "";
//           if (detail.includes("verify your email")) {
//             document.cookie = `verify_email=${formData.email}; path=/; max-age=600; SameSite=Strict`;
//             toast({
//               title: "Email not verified",
//               description: "Please verify your email to continue.",
//               variant: "destructive"
//             });
//             setIsLoading(false);
//             router.push("/verify-email");
//             return;
//           } else {
//             setErrorMessage("Account is deactivated. Please contact support.");
//           }
//         }
//         else {
//           setErrorMessage(errorData.detail || "Login failed. Please try again.");
//         }

//         setIsLoading(false);
//         return;
//       }

//       // Login successful - backend has set the session cookie
//       const data = await response.json();
//       console.log("✅ Login successful");

//       toast({
//         title: "Welcome back!",
//         description: "Successfully logged in.",
//       });
//       // ✅ Refresh user data from session cookie, then redirect
//       await refreshUser();
//       router.push("/dashboard");

//     } catch (error: any) {
//       console.error("❌ Network error:", error);
//       setErrorMessage("Network error. Please check your connection and try again.");
//       setIsLoading(false);
//     }
//   };

//   // Step 1: Request OTP
//   const handleRequestOTP = async () => {
//     if (!forgotEmail) {
//       toast({
//         title: "Email required",
//         description: "Please enter your email address",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: forgotEmail }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Failed to send OTP");
//       }

//       toast({
//         title: "OTP Sent! 📧",
//         description: "Please check your email for the 6-digit OTP code",
//       });

//       setResetStep('otp');
//       startOtpTimer();

//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const handleVerifyOTP = async () => {
//     if (!otp || otp.length !== 6) {
//       toast({
//         title: "Invalid OTP",
//         description: "Please enter the 6-digit OTP code",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: forgotEmail,
//           otp: otp
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Invalid OTP");
//       }

//       toast({
//         title: "OTP Verified! ✅",
//         description: "Now set your new password",
//       });

//       setResetStep('password');

//     } catch (error: any) {
//       toast({
//         title: "Verification Failed",
//         description: error.message,
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Step 3: Reset Password
//   const handleResetPassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       toast({
//         title: "Password required",
//         description: "Please enter and confirm your new password",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast({
//         title: "Passwords don't match",
//         description: "Please make sure both passwords match",
//         variant: "destructive"
//       });
//       return;
//     }

//     if (newPassword.length < 6) {
//       toast({
//         title: "Password too short",
//         description: "Password must be at least 6 characters",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/reset-password-with-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: forgotEmail,
//           otp: otp,
//           new_password: newPassword
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Password reset failed");
//       }

//       toast({
//         title: "Password Reset Successful! 🎉",
//         description: "You can now login with your new password",
//       });

//       // Reset all states
//       setShowForgotDialog(false);
//       setResetStep('email');
//       setForgotEmail("");
//       setOtp("");
//       setNewPassword("");
//       setConfirmPassword("");

//     } catch (error: any) {
//       toast({
//         title: "Reset Failed",
//         description: error.message,
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Resend OTP
//   const handleResendOTP = async () => {
//     setIsProcessing(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: forgotEmail }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || "Failed to resend OTP");
//       }

//       toast({
//         title: "OTP Resent! 📧",
//         description: "A new OTP has been sent to your email",
//       });

//       setOtp("");
//       startOtpTimer();

//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // OTP Timer
//   const startOtpTimer = () => {
//     setOtpTimer(60);
//     const interval = setInterval(() => {
//       setOtpTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleInputChange = (field: string) => (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setFormData(prev => ({ ...prev, [field]: e.target.value }));
//     setErrorMessage("");
//   };

//   const handleForgotPasswordClick = () => {
//     setForgotEmail(formData.email);
//     setResetStep('email');
//     setOtp("");
//     setNewPassword("");
//     setConfirmPassword("");
//     setShowForgotDialog(true);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo and Header */}
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex flex-col items-center group">
//             <img
//               src="/logo.png"
//               alt="Insydz Logo"
//               className="w-20 h-20 object-contain mb-3 transition-transform group-hover:scale-110"
//             />
//             <h1 className="text-3xl font-bold text-foreground mb-1">Insydz</h1>
//           </Link>

//           <p className="text-muted-foreground">
//             Real-time insights from your review data
//           </p>
//         </div>

//         <Card className="border shadow-xl">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl">Welcome Back</CardTitle>
//             <CardDescription>
//               Sign in to access your analytics dashboard
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-6">
//             {/* Error Alert */}
//             {errorMessage && (
//               <Alert
//                 variant="destructive"
//                 icon={<AlertCircle className="h-4 w-4" />}
//                 description={errorMessage}
//               />
//             )}

//             {/* Login Form */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="your@email.com"
//                   value={formData.email}
//                   onChange={handleInputChange("email")}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={handleInputChange("password")}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="remember"
//                     checked={rememberMe}
//                     onCheckedChange={(checked) => setRememberMe(checked === true)}
//                     disabled={isLoading}
//                   />
//                   <Label htmlFor="remember" className="cursor-pointer">
//                     Remember me
//                   </Label>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="link"
//                   className="p-0 h-auto text-sm text-blue-700 hover:text-blue-800 font-medium"
//                   onClick={handleForgotPasswordClick}
//                   disabled={isLoading}
//                 >
//                   Forgot password?
//                 </Button>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading}
//                 size="lg"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center gap-2">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Signing in...
//                   </span>
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>

//             {/* Signup Link */}
//             <div className="text-center">
//               <p className="text-sm text-muted-foreground">
//                 Don't have an account?{" "}
//                 <Link href="/signup">
//                   <Button variant="link" className="p-0 h-auto text-blue-700 hover:text-blue-800 font-semibold">
//                     Create account
//                   </Button>
//                 </Link>
//               </p>
//             </div>

//             {/* Info Note */}
//             <div className="text-center pt-4 border-t">
//               <p className="text-xs text-muted-foreground">
//                 Secure authentication with session management
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Footer Links */}
//         <div className="text-center mt-6 text-sm text-muted-foreground">
//           <p>Powered by Insydz</p>
//         </div>
//       </div>

//       {/* Forgot Password Dialog with OTP Flow */}
//       <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {resetStep === 'email' && '🔐 Forgot Password'}
//               {resetStep === 'otp' && '📧 Verify OTP'}
//               {resetStep === 'password' && '🔑 Set New Password'}
//             </DialogTitle>
//             <DialogDescription>
//               {resetStep === 'email' && 'Enter your email to receive an OTP code'}
//               {resetStep === 'otp' && 'Enter the 6-digit code sent to your email'}
//               {resetStep === 'password' && 'Create a strong new password for your account'}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             {/* Step 1: Email Input */}
//             {resetStep === 'email' && (
//               <div className="space-y-2">
//                 <Label htmlFor="forgot-email">Email Address</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="forgot-email"
//                     type="email"
//                     placeholder="your@email.com"
//                     value={forgotEmail}
//                     onChange={(e) => setForgotEmail(e.target.value)}
//                     className="pl-10"
//                     disabled={isProcessing}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Step 2: OTP Input */}
//             {resetStep === 'otp' && (
//               <>
//                 <div className="space-y-2">
//                   <Label htmlFor="otp-input">OTP Code</Label>
//                   <Input
//                     id="otp-input"
//                     type="text"
//                     placeholder="123456"
//                     value={otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//                       setOtp(value);
//                     }}
//                     maxLength={6}
//                     className="text-center text-2xl tracking-widest font-bold"
//                     disabled={isProcessing}
//                   />
//                   <p className="text-xs text-muted-foreground text-center">
//                     OTP sent to {forgotEmail}
//                   </p>
//                 </div>

//                 <div className="flex justify-center">
//                   {otpTimer > 0 ? (
//                     <p className="text-sm text-muted-foreground">
//                       Resend OTP in {otpTimer}s
//                     </p>
//                   ) : (
//                     <Button
//                       variant="link"
//                       onClick={handleResendOTP}
//                       disabled={isProcessing}
//                       className="text-sm"
//                     >
//                       <RefreshCw className="w-3 h-3 mr-1" />
//                       Resend OTP
//                     </Button>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Step 3: New Password */}
//             {resetStep === 'password' && (
//               <>
//                 <div className="space-y-2">
//                   <Label htmlFor="new-password">New Password</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="new-password"
//                       type="password"
//                       placeholder="Enter new password"
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       minLength={6}
//                       className="pl-10"
//                       disabled={isProcessing}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirm-password">Confirm Password</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="confirm-password"
//                       type="password"
//                       placeholder="Confirm new password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       minLength={6}
//                       className="pl-10"
//                       disabled={isProcessing}
//                     />
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowForgotDialog(false);
//                 setResetStep('email');
//               }}
//               disabled={isProcessing}
//             >
//               Cancel
//             </Button>

//             {resetStep === 'email' && (
//               <Button
//                 onClick={handleRequestOTP}
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Sending..." : "Send OTP"}
//               </Button>
//             )}

//             {resetStep === 'otp' && (
//               <Button
//                 onClick={handleVerifyOTP}
//                 disabled={isProcessing || otp.length !== 6}
//               >
//                 {isProcessing ? "Verifying..." : "Verify OTP"}
//               </Button>
//             )}

//             {resetStep === 'password' && (
//               <Button
//                 onClick={handleResetPassword}
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Resetting..." : "Reset Password"}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "otp" | "password">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, remember_me: rememberMe }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setErrorMessage("No account found with this email. Please sign up first.");
        } else if (response.status === 401) {
          setErrorMessage("Incorrect password. Click 'Forgot Password' to reset.");
        } else if (response.status === 403) {
          const detail = errorData.detail || "";
          if (detail.includes("verify your email")) {
            document.cookie = `verify_email=${formData.email}; path=/; max-age=600; SameSite=Strict`;
            toast({ title: "Email not verified", description: "Please verify your email to continue.", variant: "destructive" });
            setIsLoading(false);
            router.push("/verify-email");
            return;
          } else {
            setErrorMessage("Account is deactivated. Please contact support.");
          }
        } else {
          setErrorMessage(errorData.detail || "Login failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      await refreshUser();
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!forgotEmail) { toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" }); return; }
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to send OTP");
      toast({ title: "OTP Sent! 📧", description: "Please check your email for the 6-digit OTP code" });
      setResetStep("otp");
      startOtpTimer();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) { toast({ title: "Invalid OTP", description: "Please enter the 6-digit OTP code", variant: "destructive" }); return; }
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail, otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Invalid OTP");
      toast({ title: "OTP Verified! ✅", description: "Now set your new password" });
      setResetStep("password");
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { toast({ title: "Password required", description: "Please enter and confirm your new password", variant: "destructive" }); return; }
    if (newPassword !== confirmPassword) { toast({ title: "Passwords don't match", description: "Please make sure both passwords match", variant: "destructive" }); return; }
    if (newPassword.length < 6) { toast({ title: "Password too short", description: "Password must be at least 6 characters", variant: "destructive" }); return; }
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password-with-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail, otp, new_password: newPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Password reset failed");
      toast({ title: "Password Reset Successful! 🎉", description: "You can now login with your new password" });
      setShowForgotDialog(false);
      setResetStep("email");
      setForgotEmail(""); setOtp(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleResendOTP = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to resend OTP");
      toast({ title: "OTP Resent! 📧", description: "A new OTP has been sent to your email" });
      setOtp("");
      startOtpTimer();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrorMessage("");
  };

  const handleForgotPasswordClick = () => {
    setForgotEmail(formData.email);
    setResetStep("email");
    setOtp(""); setNewPassword(""); setConfirmPassword("");
    setShowForgotDialog(true);
  };

  return (
    <div className="min-h-screen flex bg-[#080e1c]">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: "linear-gradient(145deg, #050c1a 0%, #091525 50%, #060e1c 100%)" }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(170,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(170,240,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Radial glows */}
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 55% 55% at 25% 35%, rgba(170,240,255,0.07) 0%, transparent 70%), radial-gradient(ellipse 45% 45% at 75% 65%, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }} />

        {/* Neural network SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.15">
            <line x1="80" y1="130" x2="230" y2="210" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="230" y1="210" x2="390" y2="160" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="390" y1="160" x2="520" y2="270" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="230" y1="210" x2="300" y2="350" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="390" y1="160" x2="300" y2="350" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="300" y1="350" x2="170" y2="470" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="300" y1="350" x2="450" y2="440" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="520" y1="270" x2="450" y2="440" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="170" y1="470" x2="310" y2="570" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="450" y1="440" x2="310" y2="570" stroke="#AAF0FF" strokeWidth="0.8" />
            <line x1="80" y1="130" x2="170" y2="470" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4,6" />
            <line x1="520" y1="270" x2="310" y2="570" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4,6" />
          </g>
          {[
            [80, 130, 5], [230, 210, 8], [390, 160, 6], [520, 270, 5],
            [300, 350, 11], [170, 470, 7], [450, 440, 6], [310, 570, 8],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#AAF0FF" strokeWidth="1.5" opacity="0.65" />
              <circle cx={cx} cy={cy} r={r! / 2.5} fill="#AAF0FF" opacity="0.5" />
            </g>
          ))}
          {/* Central node with glow ring */}
          <circle cx="300" cy="350" r="18" fill="none" stroke="#AAF0FF" strokeWidth="0.5" opacity="0.18" />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-12 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(170,240,255,0.09)", border: "1px solid rgba(170,240,255,0.22)" }}>
              <Link href="/">
  <img src="/logo.png" alt="Insydz" className="w-7 h-7 object-contain" />
</Link>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Insydz</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
            Real-time insights,{" "}
            <span style={{ color: "#AAF0FF", textShadow: "0 0 40px rgba(170,240,255,0.4)" }}>
              AI-powered
            </span>{" "}
            clarity.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Turn review data into revenue strategy. Insydz gives your business the intelligence layer it's been missing.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              { icon: "⚡", label: "Live analytics" },
              { icon: "🛡", label: "Secure sessions" },
              { icon: "🧠", label: "AI-driven" },
            ].map((pill) => (
              <div key={pill.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/55"
                style={{ background: "rgba(170,240,255,0.06)", border: "1px solid rgba(170,240,255,0.13)" }}>
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 min-h-screen"
        style={{ background: "rgba(7,13,26,0.97)", borderLeft: "1px solid rgba(170,240,255,0.07)" }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
  <Link href="/" className="flex flex-col items-center group">
    <img src="/logo.png" alt="Insydz" className="w-14 h-14 object-contain mb-2 transition-transform group-hover:scale-110" />
    <span className="text-xl font-bold text-white">Insydz</span>
  </Link>
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
              <span className="text-[10px] text-[#AAF0FF] tracking-widest uppercase font-medium">Secure access</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome back</h2>
            <p className="text-white/35 text-sm mb-6">Sign in to your analytics dashboard</p>

            {/* Error */}
            {errorMessage && (
              <Alert variant="destructive" icon={<AlertCircle className="h-4 w-4" />} description={errorMessage} className="mb-5" />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/50">Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={isLoading}
                  required
                  className="h-11 text-sm bg-white/[0.04] border-[#AAF0FF]/10 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20 focus-visible:border-[#AAF0FF]/35 rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/50">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  disabled={isLoading}
                  required
                  className="h-11 text-sm bg-white/[0.04] border-[#AAF0FF]/10 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20 focus-visible:border-[#AAF0FF]/35 rounded-xl"
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
                    className="border-[#AAF0FF]/20 data-[state=checked]:bg-[#AAF0FF] data-[state=checked]:border-[#AAF0FF]"
                  />
                  <Label htmlFor="remember" className="text-xs text-white/40 cursor-pointer">Remember me</Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  disabled={isLoading}
                  className="text-xs text-[#AAF0FF]/80 hover:text-[#AAF0FF] transition-colors bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-[#051020] text-sm transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)",
                  boxShadow: "0 0 24px rgba(170,240,255,0.22)",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#051020]/30 border-t-[#051020] rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            {/* Signup link */}
            <div className="mt-5 pt-5 border-t border-white/[0.06] text-center space-y-3">
              <p className="text-xs text-white/25">Secure authentication with session management</p>
              <p className="text-sm text-white/35">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#AAF0FF] font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Dialog ── */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md bg-[#0d1628] border-[#AAF0FF]/15 text-white">

          {/* Step dots */}
          <div className="flex gap-2 mb-1">
            {["email", "otp", "password"].map((s, i) => (
              <div key={s} className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                style={{
                  background: (resetStep === "otp" && i <= 1) || (resetStep === "password" && i <= 2) || (resetStep === "email" && i === 0)
                    ? "#AAF0FF" : "rgba(255,255,255,0.1)",
                }} />
            ))}
          </div>

          <DialogHeader>
            <DialogTitle className="text-white">
              {resetStep === "email" && "🔐 Forgot Password"}
              {resetStep === "otp" && "📧 Verify OTP"}
              {resetStep === "password" && "🔑 Set New Password"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {resetStep === "email" && "Enter your email to receive an OTP code"}
              {resetStep === "otp" && "Enter the 6-digit code sent to your email"}
              {resetStep === "password" && "Create a strong new password for your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {resetStep === "email" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isProcessing}
                  className="bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20 focus-visible:border-[#AAF0FF]/35"
                />
              </div>
            )}

            {resetStep === "otp" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">OTP Code</Label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    disabled={isProcessing}
                    className="text-center text-2xl tracking-[12px] font-bold bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20"
                  />
                  <p className="text-xs text-white/30 text-center">OTP sent to {forgotEmail}</p>
                </div>
                <div className="flex justify-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-white/30">Resend OTP in {otpTimer}s</p>
                  ) : (
                    <button onClick={handleResendOTP} disabled={isProcessing}
                      className="flex items-center gap-1 text-xs text-[#AAF0FF] bg-transparent border-none cursor-pointer hover:underline">
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
                  <Input type="password" placeholder="Enter new password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} minLength={6} disabled={isProcessing}
                    className="bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Confirm Password</Label>
                  <Input type="password" placeholder="Confirm new password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} disabled={isProcessing}
                    className="bg-white/[0.04] border-[#AAF0FF]/12 text-white placeholder:text-white/20 focus-visible:ring-[#AAF0FF]/20" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <button onClick={() => { setShowForgotDialog(false); setResetStep("email"); }} disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm text-white/50 bg-white/[0.05] border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors">
              Cancel
            </button>
            {resetStep === "email" && (
              <button onClick={handleRequestOTP} disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all"
                style={{ background: "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)" }}>
                {isProcessing ? "Sending..." : "Send OTP"}
              </button>
            )}
            {resetStep === "otp" && (
              <button onClick={handleVerifyOTP} disabled={isProcessing || otp.length !== 6}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)" }}>
                {isProcessing ? "Verifying..." : "Verify OTP"}
              </button>
            )}
            {resetStep === "password" && (
              <button onClick={handleResetPassword} disabled={isProcessing}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#051020] cursor-pointer transition-all"
                style={{ background: "linear-gradient(135deg, #AAF0FF 0%, #7dd8f5 100%)" }}>
                {isProcessing ? "Resetting..." : "Reset Password"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}