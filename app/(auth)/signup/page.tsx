"use client";
import { API_BASE_URL } from "@/lib/config";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LOCATIONS } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

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

  const handleInputChange = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    toast({ title: "Terms required", description: "Please agree to the Terms.", variant: "destructive" }); 
    return; 
  }
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) { 
    toast({ title: "Missing fields", description: "Fill all required fields.", variant: "destructive" }); 
    return; 
  }
  if (!formData.location) { 
    toast({ title: "Location required", description: "Select your location.", variant: "destructive" }); 
    return; 
  }
  if (formData.businessInterests.length === 0) { 
    toast({ title: "Select interests", description: "Select at least one.", variant: "destructive" }); 
    return; 
  }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { toast({ title: "Invalid Email", description: "Enter valid email.", variant: "destructive" }); return; }
    if (formData.password.length < 6) { toast({ title: "Password too short", description: "Min 6 characters.", variant: "destructive" }); return; }
    if (!formData.mobileNumber) { toast({ title: "Mobile number required", description: "Please enter your mobile number.", variant: "destructive" }); return; }

    const cleanedMobile = formData.mobileNumber.replace(/\s+/g, "").replace(/^(\+91|91)/, "");
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanedMobile)) { toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" }); return; }
     setIsLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
      if (response.status === 400 && errorData.detail?.includes("already registered")) {
        toast({ title: "Email already exists", description: "This email is already registered. Please login instead.", variant: "destructive" });
      } else {
        toast({ title: "Signup failed", description: errorData.detail || "An error occurred.", variant: "destructive" });
      }
      return;
    }

    const userData = await response.json();

    if (userData.requires_verification) {
      document.cookie = `verify_email=${userData.email}; path=/; max-age=600; SameSite=Strict`;
      toast({ 
        title: "Check your email", 
        description: `We sent a 6-digit verification code to ${userData.email}` 
      });
      router.push("/verify-email");
      return;
    }

    // ==================== SUCCESS ====================
    toast({ 
      title: "Account Created!", 
      description: "Welcome to Insydz!" 
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
      description: err.message || "An error occurred during signup.", 
      variant: "destructive" 
    });
  } finally {
    setIsLoading(false);     // ← Always reset loading
  }
};



  return (
    <div className="min-h-screen flex bg-background text-foreground">

      {/* ── Left Panel (sticky) ── */}
      <div className="hidden lg:flex w-[340px] sticky top-0 h-screen flex-col justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#050c1a] dark:via-[#091525] dark:to-[#060e1c] border-r border-slate-200/50 dark:border-slate-800/30">

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: "linear-gradient(rgba(170,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(170,240,255,1) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

        {/* Radial glows */}
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 65% 50% at 30% 40%, rgba(170,240,255,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 70% 70%, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }} />

        {/* Neural SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 700" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.14">
            <line x1="40" y1="120" x2="160" y2="200" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="160" y1="200" x2="290" y2="160" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="160" y1="200" x2="180" y2="340" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="290" y1="160" x2="180" y2="340" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="180" y1="340" x2="80" y2="460" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="180" y1="340" x2="280" y2="430" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="80" y1="460" x2="190" y2="560" stroke="#AAF0FF" strokeWidth="0.7" />
            <line x1="280" y1="430" x2="190" y2="560" stroke="#AAF0FF" strokeWidth="0.7" />
          </g>
          {[[40,120,4],[160,200,7],[290,160,5],[180,340,9],[80,460,6],[280,430,5],[190,560,7]].map(([cx,cy,r],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#AAF0FF" strokeWidth="1.2" opacity="0.6" />
              <circle cx={cx} cy={cy} r={r/2.5} fill="#AAF0FF" opacity="0.45" />
            </g>
          ))}
          <circle cx="180" cy="340" r="15" fill="none" stroke="#AAF0FF" strokeWidth="0.4" opacity="0.15" />
        </svg>

        {/* Content */}
        <div className="relative z-10 px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#AAF0FF]/15 border border-blue-500/20 dark:bg-white/5 dark:border-white/10">
              <Link href="/">
                <img src="/logo.png" alt="Insydz" className="w-6 h-6 object-contain" />
              </Link>
            </div>
            <span className="text-xl font-bold text-slate-850 dark:text-white tracking-tight">Insydz</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-850 dark:text-white leading-tight mb-3 tracking-tight">
            Your{" "}
            <span className="text-blue-600 dark:text-[#AAF0FF]" style={{ textShadow: "0 0 30px rgba(170,240,255,0.4)" }}>
              AI analytics
            </span>
            <br />journey starts<br />here.
          </h1>
          <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed mb-7">
            Join businesses unlocking the power of review intelligence.
          </p>

          <div className="space-y-3">
            {[
              { icon: "📊", title: "Real-time dashboards", desc: "Live data from your reviews" },
              { icon: "🤖", title: "AI-generated insights", desc: "Trends, sentiment & patterns" },
              { icon: "📍", title: "Localised intelligence", desc: "Region-specific analytics" },
              { icon: "🔒", title: "Secure & private", desc: "Your data stays yours" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm bg-[#AAF0FF]/10 dark:bg-white/5 border border-blue-500/20 dark:border-white/10">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-white/75">{f.title}</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Scrollable Form ── */}
      <div className="flex-1 overflow-y-auto py-10 px-6 flex justify-center bg-slate-50 dark:bg-[#070d1a]/95 border-l border-slate-200/50 dark:border-[#AAF0FF]/5">
        <div className="w-full max-w-[500px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-6">
            <Link href="/" className="flex flex-col items-center group">
              <img src="/logo.png" alt="Insydz" className="w-14 h-14 object-contain mb-2 transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold text-slate-850 dark:text-white">Insydz</span>
            </Link>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl p-8 bg-white dark:bg-white/[0.025] border border-slate-200 dark:border-[#AAF0FF]/10 shadow-lg dark:shadow-[0_0_60px_rgba(170,240,255,0.03)]">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-1">
              <span className="w-[7px] h-[7px] rounded-full bg-[#AAF0FF] animate-pulse"
                style={{ boxShadow: "0 0 8px rgba(170,240,255,0.9)" }} />
              <span className="text-[10px] text-blue-600 dark:text-[#AAF0FF] tracking-widest uppercase font-medium">New account</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Create Account</h2>
            <p className="text-slate-500 dark:text-white/35 text-sm mb-6">Join and get personalised business insights</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-white/50">First Name *</Label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    disabled={isLoading}
                    className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Last Name *</Label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    disabled={isLoading}
                    className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Email *</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  disabled={isLoading}
                  className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Mobile Number *</Label>
                <div className="flex gap-2">
                  <div className="h-11 px-3 rounded-xl flex items-center text-sm font-medium bg-[#AAF0FF]/10 dark:bg-white/5 border border-slate-200 dark:border-[#AAF0FF]/12 text-[#0072FF] dark:text-[#AAF0FF]">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.mobileNumber}
                    onChange={handleInputChange("mobileNumber")}
                    disabled={isLoading}
                    maxLength={10}
                    className="flex-1 h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-white/25">10-digit Indian mobile number</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Password *</Label>
                  <button
                    type="button"
                    onClick={handleSuggestPassword}
                    className="text-[11px] text-blue-600 dark:text-[#AAF0FF] hover:underline bg-transparent border-none p-0 cursor-pointer"
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
                    className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 bg-transparent border-none p-0 cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1 mt-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 dark:text-white/40">Password strength:</span>
                      <span className={cn("font-semibold", strength.text)}>{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      <div className={cn("rounded-full transition-all duration-300", strength.score >= 1 ? strength.color : "bg-slate-200 dark:bg-white/10")} />
                      <div className={cn("rounded-full transition-all duration-300", strength.score >= 2 ? strength.color : "bg-slate-200 dark:bg-white/10")} />
                      <div className={cn("rounded-full transition-all duration-300", strength.score >= 3 ? strength.color : "bg-slate-200 dark:bg-white/10")} />
                      <div className={cn("rounded-full transition-all duration-300", strength.score >= 4 ? strength.color : "bg-slate-200 dark:bg-white/10")} />
                    </div>
                  </div>
                )}
                
                <p className="text-[11px] text-slate-400 dark:text-white/25">Minimum 6 characters</p>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-white/50">
                  Business Name <span className="opacity-50">(Optional)</span>
                </Label>
                <Input
                  placeholder="Your Business"
                  value={formData.businessName}
                  onChange={handleInputChange("businessName")}
                  disabled={isLoading}
                  className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus-visible:ring-blue-500/20 dark:focus-visible:ring-[#AAF0FF]/20 focus-visible:border-blue-500 dark:focus-visible:border-[#AAF0FF]/35 rounded-xl"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Location *</Label>
                <Select value={formData.location} onValueChange={handleLocationChange} disabled={isLoading}>
                  <SelectTrigger className="h-11 text-sm bg-white dark:bg-[#080e1c] border-slate-200 dark:border-[#AAF0FF]/10 text-slate-700 dark:text-white/70 focus:ring-blue-500/20 dark:focus:ring-[#AAF0FF]/20 focus:border-blue-500 dark:focus:border-[#AAF0FF]/35 rounded-xl data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-white/20">
                    <SelectValue placeholder="Select state or city" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0d1a2e] border-slate-200 dark:border-[#AAF0FF]/12 text-slate-800 dark:text-white max-h-64">
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}
                        className="text-slate-800 dark:text-white/70 focus:bg-[#AAF0FF]/10 dark:focus:bg-[#AAF0FF]/10 focus:text-slate-900 dark:focus:text-white">
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Interests */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-slate-500 dark:text-white/50">Business Interests *</Label>
                  <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">Select at least one category</p>
                </div>
                <div className="rounded-xl p-3 max-h-[180px] overflow-y-auto bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-[#AAF0FF]/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {BUSINESS_INTERESTS.map((interest) => (
                      <div key={interest.id} className="flex items-center gap-2">
                        <Checkbox
                          id={interest.id}
                          checked={formData.businessInterests.includes(interest.id)}
                          onCheckedChange={() => handleInterestToggle(interest.id)}
                          disabled={isLoading}
                          className="border-slate-350 dark:border-[#AAF0FF]/20 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-[#AAF0FF] data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-[#AAF0FF]"
                        />
                        <Label htmlFor={interest.id} className="text-xs text-slate-650 dark:text-white/50 font-normal cursor-pointer">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {formData.businessInterests.length > 0 && (
                  <p className="text-xs font-medium text-blue-600 dark:text-[#AAF0FF]">
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
                  className="mt-0.5 border-slate-350 dark:border-[#AAF0FF]/20 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-[#AAF0FF] data-[state=checked]:border-blue-600 dark:data-[state=checked]:border-[#AAF0FF]"
                />
                <Label htmlFor="terms" className="text-xs text-slate-500 dark:text-white/40 cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms-service" target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 dark:text-[#AAF0FF] hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 dark:text-[#AAF0FF] hover:underline">Privacy Policy</a>
                </Label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-white dark:text-[#051020] text-sm transition-all duration-200 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-[#AAF0FF] dark:to-[#7dd8f5]"
                style={{
                  boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#051020]/30 dark:border-t-[#051020] rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-white/[0.06] text-center space-y-2">
              <p className="text-xs text-slate-400 dark:text-white/22">Secure authentication with session management</p>
              <p className="text-sm text-slate-500 dark:text-white/35">
                Have an account?{" "}
                <Link href="/login" className="text-blue-600 dark:text-[#AAF0FF] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}