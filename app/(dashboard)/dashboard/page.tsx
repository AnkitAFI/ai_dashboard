"use client";

import { useState, useEffect, Suspense } from "react";
import { API_BASE_URL } from "@/lib/config";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ChartsGrid from "@/components/dashboard/charts-grid";
import ProductRankings from "@/components/dashboard/product-rankings";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import SellerDashboardView from "@/components/dashboard/seller-dashboard-view";
import SellerIdInput from "@/components/dashboard/seller-id-input";

import { Button } from "@/components/ui/button";
import {
  TrendingDown,
  TrendingUp,
  Star,
  Package,
  AlertCircle,
  ExternalLink,
  Lock,
  Crown,
} from "lucide-react";
import { useFilters } from "@/components/dashboard/filters-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useSubscriptionLimits,
  UNLIMITED,
} from "@/hooks/use-subscription-limits";
import { useSubscriptionSync } from "@/hooks/use-subscription-sync";
import { useAuth } from "@/lib/auth-context";
import OnboardingModal, {
  OnboardingData,
} from "@/components/modals/onboarding-modal";
import { toast } from "@/hooks/use-toast";
import {
  useAlerts,
  Notification,
  NotificationDetails,
} from "@/components/dashboard/alert-context";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";

type AlertType =
  | "price_drop"
  | "price_increase"
  | "review_spike"
  | "sales_spike"
  | "new_product"
  | string;
type SeverityType = "high" | "medium" | "low" | string;

// Maps onboarding marketplace id → filter table value
const MARKETPLACE_FILTER_MAP: Record<string, string> = {
  amazon_india: "amazon",
  flipkart: "flipkart",
  both: "amazon", // default to amazon when both
};

function DashboardContent() {
  const router = useRouter();
  const { selectedAlert, isAlertDialogOpen, closeAlertDialog } = useAlerts();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [sidebarMode, setSidebarMode] = useState<string>("explorer");
  const [localSellerId, setLocalSellerId] = useState<string | null>(null);

  const { limits, canAccessFeature, currentTier } = useSubscriptionLimits();
  const { updateSubscriptionInDB } = useSubscriptionSync();
  const { user, refreshUser } = useAuth();

  const { filters, setFilters } = useFilters();
  const BASE_URL = API_BASE_URL;

  const selectedSource = filters.table || "amazon";

  // Open onboarding if not completed
  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  // Sync sidebar mode from localStorage
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
        setSidebarMode((prev) => (prev !== current ? current : prev));
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
      const res = await fetch(`${BASE_URL}/api/auth/onboarding`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboarding_goal: data.onboarding_goal,
          onboarding_marketplace: data.onboarding_marketplace,
          onboarding_details: data.onboarding_details,
          seller_id: data.seller_id || null,
        }),
      });

      if (res.ok) {
        setIsOnboardingOpen(false);
        refreshUser();

        // ── Apply selections as live dashboard filters ──
        if (data.onboarding_goal === "new_seller") {
          const tableValue =
            MARKETPLACE_FILTER_MAP[data.onboarding_marketplace] ?? "amazon";

          const newFilters: Record<string, string> = {
            table: tableValue,
          };

          // Apply category only if user actually picked one (not skipped)
          if (
            data.onboarding_details &&
            data.onboarding_details !== "general"
          ) {
            newFilters.category = data.onboarding_details;
          }

          setFilters((prev: typeof filters) => ({ ...prev, ...newFilters }));

          toast({
            title: "Dashboard personalized!",
            description:
              data.onboarding_details !== "general"
                ? `Showing ${data.onboarding_details} on ${tableValue.charAt(0).toUpperCase() + tableValue.slice(1)}.`
                : "Your dashboard is ready. Explore away!",
          });
        } else if (
          data.onboarding_goal === "existing_seller" &&
          data.onboarding_details === "skipped"
        ) {
          // Skipped seller ID — land on explorer mode
          localStorage.setItem("sidebar-mode", "explorer");
          window.dispatchEvent(new Event("sidebar-mode-changed"));

          analytics.track("onboarding_completed", {
            goal: "existing_seller",
            seller_id_skipped: true,
            marketplace: data.onboarding_marketplace,
          });

          toast({
            title: "You're all set!",
            description:
              "You can add your Seller ID anytime from the Seller Dashboard.",
          });
        } else {
          // existing_seller with connected store — no category filter, just show dashboard
          toast({
            title: "Profile updated",
            description: "Your dashboard is being personalized.",
          });
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = "/subscription";
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "price_drop":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "price_increase":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "review_spike":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "sales_spike":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "new_product":
        return <Package className="w-4 h-4 text-purple-500" />;
      case "upgrade":
        return <Crown className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: SeverityType) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "info":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.id === "upgrade-prompt") {
      handleUpgradeClick();
      return;
    }
  };

  return (
    <div className="space-y-6">
      {sidebarMode === "seller" ? (
        user?.sellerId || localSellerId ? (
          <SellerDashboardView />
        ) : (
          <SellerIdInput
            onSaved={(id) => {
              setLocalSellerId(id);
              window.location.reload();
            }}
          />
        )
      ) : (
        <>
          <MetricsCards selectedSource={selectedSource} />
          <ChartsGrid selectedSource={selectedSource} />
          <AIRecommendations selectedSource={selectedSource} />
          <ProductRankings selectedSource={selectedSource} />
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
