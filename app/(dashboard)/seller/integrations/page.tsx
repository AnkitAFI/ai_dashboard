"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { CheckCircle2, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";

export default function IntegrationsPage() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [testingAmazon, setTestingAmazon] = useState(false);
  
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
          description: "Amazon recognized your Developer Sandbox Keys!",
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Connection Failed",
          description: data.detail || "Invalid Sandbox Keys",
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

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-slate-900">API Integrations</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Connect your marketplace accounts to enable one-click publishing and syncing. All tokens are secured with military-grade AES encryption.</p>
      </div>

      <div className="max-w-4xl mx-auto mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">Next Steps</h3>
          <p className="text-blue-800/80 text-sm mt-1">
            Once your accounts are connected, head over to the <a href="/seller/listing-studio" className="font-bold underline decoration-blue-300 underline-offset-2 hover:text-blue-600 transition-colors">AI Listing Studio</a> to generate and publish your products directly in one click!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Amazon Card */}
        <Card className="border-t-4 border-t-[#FF9900] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9900]/5 rounded-bl-full -z-10"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                  Amazon SP-API
                  {amazonConnected && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
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
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col gap-2">
                <p className="text-emerald-800 font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Connected & Secured
                </p>
                <p className="text-xs text-emerald-600">Your connection is active. You can now publish generated listings directly to Amazon.</p>
                <Button variant="outline" size="sm" className="w-fit mt-2 border-emerald-200 hover:bg-emerald-100 text-emerald-700" onClick={handleConnectAmazon}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 mt-4">
                <p className="text-sm text-slate-600 px-6 font-medium">Click below to securely authenticate with your Amazon seller account.</p>
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
                Test Sandbox Keys
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
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                  Flipkart Seller API
                  {flipkartConnected && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
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
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col gap-2">
                <p className="text-emerald-800 font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Connected & Secured
                </p>
                <p className="text-xs text-emerald-600">Your connection is active. You can now publish generated listings directly to Flipkart.</p>
                <Button variant="outline" size="sm" className="w-fit mt-2 border-emerald-200 hover:bg-emerald-100 text-emerald-700" onClick={handleConnectFlipkart}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 mt-4">
                <p className="text-sm text-slate-600 px-6 font-medium">Click below to securely authenticate with your Flipkart seller account.</p>
              </div>
            )}
          </CardContent>
          {!flipkartConnected && (
            <CardFooter className="pt-2 pb-6 px-6">
              <Button onClick={handleConnectFlipkart} className="w-full h-12 text-base font-bold bg-[#2874F0] hover:bg-[#1E5BBE] text-white shadow-lg shadow-[#2874F0]/20 transition-all active:scale-[0.98]">
                <LinkIcon className="h-5 w-5 mr-2" />
                Connect Flipkart
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
