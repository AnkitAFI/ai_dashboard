"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, Unlink, Menu, Activity, TrendingUp, Clock, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
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

export default function AmazonAdsSetupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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
        const response = await fetch(`${API_BASE_URL}/api/amazon-ads/status`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
        }
      } catch (e) {
        console.error("Failed to fetch connection status", e);
      }
    };

    // If we just returned from OAuth callback
    if (searchParams?.get("success") === "true") {
      setIsConnected(true);
      toast({
        title: "Success",
        description: "Successfully connected to Amazon Ads!",
      });
      // Clean up URL
      router.replace("/seller/ads/setup");
    } else if (searchParams?.get("error") === "access_denied") {
      toast({
        title: "Connection Cancelled",
        description: "You cancelled the Amazon Ads connection process.",
        variant: "destructive"
      });
      // Clean up URL
      router.replace("/seller/ads/setup");
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
      const response = await fetch(`${API_BASE_URL}/api/amazon-ads/connect`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to generate connect URL");

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error connecting to Amazon Ads",
        variant: "destructive"
      });
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/amazon-ads/disconnect`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to disconnect");

      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Amazon Ads account disconnected successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error disconnecting from Amazon Ads",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  const features = [
    {
      title: "Deep Analytics",
      description: "Analyze campaigns, keywords, and bleeding search terms with advanced filtering.",
      icon: Activity,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-100/80 dark:bg-blue-900/40",
      borderColor: "border-t-blue-400",
      href: "/seller/ads/analytics"
    },
    {
      title: "AI Bid Adjustments",
      description: "Automatically scale bids up or down to hit your exact Target ACOS.",
      icon: Zap,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-100/80 dark:bg-amber-900/40",
      borderColor: "border-t-amber-400",
      href: "/seller/ads/analytics"
    },
    {
      title: "Budget Scaling",
      description: "Automatically increase daily budgets for your most profitable campaigns.",
      icon: TrendingUp,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-100/80 dark:bg-emerald-900/40",
      borderColor: "border-t-emerald-400",
      href: "/seller/ads/analytics"
    },
    {
      title: "Dayparting Rules",
      description: "Schedule your ads to run only during highly profitable days and hours.",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100/80 dark:bg-purple-900/40",
      borderColor: "border-t-purple-400",
      href: "/seller/ads/analytics"
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

        {/* The Main Hero Banner (Matching Premium Style) */}
        <div className={`relative overflow-hidden rounded-[20px] ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-0'} p-6 sm:px-8 sm:py-8 shadow-sm`}>
          {/* Background decorative blobs */}
          {!isDark && (
            <>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
            </>
          )}

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl space-y-3">
              <div className={`font-semibold text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'}`}>
                Ads Command Center
              </div>

              {!isConnected ? (
                <>
                  <h1 className={`text-3xl sm:text-[34px] font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                    Connect your <span className="text-[#0284c7]">Amazon Ads Account.</span>
                  </h1>
                  <p className={`text-[15px] sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'} max-w-lg leading-relaxed`}>
                    Unlock advanced PPC intelligence. Connect your account securely to enable real-time campaign analytics, automated bid adjustments, and dayparting.
                  </p>
                  <div className="pt-3">
                    <Button
                      onClick={handleConnect}
                      disabled={isLoading}
                      className="h-11 px-6 text-[15px] bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                      Start Ads Connection <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className={`text-3xl sm:text-[34px] font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                    Your <span className="text-[#0284c7]">Ads Engine</span> is running.
                  </h1>
                  <p className={`text-[15px] sm:text-base ${isDark ? 'text-gray-400' : 'text-[#475569]'} max-w-lg leading-relaxed`}>
                    Your Amazon Ads data is securely syncing. You can now access deep analytics and configure AI bidding automations.
                  </p>
                </>
              )}
            </div>

            {/* Right Side Illustration */}
            <div className="hidden lg:flex items-center gap-6 shrink-0 relative pr-2">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center transform -rotate-6 relative z-10 border border-gray-100">
                  <div className="flex items-center justify-center relative mt-1">
                    <span className="text-[32px] font-bold text-slate-800 leading-none">a</span>
                    <svg className="w-6 h-6 text-[#ff9900] absolute -bottom-2.5" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M 10 50 Q 50 90 90 40 Q 80 80 15 65 Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 mt-2.5 tracking-wider uppercase">ADS</span>
                </div>

                <div className={`w-12 border-t-2 opacity-60 transition-colors duration-500 ${isConnected ? 'border-emerald-400 border-solid' : 'border-cyan-400 border-dashed'}`}></div>

                <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isConnected ? 'bg-emerald-500 border-emerald-100' : 'bg-cyan-600 border-cyan-100'}`}>
                  {isConnected ? <CheckCircle2 className="w-8 h-8 text-white" /> : <LinkIcon className="w-6 h-6 text-white" />}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50 transition-transform duration-300 hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isConnected ? 'text-emerald-600' : 'text-cyan-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                  <span className="text-xs font-semibold text-slate-700">AI Bidding</span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50 ml-4 transition-transform duration-300 hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isConnected ? 'text-emerald-600' : 'text-cyan-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="m17 5-5-3-5 3" /><path d="m17 19-5 3-5-3" /><path d="M2 12h20" /><path d="m5 7-3 5 3 5" /><path d="m19 7 3 5-3 5" /></svg>
                  <span className="text-xs font-semibold text-slate-700">Budget Scaling</span>
                </div>
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-white/50 transition-transform duration-300 hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isConnected ? 'text-emerald-600' : 'text-cyan-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span className="text-xs font-semibold text-slate-700">Dayparting Rules</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected State Actions */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className={`rounded-[16px] shadow-sm flex flex-col justify-between p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-emerald-100/80 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className={`font-bold text-[17px] ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Account Connected</h3>
                  <p className={`text-[14px] ${isDark ? 'text-slate-400' : 'text-[#64748b]'}`}>Your API tokens are active and valid.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => router.push('/seller/ads/analytics')} className="flex-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold">
                  Go to Analytics
                </Button>
              </div>
            </div>

            <div className={`rounded-[16px] shadow-sm flex flex-col justify-between p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-100'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-red-100/80 flex items-center justify-center">
                  <Unlink className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className={`font-bold text-[17px] ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Connection Settings</h3>
                  <p className={`text-[14px] ${isDark ? 'text-slate-400' : 'text-[#64748b]'}`}>Manage your Amazon Ads OAuth linking.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isLoading} variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Disconnect Account"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disconnect your Amazon Ads account and immediately pause all your active AI automation rules.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white font-bold">
                        Yes, Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <div onClick={() => router.push(feature.href)} key={idx} className="cursor-pointer group block h-full">
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
                    <div className={`flex items-center mt-6 font-bold text-[14px] transition-colors ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-[#0284c7] group-hover:text-[#0369a1]'}`}>
                      Explore Tool <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
