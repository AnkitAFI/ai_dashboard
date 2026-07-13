// "use client";
// import { API_BASE_URL } from "@/lib/config";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/lib/auth-context";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { LOCATIONS } from "@/lib/locations";
// import { CheckCircle2, Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";

// interface SignupFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   businessName: string;
//   location: string;
//   businessInterests: string[];
//   mobileNumber: string;
// }

// const BUSINESS_INTERESTS = [
//   { id: "electronics", label: "Electronics & Technology" },
//   { id: "fashion", label: "Fashion & Apparel" },
//   { id: "home", label: "Home & Kitchen" },
//   { id: "beauty", label: "Beauty & Personal Care" },
//   { id: "sports", label: "Sports & Fitness" },
//   { id: "books", label: "Books & Media" },
//   { id: "automotive", label: "Automotive" },
//   { id: "health", label: "Health & Wellness" },
//   { id: "toys", label: "Toys & Games" },
//   { id: "grocery", label: "Grocery & Food" },
//   { id: "office", label: "Office Supplies" },
//   { id: "pet", label: "Pet Supplies" },
// ];

// export default function Signup() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const { refreshUser } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<SignupFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     businessName: "",
//     location: "",
//     businessInterests: [],
//     mobileNumber: "",
//   });
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleInputChange = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleLocationChange = (value: string) => {
//     setFormData((prev) => ({ ...prev, location: value }));
//   };

//   const handleInterestToggle = (interestId: string) => {
//     setFormData((prev) => {
//       const interests = prev.businessInterests.includes(interestId)
//         ? prev.businessInterests.filter((id) => id !== interestId)
//         : [...prev.businessInterests, interestId];
//       return { ...prev, businessInterests: interests };
//     });
//   };

//     const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!agreedToTerms) {
//     toast({ title: "Terms required", description: "Please agree to the Terms.", variant: "destructive" });
//     return;
//   }
//   if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
//     toast({ title: "Missing fields", description: "Fill all required fields.", variant: "destructive" });
//     return;
//   }
//   if (!formData.location) {
//     toast({ title: "Location required", description: "Select your location.", variant: "destructive" });
//     return;
//   }
//   if (formData.businessInterests.length === 0) {
//     toast({ title: "Select interests", description: "Select at least one.", variant: "destructive" });
//     return;
//   }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) { toast({ title: "Invalid Email", description: "Enter valid email.", variant: "destructive" }); return; }
//     if (formData.password.length < 6) { toast({ title: "Password too short", description: "Min 6 characters.", variant: "destructive" }); return; }
//     if (!formData.mobileNumber) { toast({ title: "Mobile number required", description: "Please enter your mobile number.", variant: "destructive" }); return; }

//     const cleanedMobile = formData.mobileNumber.replace(/\s+/g, "").replace(/^(\+91|91)/, "");
//     const mobileRegex = /^[6-9]\d{9}$/;
//     if (!mobileRegex.test(cleanedMobile)) { toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" }); return; }

//      setIsLoading(true);

//   try {
//     const response = await fetch(`${API_BASE_URL}/users/signup`, {
//       method: "POST",
//       credentials: "include",
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify({
//         first_name: formData.firstName,
//         last_name: formData.lastName,
//         email: formData.email,
//         password: formData.password,
//         business_name: formData.businessName || null,
//         location: formData.location,
//         business_interests: formData.businessInterests,
//         mobile_number: cleanedMobile,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       if (response.status === 400 && errorData.detail?.includes("already registered")) {
//         toast({ title: "Email already exists", description: "This email is already registered. Please login instead.", variant: "destructive" });
//       } else {
//         toast({ title: "Signup failed", description: errorData.detail || "An error occurred.", variant: "destructive" });
//       }
//       return;
//     }

//     const userData = await response.json();

//     if (userData.requires_verification) {
//       document.cookie = `verify_email=${userData.email}; path=/; max-age=600; SameSite=Strict`;
//       toast({
//         title: "Check your email",
//         description: `We sent a 6-digit verification code to ${userData.email}`
//       });
//       router.push("/verify-email");
//       return;
//     }

//     // ==================== SUCCESS ====================
//     toast({
//       title: "Account Created!",
//       description: "Welcome to Insydz!"
//     });

//     // 🔥 Non-blocking refresh (removes delay)
//     refreshUser().catch((err) => {
//       console.warn("Refresh user after signup failed (non-critical)", err);
//     });

//     router.push("/dashboard");

//   } catch (err: any) {
//     console.error(err);
//     toast({
//       title: "Signup failed",
//       description: err.message || "An error occurred during signup.",
//       variant: "destructive"
//     });
//   } finally {
//     setIsLoading(false);     // ← Always reset loading
//   }
// };

//   return (
//     <div className="min-h-screen flex flex-col bg-[#2b52cd] dark:bg-slate-950 transition-colors duration-300">

//       {/* ── Theme Toggle ── */}
//       <div className="absolute top-6 right-8 z-50">
//         <button
//           onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
//           className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
//           title="Toggle Theme"
//         >
//           {mounted && (resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-white" />)}
//         </button>
//       </div>

//       <div className="flex-1 flex w-full max-w-[1400px] mx-auto justify-between gap-8">

//       {/* ── Left Panel ── */}
//       <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
//         {/* Main Content */}
//         <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 max-w-3xl">

//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-3 w-fit mb-8 lg:mb-10 group">
//             <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 object-contain transition-transform group-hover:scale-110" />
//             <span className="text-3xl font-bold text-white tracking-tight">Insydz</span>
//           </Link>

//           {/* Heading */}
//           <h1 className="text-[44px] lg:text-[52px] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
//             Your AI analytics journey starts here
//           </h1>

//           {/* Subtext */}
//           <p className="text-white/80 dark:text-slate-300 text-lg leading-relaxed mb-12 max-w-2xl">
//             Join thousands of sellers unlocking the power of review intelligence,
//             AI market gap analysis, and real-time pricing insights.
//           </p>

//           {/* Features Grid */}
//           <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-12">
//             {[
//               "Real-time dashboards",
//               "AI-generated insights",
//               "Localised intelligence",
//               "Secure & private"
//             ].map((feature, i) => (
//               <div key={i} className="flex items-center gap-3 text-white dark:text-slate-200">
//                 <CheckCircle2 className="w-5 h-5 text-white/80 dark:text-slate-400 flex-shrink-0" />
//                 <span className="text-sm font-medium">{feature}</span>
//               </div>
//             ))}
//           </div>

//           {/* Divider */}
//           <div className="w-full h-px bg-white/20 dark:bg-white/10 mb-8" />

//           {/* Stats */}
//           <div className="flex items-center gap-10">
//             <div>
//               <div className="text-3xl font-extrabold text-white mb-1">2,400+</div>
//               <div className="text-white/70 dark:text-slate-400 text-xs">Active sellers</div>
//             </div>
//             <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
//             <div>
//               <div className="text-3xl font-extrabold text-white mb-1">₹47Cr+</div>
//               <div className="text-white/70 dark:text-slate-400 text-xs">Opportunities found</div>
//             </div>
//             <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
//             <div>
//               <div className="text-3xl font-extrabold text-white mb-1">50+</div>
//               <div className="text-white/70 dark:text-slate-400 text-xs">Intelligence tools</div>
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* ── Right Panel: Scrollable Form ── */}
//       <div className="w-full lg:w-[520px] flex justify-center p-8">
//         <div className="w-full max-w-[480px]">

//           {/* Mobile logo */}
//           <div className="flex lg:hidden flex-col items-center mb-8">
//             <Link href="/" className="flex flex-col items-center group">
//               <img src="/logo.png" alt="Insydz" className="w-14 h-14 object-contain mb-2 transition-transform group-hover:scale-110" />
//               <span className="text-xl font-bold text-white">Insydz</span>
//             </Link>
//           </div>

//           {/* White card */}
//           <div className="rounded-2xl p-8 bg-white dark:bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-800 transition-colors duration-300">

//             {/* Eyebrow */}
//             <div className="flex items-center gap-2 mb-1">
//               <span className="w-[7px] h-[7px] rounded-full bg-blue-500 animate-pulse"
//                 style={{ boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
//               <span className="text-[10px] text-blue-600 dark:text-blue-400 tracking-widest uppercase font-bold">New account</span>
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h2>
//             <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Join and get personalised business insights</p>

//             <form onSubmit={handleSubmit} className="space-y-4">

//               {/* Name row */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">First Name *</Label>
//                   <Input
//                     placeholder="John"
//                     value={formData.firstName}
//                     onChange={handleInputChange("firstName")}
//                     disabled={isLoading}
//                     className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Last Name *</Label>
//                   <Input
//                     placeholder="Doe"
//                     value={formData.lastName}
//                     onChange={handleInputChange("lastName")}
//                     disabled={isLoading}
//                     className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                   />
//                 </div>
//               </div>

//               {/* Email */}
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Email *</Label>
//                 <Input
//                   type="email"
//                   placeholder="your@email.com"
//                   value={formData.email}
//                   onChange={handleInputChange("email")}
//                   disabled={isLoading}
//                   className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                 />
//               </div>

//               {/* Mobile */}
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Mobile Number *</Label>
//                 <div className="flex gap-2">
//                   <div className="h-11 px-3 rounded-xl flex items-center text-sm font-medium bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400">
//                     +91
//                   </div>
//                   <Input
//                     type="tel"
//                     placeholder="98765 43210"
//                     value={formData.mobileNumber}
//                     onChange={handleInputChange("mobileNumber")}
//                     disabled={isLoading}
//                     maxLength={10}
//                     className="flex-1 h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                   />
//                 </div>
//                 <p className="text-[11px] text-gray-400 dark:text-slate-500">10-digit Indian mobile number</p>
//               </div>

//               {/* Password */}
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Password *</Label>
//                 <Input
//                   type="password"
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={handleInputChange("password")}
//                   minLength={6}
//                   disabled={isLoading}
//                   className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                 />
//                 <p className="text-[11px] text-gray-400 dark:text-slate-500">Minimum 6 characters</p>
//               </div>

//               {/* Business Name */}
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
//                   Business Name <span className="text-gray-400 dark:text-slate-500">(Optional)</span>
//                 </Label>
//                 <Input
//                   placeholder="Your Business"
//                   value={formData.businessName}
//                   onChange={handleInputChange("businessName")}
//                   disabled={isLoading}
//                   className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
//                 />
//               </div>

//               {/* Location */}
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Location *</Label>
//                 <Select value={formData.location} onValueChange={handleLocationChange} disabled={isLoading}>
//                   <SelectTrigger className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500 rounded-xl data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-slate-500">
//                     <SelectValue placeholder="Select state or city" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white max-h-64">
//                     {LOCATIONS.map((loc) => (
//                       <SelectItem key={loc.value} value={loc.value}
//                         className="text-gray-700 dark:text-slate-300 focus:bg-blue-50 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-white">
//                         {loc.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Business Interests */}
//               <div className="space-y-2">
//                 <div>
//                   <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Business Interests *</Label>
//                   <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Select at least one category</p>
//                 </div>
//                 <div className="rounded-xl p-3 max-h-[180px] overflow-y-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                     {BUSINESS_INTERESTS.map((interest) => (
//                       <div key={interest.id} className="flex items-center gap-2">
//                         <Checkbox
//                           id={interest.id}
//                           checked={formData.businessInterests.includes(interest.id)}
//                           onCheckedChange={() => handleInterestToggle(interest.id)}
//                           disabled={isLoading}
//                           className="border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//                         />
//                         <Label htmlFor={interest.id} className="text-xs text-gray-600 dark:text-slate-400 font-normal cursor-pointer">
//                           {interest.label}
//                         </Label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {formData.businessInterests.length > 0 && (
//                   <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
//                     ✓ {formData.businessInterests.length} selected
//                   </p>
//                 )}
//               </div>

//               {/* Terms */}
//               <div className="flex items-start gap-3 py-1">
//                 <Checkbox
//                   id="terms"
//                   checked={agreedToTerms}
//                   onCheckedChange={(c) => setAgreedToTerms(c === true)}
//                   disabled={isLoading}
//                   className="mt-0.5 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
//                 />
//                 <Label htmlFor="terms" className="text-xs text-gray-500 dark:text-slate-400 cursor-pointer leading-relaxed">
//                   I agree to the{" "}
//                   <a href="/terms-service" target="_blank" rel="noopener noreferrer"
//                     className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>{" "}
//                   and{" "}
//                   <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
//                     className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
//                 </Label>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Creating account...
//                   </span>
//                 ) : "Create Account"}
//               </button>
//             </form>

//             {/* Footer */}
//             <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 text-center space-y-3">
//               <p className="text-xs text-gray-400 dark:text-slate-500">Secure authentication with session management</p>
//               <p className="text-sm text-gray-600 dark:text-slate-400">
//                 Have an account?{" "}
//                 <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LOCATIONS } from "@/lib/locations";
import { CheckCircle2, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import { sanitizeApiError } from "@/lib/sanitize-error";
import ExpertButton from "../components/Expertbutton";
import VideoButton from "../components/Videobutton";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  location: string;
  businessInterests: string[];
  mobileNumber: string;
}

const BUSINESS_INTERESTS = [
  { id: "electronics", label: "Electronics & Technology" },
  { id: "fashion", label: "Fashion & Apparel" },
  { id: "home", label: "Home & Kitchen" },
  { id: "beauty", label: "Beauty & Personal Care" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "books", label: "Books & Media" },
  { id: "automotive", label: "Automotive" },
  { id: "health", label: "Health & Wellness" },
  { id: "toys", label: "Toys & Games" },
  { id: "grocery", label: "Grocery & Food" },
  { id: "office", label: "Office Supplies" },
  { id: "pet", label: "Pet Supplies" },
];


const evaluatePasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "bg-transparent", text: "text-transparent" };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (password.length >= 10) score += 1;

  switch (score) {
    case 1:
      return { score, label: "Weak", color: "bg-red-500", text: "text-red-400" };
    case 2:
      return { score, label: "Fair", color: "bg-orange-500", text: "text-orange-400" };
    case 3:
      return { score, label: "Good", color: "bg-yellow-500", text: "text-yellow-400" };
    case 4:
      return { score, label: "Strong", color: "bg-green-500", text: "text-green-400" };
    default:
      return { score: 0, label: "Weak", color: "bg-red-500", text: "text-red-400" };
  }
};

