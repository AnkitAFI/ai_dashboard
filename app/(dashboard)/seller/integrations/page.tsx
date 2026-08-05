"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { useAuth } from "@/lib/auth-context";
import { Lock, ArrowRight, CheckCircle2, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-900">
        <span className="text-4xl">✨</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
        Coming Soon
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mb-8">
        We are actively working on this feature. Stay tuned for an incredible experience!
      </p>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-5 py-2.5 rounded-full shadow-sm">
        <span>🚀</span> Launching very soon
      </div>
    </div>
  );
}

export function OldIntegrationsPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [testingAmazon, setTestingAmazon] = useState(false);
  const [testingFlipkart, setTestingFlipkart] = useState(false);
  
  const [amazonConnected, setAmazonConnected] = useState(false);
  const [flipkartConnected, setFlipkartConnected] = useState(false);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/integrations/credentials`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const amz = data.find((d: any) => d.platform === "amazon");
        if (amz && amz.has_keys) setAmazonConnected(true);
        
        const fkart = data.find((d: any) => d.platform === "flipkart");
        if (fkart && fkart.has_keys) setFlipkartConnected(true);
      }
    } catch (e) {
      console.error("Error fetching credentials", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleConnectAmazon = () => {
    // In a production environment, this redirects to the Amazon LWA Authorization page.
    // E.g. https://sellercentral.amazon.in/apps/authorize/consent?application_id=...
    // For now, since the Amazon App is pending approval, we redirect to our own backend's OAuth trigger 
    // which handles the redirect dynamically.
    window.location.href = `${API_BASE_URL}/api/integrations/amazon/authorize`;
  };

  const handleConnectFlipkart = () => {
    // Similarly redirects to Flipkart's OAuth authorization portal
    window.location.href = `${API_BASE_URL}/api/integrations/flipkart/authorize`;
  };

  const handleTestAmazonSandbox = async () => {
    setTestingAmazon(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/integrations/test-amazon`, {
        method: 'POST',
        credentials: "include"
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        toast({
          title: "✅ Connection Successful",
          description: "Amazon recognized your Production API Credentials!",
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Connection Failed",
          description: sanitizeApiError(data.detail, "Invalid API Credentials. Please check your production credentials."),
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "❌ Connection Error",
        description: "Could not reach backend.",
        variant: "destructive",
      });
    } finally {
      setTestingAmazon(false);
    }
  };

  const handleTestFlipkartSandbox = async () => {
    setTestingFlipkart(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/integrations/test-flipkart`, {
        method: 'POST',
        credentials: "include"
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        toast({
          title: "✅ Connection Successful",
          description: "Flipkart recognized your Production API Credentials!",
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Connection Failed",
          description: sanitizeApiError(data.detail, "Invalid API Credentials. Please check your production credentials."),
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "❌ Connection Error",
        description: "Could not reach backend.",
        variant: "destructive",
      });
    } finally {
      setTestingFlipkart(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const isNonEnterprise = user?.subscriptionTier !== "enterprise";

  if (isNonEnterprise) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <Lock className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
          Enterprise Exclusive Feature
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mb-8">
          API Integrations are exclusively available on the Enterprise plan. Upgrade to enable one-click publishing and syncing.
        </p>
        <Button size="lg" className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" onClick={() => window.location.href = '/subscription'}>
          View Upgrade Plans <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-slate-50">API Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">Connect your marketplace accounts to enable one-click publishing and syncing. All tokens are secured with military-grade AES encryption.</p>
      </div>

     

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Amazon Card */}
        <Card className="border-t-4 border-t-[#FF9900] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9900]/5 rounded-bl-full -z-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Amazon SP-API
                  {amazonConnected && <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
                </CardTitle>
                <CardDescription className="mt-2 text-sm font-medium">Connect to your Amazon Seller Central account.</CardDescription>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF9900]/20 to-[#FF9900]/5 flex items-center justify-center border border-[#FF9900]/20 shadow-sm">
                <span className="text-[#FF9900] font-extrabold text-3xl">a</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {amazonConnected ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-lg flex flex-col gap-2">
                <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Connected & Secured
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Your connection is active. You can now publish generated listings directly to Amazon.</p>
                <Button variant="outline" size="sm" className="w-fit mt-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" onClick={handleConnectAmazon}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 px-6 font-medium">Click below to securely authenticate with your Amazon seller account.</p>
              </div>
            )}
          </CardContent>
          {!amazonConnected && (
            <CardFooter className="pt-2 pb-6 px-6">
              <Button onClick={handleConnectAmazon} className="w-full h-12 text-base font-bold bg-[#FF9900] hover:bg-[#E68A00] text-black shadow-lg shadow-[#FF9900]/20 transition-all active:scale-[0.98]">
                <LinkIcon className="h-5 w-5 mr-2" />
                Connect Amazon
              </Button>
              <Button onClick={handleTestAmazonSandbox} disabled={testingAmazon} variant="outline" className="w-full h-12 text-base font-bold mt-3 border-[#FF9900]/30 text-[#FF9900] hover:bg-[#FF9900]/10">
                {testingAmazon ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Verify Production Connection
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Flipkart Card */}
        <Card className="border-t-4 border-t-[#2874F0] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2874F0]/5 rounded-bl-full -z-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Flipkart Seller API
                  {flipkartConnected && <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
                </CardTitle>
                <CardDescription className="mt-2 text-sm font-medium">Connect to your Flipkart Seller Hub.</CardDescription>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2874F0]/20 to-[#2874F0]/5 flex items-center justify-center border border-[#2874F0]/20 shadow-sm">
                <span className="text-[#2874F0] font-extrabold text-3xl italic">f</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {flipkartConnected ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-lg flex flex-col gap-2">
                <p className="text-emerald-800 dark:text-emerald-200 font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Connected & Secured
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Your connection is active. You can now publish generated listings directly to Flipkart.</p>
                <Button variant="outline" size="sm" className="w-fit mt-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" onClick={handleConnectFlipkart}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 px-6 font-medium">Click below to securely authenticate with your Flipkart seller account.</p>
              </div>
            )}
          </CardContent>
          {!flipkartConnected && (
            <CardFooter className="pt-2 pb-6 px-6 flex flex-col gap-3">
              <Button onClick={handleConnectFlipkart} className="w-full h-12 text-base font-bold bg-[#2874F0] hover:bg-[#1E5BBE] text-white shadow-lg shadow-[#2874F0]/20 transition-all active:scale-[0.98]">
                <LinkIcon className="h-5 w-5 mr-2" />
                Connect Flipkart
              </Button>
              <Button onClick={handleTestFlipkartSandbox} disabled={testingFlipkart} variant="outline" className="w-full h-12 text-base font-bold border-[#2874F0]/30 text-[#2874F0] hover:bg-[#2874F0]/10">
                {testingFlipkart ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Verify Production Connection
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
