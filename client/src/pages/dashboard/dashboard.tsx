import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import FiltersPanel from "@/components/dashboard/filters-panel";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ChartsGrid from "@/components/dashboard/charts-grid";
import ProductRankings from "@/components/dashboard/product-rankings";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import SellerDashboardView from "@/components/dashboard/SellerDashboardView";
import SellerIdInput from "@/components/dashboard/SellerIdInput";

import { Button } from "@/components/ui/button";
import { Bell, Filter, Menu, X, TrendingDown, TrendingUp, Star, Package, AlertCircle, ExternalLink, Lock, Crown } from "lucide-react";
import { FiltersProvider, useFilters } from "@/components/dashboard/FiltersContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/App";
import OnboardingModal, { OnboardingData } from "@/components/modals/OnboardingModal";
import { toast } from "@/hooks/use-toast";

// Type definitions
interface NotificationDetails {
  product_id?: number;
  product_title?: string;
  old_price?: number;
  new_price?: number;
  discount_percent?: number;
  rating?: number;
  rating_count?: number;
  estimated_sales?: number;
  sales_volume?: string;
  price?: number;
  created_at?: string;
}

interface Notification {
  id: string;
  type: string;
  severity: string;
  platform?: string;
  message: string;
  time: string;
  details?: NotificationDetails;
}

type AlertType = "price_drop" | "price_increase" | "review_spike" | "sales_spike" | "new_product" | string;
type SeverityType = "high" | "medium" | "low" | string;

