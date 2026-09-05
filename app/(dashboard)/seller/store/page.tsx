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

    // If we just returned from OAuth callback
    if (searchParams?.get("success") === "true") {
      setIsConnected(true);
      toast({
        title: "Success",
        description: "Successfully connected your Amazon Seller Store!",
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

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-5xl mx-auto w-full">
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
            <LinkIcon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h1 className="page-title">
              Amazon Store Setup
            </h1>
            <p className="page-subtitle">
              Connect your Amazon Seller account to sync orders and track profitability.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6">
        <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-slate-200' : 'text-slate-800'}>Store Connection</CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Securely grant us read access to your Amazon Selling Partner data. We prioritize data privacy and DPDP compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((acc: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center space-x-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div>
                        <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Connected Store ({acc.region})
                        </h3>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Seller ID: {acc.selling_partner_id || "Loading..."} | Status: {acc.sync_status}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={isLoading} variant="destructive" size="sm" className="gap-2 rounded-full">
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect this account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disconnect this specific Amazon Seller account and purge its SP-API credentials.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect(acc.selling_partner_id)} className="bg-red-500 hover:bg-red-600 text-white">
                            Yes, Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`flex items-center space-x-4 p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Not Connected
                  </h3>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Connect your seller account to start syncing orders, catalog items, and financial events.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {accounts.length} / {maxAccounts} Accounts Connected
            </div>
            {canAddMore && (
              <Button onClick={handleConnect} disabled={isLoading} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold shadow hover:shadow-md transition-all">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                {accounts.length > 0 ? "Connect Another Account" : "Connect Seller Account"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
