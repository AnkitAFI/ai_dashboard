"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { FiltersProvider } from "@/components/dashboard/FiltersContext";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ChartsGrid from "@/components/dashboard/charts-grid";
import ProductRankings from "@/components/dashboard/product-rankings";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import FiltersPanel from "@/components/dashboard/filters-panel";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import SellerIdInput from "@/components/dashboard/SellerIdInput";
import OnboardingModal, { OnboardingData } from "@/components/modals/onboarding-modal";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Search, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { updateSubscriptionInDB } = useSubscriptionSync();
  const [selectedSource, setSelectedSource] = useState<string>("flipkart");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${BASE_URL}/api/user/complete-onboarding`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await refreshUser();
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error("Onboarding completion failed:", error);
    }
  };

  if (!user) return null;

  const isSeller = user.onboardingGoal === "existing_seller" || !!user.sellerId;

  return (
    <FiltersProvider>
      <div className="min-h-screen bg-[#f8fafc] pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue={isSeller ? "seller" : "explorer"} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Command Center</h1>
                <p className="text-sm text-slate-500 font-medium">Insights and intelligence across your ecosystem</p>
              </div>
              <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-sm h-12">
                <TabsTrigger value="explorer" className="rounded-xl px-6 data-[state=active]:bg-sky-600 data-[state=active]:text-white font-bold transition-all flex gap-2">
                  <Search className="w-4 h-4" /> Market Explorer
                </TabsTrigger>
                <TabsTrigger value="seller" className="rounded-xl px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold transition-all flex gap-2">
                  <ShoppingBag className="w-4 h-4" /> Seller Hub
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="explorer" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 w-full space-y-6">
                  <FiltersPanel selectedSource={selectedSource} />
                  <MetricsCards selectedSource={selectedSource} />
                  <AIRecommendations selectedSource={selectedSource} />
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2"><ChartsGrid selectedSource={selectedSource} /></div>
                    <div className="xl:col-span-1"><ProductRankings selectedSource={selectedSource} /></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seller" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {user.sellerId ? (
                <SellerDashboardView />
              ) : (
                <SellerIdInput onSaved={() => refreshUser()} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
          onComplete={handleOnboardingComplete} 
        />
      </div>
    </FiltersProvider>
  );
}