function DashboardContent() {
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Notification | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Seller Mode state
  const [sidebarMode, setSidebarMode] = useState<string>(localStorage.getItem("sidebar-mode") || "explorer");
  const [localSellerId, setLocalSellerId] = useState<string | null>(null);

  // Subscription hooks
  const { limits, canAccessFeature, currentTier } = useSubscriptionLimits();
  const { updateSubscriptionInDB } = useSubscriptionSync();
  const { user, refreshUser } = useAuth();

  const { filters, setFilters } = useFilters();
  const BASE_URL = "http://localhost:8000";

  const selectedSource = filters.table || "amazon";

  const fetchNotifications = async (source: string) => {
    try {
      // Calculate notification limit based on subscription
      const maxNotifications = limits.maxNotifications >= UNLIMITED
        ? 50
        : limits.maxNotifications;

      const limit = Math.min(50, maxNotifications);
      const res = await fetch(`${BASE_URL}/notifications?table=${source}&limit=${limit}`);
      const data = await res.json();

      if (data?.data) {
        const fetchedNotifications = data.data;

        // Check if user has hit their notification limit
        const hasReachedLimit = limits.maxNotifications < UNLIMITED &&
          fetchedNotifications.length >= limits.maxNotifications;

        if (hasReachedLimit) {
          // Add upgrade prompt notification
          setNotifications([
            ...fetchedNotifications.slice(0, limits.maxNotifications),
            {
              id: 'upgrade-prompt',
              type: 'upgrade',
              severity: 'info',
              message: `🔒 You've reached your ${limits.maxNotifications} notification limit. Upgrade to ${currentTier === 'free' ? 'Basic' : 'Premium'} for ${currentTier === 'free' ? '15' : 'unlimited'} alerts.`,
              time: 'Now',
            }
          ]);
        } else {
          setNotifications(fetchedNotifications);
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications(selectedSource);
    const interval = setInterval(() => fetchNotifications(selectedSource), 30000);
    return () => clearInterval(interval);
  }, [selectedSource, currentTier]);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  // Listen for sidebar mode changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setSidebarMode(localStorage.getItem("sidebar-mode") || "explorer");
    };
    window.addEventListener("storage", handleStorageChange);
    // Also poll for changes (since same-tab storage events don't fire)
    const interval = setInterval(() => {
      const current = localStorage.getItem("sidebar-mode") || "explorer";
      setSidebarMode(prev => prev !== current ? current : prev);
    }, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/onboarding`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast({
          title: "Welcome onboard! 🚀",
          description: "Your personalized dashboard is being set up.",
        });
        await refreshUser();
        setIsOnboardingOpen(false);
      } else {
        throw new Error("Failed to save onboarding data");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSourceChange = (newSource: string) => {
    setFilters({ ...filters, table: newSource });
    fetchNotifications(newSource);
  };

  const handleUpgradeClick = () => {
    // Navigate to subscription page
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
    // If it's the upgrade prompt, navigate to subscription page
    if (notification.id === 'upgrade-prompt') {
      handleUpgradeClick();
      return;
    }

    setSelectedAlert(notification);
    setIsAlertDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg 
          rounded-none sm:rounded-2xl 
          px-4 sm:px-6 lg:px-8 
          py-4 sm:py-5 
          mb-4 sm:mb-6 
          flex flex-col sm:flex-row items-start sm:items-center 
          justify-between gap-4 sm:gap-0 
          sticky top-0 sm:top-4 
          z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-sky-900" />
            </button>

            <div className="flex-1 sm:flex-none">
              <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
                Dashboard{" "}
                <span className="w-5 h-3 sm:w-6 sm:h-4 inline-block">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                    alt="Indian Flag"
                    className="w-full h-full object-cover"
                  />
                </span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Real-time competitor alerts from {selectedSource === "amazon" ? "Amazon" : "Flipkart"}
                {" • "}
                <span className="font-semibold text-sky-600">{currentTier.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs sm:text-sm"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </Button>

            <select
              className="flex-1 sm:flex-none border border-slate-300 rounded px-2 py-1 text-xs sm:text-sm bg-white/60 backdrop-blur-sm"
              value={selectedSource}
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              <option value="flipkart">Flipkart</option>
              <option value="amazon">Amazon</option>
              <option value="both">All</option>
            </select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                  {/* Show lock icon if limited */}
                  {limits.maxNotifications < UNLIMITED && (
                    <Lock className="absolute -bottom-1 -right-1 w-3 h-3 text-amber-500 bg-white rounded-full p-0.5" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-96 max-w-[95vw] rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md max-h-[80vh] overflow-y-auto"
              >
                <DropdownMenuLabel className="font-semibold text-slate-800 text-base sticky top-0 bg-white/95 backdrop-blur-md z-10 pb-2">
                  🚨 Competitor Alerts ({selectedSource})
                  <p className="text-xs font-normal text-slate-500 mt-1 flex items-center gap-1">
                    Real-time price, review & sales monitoring
                    {limits.maxNotifications < UNLIMITED && (
                      <span className="text-amber-600 font-medium">
                        • {notifications.filter(n => n.id !== 'upgrade-prompt').length}/{limits.maxNotifications} alerts
                      </span>
                    )}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                  <DropdownMenuItem className="text-sm text-slate-500 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 w-full">
                      <Bell className="w-8 h-8 text-slate-300" />
                      <p>No competitor alerts</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col items-start py-3 px-4 border-b last:border-none border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${n.id === 'upgrade-prompt' ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                        }`}
                      onClick={() => handleNotificationAction(n)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-1">
                          {getAlertIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0 ${getSeverityColor(n.severity)}`}
                            >
                              {n.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {n.type.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-xs text-slate-500">
                            {n.time}
                          </p>
                          {n.details && n.id !== 'upgrade-prompt' && (
                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded p-2">
                              {n.details.discount_percent && (
                                <p className="font-semibold text-red-600">
                                  💰 Save {n.details.discount_percent}%
                                  {n.details.old_price && n.details.new_price &&
                                    ` (₹${n.details.old_price} → ₹${n.details.new_price})`
                                  }
                                </p>
                              )}
                              {n.details.rating && (
                                <p>⭐ Rating: {n.details.rating}</p>
                              )}
                              {n.details.sales_volume && (
                                <p>📦 Sales: {n.details.sales_volume}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      </div>
                    </DropdownMenuItem>
                  ))
                )}

                <DropdownMenuSeparator />
                <div className="flex gap-2 p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setNotifications([])}
                  >
                    Clear all
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-sky-600 hover:bg-sky-700"
                    onClick={() => fetchNotifications(selectedSource)}
                  >
                    Refresh
                  </Button>
                </div>

                {/* Upgrade Prompt in Dropdown */}
                {!canAccessFeature('hasRealTimeAlerts') && notifications.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-blue-900 font-medium block">
                          Upgrade to Premium for real-time alerts
                        </span>
                        <Button
                          size="sm"
                          className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={handleUpgradeClick}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 sm:px-6 py-4 border border-sky-100 rounded-xl sm:rounded-2xl 
            bg-white/70 backdrop-blur-xl mx-4 sm:mx-6 mb-4 sm:mb-6 transition-all duration-300">
            <FiltersPanel selectedSource={selectedSource} />
          </div>
        )}

        {/* Main Content */}
        <main className="px-4 sm:px-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-6">
          {sidebarMode === "seller" ? (
            // ── Seller Mode ──
            (user?.seller_id || localSellerId) ? (
              <SellerDashboardView />
            ) : (
              <SellerIdInput onSaved={(id) => {
                setLocalSellerId(id);
                refreshUser();
              }} />
            )
          ) : (
            // ── Explorer Mode (unchanged) ──
            <>
              <MetricsCards selectedSource={selectedSource} />
              <ChartsGrid selectedSource={selectedSource} />
              <AIRecommendations selectedSource={selectedSource} />
              <ProductRankings selectedSource={selectedSource} />
            </>
          )}

          {/* Disclaimer */}
          <div className="mt-1 pt-1 border-t border-slate-100">
            <p className="text-[10px] text-center text-slate-400 leading-tight opacity-60">
              <span className="font-medium">Disclaimer:</span> The data and insights presented in this dashboard are for informational purposes only.
              While we strive for accuracy, we cannot guarantee the completeness or reliability of the information.
              Please verify critical data independently before making business decisions.
            </p>
          </div>
        </main>
      </div>



      {/* Alert Details Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              Competitor Alert Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this competitor activity
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-6 mt-4">
              {/* Alert Type & Severity */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-sm px-3 py-1 ${getSeverityColor(selectedAlert.severity)}`}
                >
                  {selectedAlert.severity.toUpperCase()} PRIORITY
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {selectedAlert.type.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {selectedAlert.platform && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {selectedAlert.platform}
                  </Badge>
                )}
              </div>

              {/* Main Message */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Alert Message</h3>
                <p className="text-slate-700">{selectedAlert.message}</p>
                <p className="text-sm text-slate-500 mt-2">{selectedAlert.time}</p>
              </div>

              {/* Product Details */}
              {selectedAlert.details && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Product Details</h3>

                  {selectedAlert.details.product_title && (
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-sm text-slate-500 mb-1">Product Name</p>
                      <p className="font-medium">{selectedAlert.details.product_title}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price Information */}
                    {(selectedAlert.details.new_price || selectedAlert.details.price) && (
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-slate-500 mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{selectedAlert.details.new_price || selectedAlert.details.price}
                        </p>
                        {selectedAlert.details.old_price && (
                          <p className="text-sm text-slate-500 line-through mt-1">
                            Was: ₹{selectedAlert.details.old_price}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Discount */}
                    {selectedAlert.details.discount_percent && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 mb-1">Discount</p>
                        <p className="text-2xl font-bold text-red-600">
                          {selectedAlert.details.discount_percent}% OFF
                        </p>
                      </div>
                    )}

                    {/* Rating */}
                    {selectedAlert.details.rating && (
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-slate-500 mb-1">Rating</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          {selectedAlert.details.rating} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </p>
                        {selectedAlert.details.rating_count && (
                          <p className="text-sm text-slate-500 mt-1">
                            {selectedAlert.details.rating_count} reviews
                          </p>
                        )}
                      </div>
                    )}

                    {/* Sales Volume */}
                    {selectedAlert.details.sales_volume && (
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-slate-500 mb-1">Sales Volume</p>
                        <p className="text-xl font-bold text-blue-600">
                          {selectedAlert.details.sales_volume}
                        </p>
                      </div>
                    )}

                    {/* Estimated Sales */}
                    {selectedAlert.details.estimated_sales && (
                      <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-slate-500 mb-1">Estimated Sales</p>
                        <p className="text-xl font-bold text-blue-600">
                          {selectedAlert.details.estimated_sales.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    alert("WhatsApp alert feature coming soon!");
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Send WhatsApp Alert
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    alert("Email alert feature coming soon!");
                  }}
                >
                  📧 Send Email Alert
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (selectedAlert.details?.product_title) {
                      navigator.clipboard.writeText(selectedAlert.details.product_title);
                      alert("Product name copied to clipboard!");
                    }
                  }}
                >
                  📋 Copy Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <FiltersProvider>
      <DashboardContent />
    </FiltersProvider>
  );
}