const generateStrongPassword = () => {
  const length = 12;
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
    location: "",
    businessInterests: [],
    mobileNumber: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const strength = evaluatePasswordStrength(formData.password);

  const handleSuggestPassword = () => {
    const newPassword = generateStrongPassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
    
    navigator.clipboard.writeText(newPassword).then(() => {
      toast({
        title: "Strong Password Suggested",
        description: "A random strong password has been filled and copied to your clipboard!",
      });
    }).catch(() => {
      toast({
        title: "Strong Password Suggested",
        description: `Suggested password: ${newPassword}`,
      });
    });
  };

  const handleInputChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleLocationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, location: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => {
      const interests = prev.businessInterests.includes(interestId)
        ? prev.businessInterests.filter((id) => id !== interestId)
        : [...prev.businessInterests, interestId];
      return { ...prev, businessInterests: interests };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the Terms.",
        variant: "destructive",
      });
      return;
    }
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast({
        title: "Missing fields",
        description: "Fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.location) {
      toast({
        title: "Location required",
        description: "Select your location.",
        variant: "destructive",
      });
      return;
    }
    if (formData.businessInterests.length === 0) {
      toast({
        title: "Select interests",
        description: "Select at least one.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Enter valid email.",
        variant: "destructive",
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Min 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.mobileNumber) {
      toast({
        title: "Mobile number required",
        description: "Please enter your mobile number.",
        variant: "destructive",
      });
      return;
    }

    const cleanedMobile = formData.mobileNumber
      .replace(/\s+/g, "")
      .replace(/^(\+91|91)/, "");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanedMobile)) {
      toast({
        title: "Invalid mobile number",
        description: "Enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          business_name: formData.businessName || null,
          location: formData.location,
          business_interests: formData.businessInterests,
          mobile_number: cleanedMobile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (
          response.status === 400 &&
          errorData.detail?.includes("already registered")
        ) {
          toast({
            title: "Email already exists",
            description:
              "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else if (
          response.status === 400 &&
          errorData.detail?.includes("deleted")
        ) {
          toast({
            title: "Account Deleted",
            description: sanitizeApiError(errorData.detail, "Something went wrong. Please try again."),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: sanitizeApiError(errorData.detail, "An error occurred. Please try again."),
            variant: "destructive",
          });
        }
        return;
      }

      const userData = await response.json();

      if (userData.requires_verification) {
        document.cookie = `verify_email=${userData.email}; path=/; max-age=600; SameSite=Strict`;
        toast({
          title: "Check your email",
          description: `We sent a 6-digit verification code to ${userData.email}`,
        });
        router.push("/verify-email");
        return;
      }

      // ==================== SUCCESS ====================
      toast({
        title: "Account Created!",
        description: "Welcome to Insydz!",
      });

      // 🔥 Non-blocking refresh (removes delay)
      refreshUser().catch((err) => {
        console.warn("Refresh user after signup failed (non-critical)", err);
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Signup failed",
        description: sanitizeApiError(err.message, "An error occurred during signup. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // ← Always reset loading
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#2b52cd] dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
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

      <div className="flex-1 flex w-full max-w-[1400px] mx-auto justify-between gap-8 overflow-hidden min-h-0">
        {/* ── Left Panel ── */}
        <div className="hidden lg:flex flex-col flex-1 relative h-full min-h-0 items-center justify-center">
          {/* Main Content */}
          <div className="flex flex-col px-12 lg:px-20 max-w-3xl w-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 w-fit mb-8 lg:mb-10 group"
            >
              <img
                src="/logo.png"
                alt="Insydz Logo"
                className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-3xl font-bold text-white tracking-tight">
                Insydz
              </span>
            </Link>

            {/* Heading */}
            <h1 className="text-[44px] lg:text-[52px] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Your AI analytics journey starts here
            </h1>

            {/* Subtext */}
            <p className="text-white/80 dark:text-slate-300 text-lg leading-relaxed mb-12 max-w-2xl">
              Join thousands of sellers unlocking the power of review
              intelligence, AI market gap analysis, and real-time pricing
              insights.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-12">
              {[
                "Real-time dashboards",
                "AI-generated insights",
                "Localised intelligence",
                "Secure & private",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white dark:text-slate-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-white/80 dark:text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-8">
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
            <div className="w-full h-px bg-white/20 dark:bg-white/10 mb-8" />

            {/* Stats */}
            <div className="flex items-center gap-10">
              <div>
                <div className="text-3xl font-extrabold text-white mb-1">2,400+</div>
                <div className="text-white/70 dark:text-slate-400 text-xs">Active sellers</div>
              </div>
              <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
              <div>
                <div className="text-3xl font-extrabold text-white mb-1">₹47Cr+</div>
                <div className="text-white/70 dark:text-slate-400 text-xs">Opportunities found</div>
              </div>
              <div className="w-px h-10 bg-white/20 dark:bg-white/10" />
              <div>
                <div className="text-3xl font-extrabold text-white mb-1">50+</div>
                <div className="text-white/70 dark:text-slate-400 text-xs">Intelligence tools</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Scrollable Form ── */}
        <div className="w-full lg:w-[520px] h-full min-h-0 overflow-y-auto overscroll-contain flex justify-center p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-[480px]">
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
            <div className="rounded-2xl p-8 bg-white dark:bg-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-800 transition-colors duration-300">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-[7px] h-[7px] rounded-full bg-blue-500 animate-pulse"
                  style={{ boxShadow: "0 0 8px rgba(59,130,246,0.5)" }}
                />
                <span className="text-[10px] text-blue-600 dark:text-blue-400 tracking-widest uppercase font-bold">
                  New account
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                Create Account
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                Join and get personalised business insights
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      First Name *
                    </Label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      disabled={isLoading}
                      className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      Last Name *
                    </Label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      disabled={isLoading}
                      className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    disabled={isLoading}
                    className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Mobile Number *
                  </Label>
                  <div className="flex gap-2">
                    <div className="h-11 px-3 rounded-xl flex items-center text-sm font-medium bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="98765 43210"
                      value={formData.mobileNumber}
                      onChange={handleInputChange("mobileNumber")}
                      disabled={isLoading}
                      maxLength={10}
                      className="flex-1 h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    10-digit Indian mobile number
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      Password *
                    </Label>
                    <button
                      type="button"
                      onClick={handleSuggestPassword}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Suggest strong password
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      minLength={6}
                      disabled={isLoading}
                      className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 transition-colors duration-300 ${
                            strength.score >= level ? strength.color : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        Minimum 6 characters
                      </p>
                      {strength.label && (
                        <span className={`text-[11px] font-medium ${strength.text}`}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Business Name{" "}
                    <span className="text-gray-400 dark:text-slate-500">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="Your Business"
                    value={formData.businessName}
                    onChange={handleInputChange("businessName")}
                    disabled={isLoading}
                    className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Location *
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={handleLocationChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500 rounded-xl data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-slate-500">
                      <SelectValue placeholder="Select state or city" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white max-h-64">
                      {LOCATIONS.map((loc) => (
                        <SelectItem
                          key={loc.value}
                          value={loc.value}
                          className="text-gray-700 dark:text-slate-300 focus:bg-blue-50 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-white"
                        >
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Business Interests */}
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      Business Interests *
                    </Label>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                      Select at least one category
                    </p>
                  </div>
                  <div className="rounded-xl p-3 max-h-[180px] overflow-y-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {BUSINESS_INTERESTS.map((interest) => (
                        <div
                          key={interest.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={interest.id}
                            checked={formData.businessInterests.includes(
                              interest.id,
                            )}
                            onCheckedChange={() =>
                              handleInterestToggle(interest.id)
                            }
                            disabled={isLoading}
                            className="border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <Label
                            htmlFor={interest.id}
                            className="text-xs text-gray-600 dark:text-slate-400 font-normal cursor-pointer"
                          >
                            {interest.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {formData.businessInterests.length > 0 && (
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      ✓ {formData.businessInterests.length} selected
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 py-1">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c === true)}
                    disabled={isLoading}
                    className="mt-0.5 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs text-gray-500 dark:text-slate-400 cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </Label>
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
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 text-center space-y-3">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Secure authentication with session management
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Spacer to ensure space at the bottom of the scroll container */}
            <div className="h-8 w-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
