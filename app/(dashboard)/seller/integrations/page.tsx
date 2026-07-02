"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { CheckCircle2, Link as LinkIcon, Loader2 } from "lucide-react";

export default function IntegrationsPage() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  
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

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">API Integrations</h1>
        <p className="text-slate-500">Connect your marketplace accounts to enable one-click publishing and syncing. All tokens are secured with military-grade AES encryption.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amazon Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Amazon SP-API
                  {amazonConnected && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </CardTitle>
                <CardDescription className="mt-2">Connect to your Amazon Seller Central account.</CardDescription>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#FF9900]/10 flex items-center justify-center">
                <span className="text-[#FF9900] font-bold text-xl">a</span>
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
              <div className="py-4 text-center">
                <p className="text-sm text-slate-500 mb-6">Click below to securely login with your Amazon seller account. You will be redirected to Amazon for authorization.</p>
              </div>
            )}
          </CardContent>
          {!amazonConnected && (
            <CardFooter>
              <Button onClick={handleConnectAmazon} className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-black">
                <LinkIcon className="h-4 w-4 mr-2" />
                Login with Amazon
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Flipkart Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Flipkart Seller API
                  {flipkartConnected && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </CardTitle>
                <CardDescription className="mt-2">Connect to your Flipkart Seller Hub.</CardDescription>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#2874F0]/10 flex items-center justify-center">
                <span className="text-[#2874F0] font-bold text-xl italic">f</span>
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
              <div className="py-4 text-center">
                <p className="text-sm text-slate-500 mb-6">Click below to securely authenticate with your Flipkart seller account.</p>
              </div>
            )}
          </CardContent>
          {!flipkartConnected && (
            <CardFooter>
              <Button onClick={handleConnectFlipkart} className="w-full bg-[#2874F0] hover:bg-[#1E5BBE] text-white">
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect Flipkart
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
