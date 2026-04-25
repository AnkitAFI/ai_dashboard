"use client";

import { useState, useEffect, Suspense } from "react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ChartsGrid from "@/components/dashboard/charts-grid";
import ProductRankings from "@/components/dashboard/product-rankings";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import SellerIdInput from "@/components/dashboard/SellerIdInput";

import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Star, Package, AlertCircle, ExternalLink, Lock, Crown } from "lucide-react";
import { useFilters } from "@/components/dashboard/filters-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { useAuth } from "@/lib/auth-context";
import OnboardingModal, { OnboardingData } from "@/components/modals/OnboardingModal";
import { toast } from "@/hooks/use-toast";
import { useAlerts, Notification, NotificationDetails } from "@/components/dashboard/alert-context";
import { useRouter } from "next/navigation";

// Type definitions
// Types are now imported from alert-context

type AlertType = "price_drop" | "price_increase" | "review_spike" | "sales_spike" | "new_product" | string;
type SeverityType = "high" | "medium" | "low" | string;

function DashboardContent() {
  const router = useRouter();
  const { selectedAlert, isAlertDialogOpen, closeAlertDialog } = useAlerts();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Seller Mode state
  const [sidebarMode, setSidebarMode] = useState<string>("explorer");
  const [localSellerId, setLocalSellerId] = useState<string | null>(null);

  // Subscription hooks
  const { limits, canAccessFeature, currentTier } = useSubscriptionLimits();
  const { updateSubscriptionInDB } = useSubscriptionSync();
  const { user, refreshUser } = useAuth();

  const { filters, setFilters } = useFilters();
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

  const selectedSource = filters.table || "amazon";

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        setSidebarMode(localStorage.getItem("sidebar-mode") || "explorer");
      }
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const current = localStorage.getItem("sidebar-mode") || "explorer";
        setSidebarMode(prev => prev !== current ? current : prev);
      }
    }, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;
    try {
      const res = await fetch(`${BASE_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          onboarding_data: data,
          onboarding_completed: true
        })
      });
      if (res.ok) {
        setIsOnboardingOpen(false);
        refreshUser();
        toast({ title: "Profile updated", description: "Your dashboard is being personalized." });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleUpgradeClick = () => { window.location.href = "/subscription"; };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "price_drop": return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "price_increase": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "review_spike": return <Star className="w-4 h-4 text-yellow-500" />;
      case "sales_spike": return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "new_product": return <Package className="w-4 h-4 text-purple-500" />;
      case "upgrade": return <Crown className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: SeverityType) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      case "info": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.id === 'upgrade-prompt') {
      handleUpgradeClick();
      return;
    }
    // Now handled by AlertContext global showAlertDetails
  };

  return (
    <div className="space-y-6">
      {sidebarMode === "seller" ? (
        (user?.sellerId || localSellerId) ? (
          <SellerDashboardView />
        ) : (
          <SellerIdInput onSaved={(id) => {
            setLocalSellerId(id);
            // In Next.js we might want to refresh the page or update context
            window.location.reload();
          }} />
        )
      ) : (
        <>
          <MetricsCards selectedSource={selectedSource} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <ChartsGrid selectedSource={selectedSource} />
              <ProductRankings selectedSource={selectedSource} />
            </div>
            <div className="space-y-6">
              <AIRecommendations selectedSource={selectedSource} />
            </div>
          </div>
        </>
      )}

      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete} 
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
