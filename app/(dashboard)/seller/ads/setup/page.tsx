"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, Unlink, Menu } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-5xl mx-auto w-full">
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
            <LinkIcon className={`w-6 h-6 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <div>
            <h1 className="page-title">
              Amazon Ads Setup
            </h1>
            <p className="page-subtitle">
              Connect your account to unlock powerful analytics and advanced automation.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6">
        <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-slate-200' : 'text-slate-800'}>Account Connection</CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Securely grant us read/write access to your Amazon Ads data. You can disconnect at any time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center space-x-4 p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
              {isConnected ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-amber-500" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isConnected ? "Connected to Amazon Ads" : "Not Connected"}
                </h3>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isConnected 
                    ? "Your account is actively syncing. You can access the Analytics dashboard."
                    : "Connect your account to start syncing your campaigns, keywords, and metrics."}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-start sm:justify-end">
            {!isConnected ? (
              <Button onClick={handleConnect} disabled={isLoading} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold shadow hover:shadow-md transition-all">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Connect with Amazon
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isLoading} variant="destructive" className="gap-2 rounded-full font-bold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                    Disconnect Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your Amazon Ads account and immediately pause all your active AI automation rules. You will need to reconnect to restore functionality.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white">
                      Yes, Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
