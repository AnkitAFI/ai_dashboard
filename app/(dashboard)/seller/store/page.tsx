"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, 
  Unlink, Menu, Calculator, Package, Star, ShieldCheck, ArrowRight, Activity, Zap, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AmazonStoreSetupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [maxAccounts, setMaxAccounts] = useState(1);
  const [canAddMore, setCanAddMore] = useState(true);

  const { theme, resolvedTheme } = useTheme();
  const { toggle } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fix: If user clicks "Back" from Amazon login, un-freeze the loading button
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsLoading(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    
    // Check connection status from backend
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
          setAccounts(data.accounts || []);
          setMaxAccounts(data.max_accounts || 1);
          setCanAddMore(data.can_add_more ?? true);
        }
      } catch (e) {
        console.error("Failed to fetch connection status", e);
      }
    };

    // If we just returned from OAuth callback (legacy ?success=true or new ?connected=true)
    if (searchParams?.get("success") === "true" || searchParams?.get("connected") === "true") {
      const fromOnboarding = searchParams?.get("connected") === "true";
      setIsConnected(true);
      toast({
        title: "✅ Amazon Store Connected!",
        description: fromOnboarding
          ? "Welcome! Your store is live. Data syncs within 2 hours — explore your dashboard in the meantime."
          : "Successfully connected your Amazon Seller Store!",
        duration: 6000,
      });
      // Clean up URL
      router.replace("/seller/store");
    } else if (searchParams?.get("error") === "access_denied") {
      toast({
        title: "Connection Cancelled",
        description: "You cancelled the Amazon Seller connection process.",
        variant: "destructive"
      });
      // Clean up URL
      router.replace("/seller/store");
      checkStatus();
    } else {
      checkStatus();
    }
    
    // Cleanup event listener
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [searchParams, router, toast]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/amazon-sp-api/connect`, {
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many connection attempts. Please slow down and try again in a moment.");
        }
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to connect to Amazon");
      }
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Error connecting to Amazon Seller Central",
        variant: "destructive"
      });
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (sellingPartnerId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/amazon-sp-api/disconnect/${sellingPartnerId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please slow down.");
        }
        throw new Error("Failed to disconnect");
      }
      
      toast({
        title: "Disconnected",
        description: "Amazon Seller account disconnected successfully"
      });
      
      // Refresh status to get updated accounts list
      const statusRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
      if (statusRes.ok) {
        const data = await statusRes.json();
        setIsConnected(data.connected);
        setAccounts(data.accounts || []);
        setMaxAccounts(data.max_accounts || 1);
        setCanAddMore(data.can_add_more ?? true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error disconnecting from Amazon Seller Central",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = user?.name?.split(" ")[0] || "Seller";

  const features = [
    {
      title: "Financial Command Center",
      description: "Track your net profit after Amazon fees, ad spend, and cost of goods.",
      icon: Calculator,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-100/80 dark:bg-emerald-900/40",
      borderColor: "border-t-emerald-400",
      href: "/seller/profitability"
    },
    {
      title: "Restock Forecaster",
      description: "Calculate reorder dates based on sales velocity and supplier lead times.",
      icon: Package,
      color: "text-[#2563eb] dark:text-blue-400",
      bg: "bg-blue-100/80 dark:bg-blue-900/40",
      borderColor: "border-t-[#2563eb]",
      href: "/seller/restock"
    },
    {
      title: "Review Automator",
      description: "Automate Amazon's 'Request a Review' feature for delivered orders.",
      icon: Star,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-100/80 dark:bg-amber-900/40",
      borderColor: "border-t-amber-400",
      href: "/seller/reviews"
    },
    {
      title: "Lost Money Recovery",
      description: "Identify FBA refunds where the customer did not return the item.",
      icon: ShieldCheck,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/80 dark:bg-purple-900/40",
      borderColor: "border-t-purple-400",
      href: "/seller/reimbursements"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-8">
      
      <main className="space-y-6">
        
        {/* Mobile menu toggle for small screens */}
        <div className="lg:hidden flex items-center mb-4">
          <button onClick={toggle} className={`p-2 rounded-xl border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* The Main Hero Banner (Matching Image Style) */}
        <div className={`relative overflow-hidden rounded-[20px] ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-gradient-to-r from-[#eef4ff] to-[#d6e6ff] border-0'} p-6 sm:px-8 sm:py-8 shadow-sm`}>
           {/* Background decorative blobs */}
           {!isDark && (
             <>
               <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
               <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
             </>
           )}
           
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
              <div className="max-w-xl space-y-3">
                 <div className={`font-semibold text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'}`}>
                    Good {timeOfDay}, {firstName}! 👋
                 </div>
                 
                 {!isConnected ? (
                   <>
                     <h1 className={`text-3xl sm:text-[34px] font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                        Connect your <span className="text-[#2563eb]">Amazon Seller Account.</span>
                     </h1>
                     <p className={`text-[15px] sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'} max-w-lg leading-relaxed`}>
                        Unlock your Seller Command Center. Connect your account securely to enable real-time financial tracking, restock forecasting, and automated reviews.
                     </p>
                     <div className="pt-3">
                        <Button 
                          onClick={handleConnect} 
                          disabled={isLoading} 
                          className="h-11 px-6 text-[15px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                          Start Store Connection <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                     </div>
                   </>
                 ) : (
                   <>
                     <h1 className={`text-3xl sm:text-[34px] font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                        Your <span className="text-[#2563eb]">Command Center</span> is ready.
                     </h1>
                     <p className={`text-[15px] sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'} max-w-lg leading-relaxed`}>
                        Your Amazon data is securely syncing. Use the tools below to optimize your profitability, inventory, and customer reviews.
                     </p>
                   </>
                 )}
              </div>
              
              {/* Right Side Illustration */}
              {!isConnected && (
                 <div className="hidden lg:flex items-center gap-6 shrink-0 relative pr-2">
                    {/* The Amazon to Link visual */}
                    <div className="flex items-center">
                        {/* Amazon Card */}
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center transform -rotate-6 relative z-10 border border-gray-100">
                            <span className="text-4xl font-extrabold text-black leading-none -mt-2">a</span>
                            {/* Orange Smile */}
                            <svg className="w-10 h-4 absolute bottom-3" viewBox="0 0 30 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2C8 8 22 8 28 2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/>
                                <path d="M28 2L26 6M28 2L23 1" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        
                        {/* Dashed line */}
                        <div className="w-12 border-t-2 border-dashed border-blue-400 opacity-60"></div>
                        
                        {/* Link Circle */}
                        <div className="w-16 h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center relative z-10 border-4 border-blue-100">
                            <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-slate-700">Secure Connection</span>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50 ml-4">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-slate-700">Real-time Data</span>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-slate-700">Smarter Decisions</span>
                        </div>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Connected Accounts Status (Only show if connected) */}
        {isConnected && (
          <div className="flex flex-col gap-5">
             {accounts.map((acc: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Card: Account Info */}
                  <div className={`rounded-[16px] shadow-sm flex flex-col justify-between p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-[14px] bg-emerald-100/80 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-[17px] ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>
                          Connected Store ({acc.region})
                        </h3>
                        <p className={`text-[14px] ${isDark ? 'text-slate-400' : 'text-[#64748b]'}`}>
                          ID: {acc.selling_partner_id || "Loading..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <div className={`px-4 py-1.5 text-xs font-bold tracking-wide rounded-full uppercase flex items-center gap-2 ${
                        acc.sync_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${acc.sync_status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                        {acc.sync_status === 'COMPLETED' ? 'Sync Completed' : 'Sync Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Connection Settings */}
                  <div className={`rounded-[16px] shadow-sm flex flex-col justify-between p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-[14px] bg-red-100/80 flex items-center justify-center">
                        <Unlink className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-[17px] ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Connection Settings</h3>
                        <p className={`text-[14px] ${isDark ? 'text-slate-400' : 'text-[#64748b]'}`}>Manage your Amazon Seller integration.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button disabled={isLoading} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50 font-bold transition-all shadow-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Disconnect Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect this store?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will instantly disconnect your Amazon account and permanently erase all its data from our servers to protect your privacy.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDisconnect(acc.selling_partner_id)} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                              Yes, Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
             ))}
             {canAddMore && (
                <div 
                  onClick={handleConnect}
                  className={`rounded-xl border border-dashed flex items-center gap-3 p-4 cursor-pointer transition-colors ${isDark ? 'bg-slate-900/30 border-slate-700 hover:border-blue-500/50' : 'bg-slate-50 border-slate-300 hover:border-blue-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-white shadow-sm border border-slate-200 text-[#2563eb]'}`}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[15px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Connect Another Store
                    </h3>
                    <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Add another region or seller ID
                    </p>
                  </div>
                </div>
             )}
          </div>
        )}

        {/* Feature Grid */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <Link href={feature.href} key={idx} className="group block h-full">
                <div className={`h-full rounded-[16px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative flex flex-col border border-t-[4px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} ${feature.borderColor}`}>
                  
                  <div className="p-6 flex flex-col h-full">
                    {/* Header (Icon) */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${feature.bg} ${feature.color}`}>
                          <feature.icon className="w-6 h-6" strokeWidth={2} />
                        </div>
                    </div>
                    
                    <h4 className={`text-[17px] font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>
                      {feature.title}
                    </h4>
                    <p className={`text-[14px] leading-relaxed flex-1 ${isDark ? 'text-slate-400' : 'text-[#64748b]'}`}>
                      {feature.description}
                    </p>
                    <div className={`flex items-center mt-6 font-bold text-[14px] transition-colors ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-[#2563eb] group-hover:text-blue-700'}`}>
                      Explore Tool <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
