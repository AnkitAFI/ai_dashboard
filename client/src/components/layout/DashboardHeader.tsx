"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Filter, Menu, X, TrendingDown, TrendingUp, Star, Package, AlertCircle, ExternalLink, Lock, Crown } from "lucide-react";
import { useFilters } from "@/components/dashboard/FiltersContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";
import { useRouter } from "next/navigation";

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

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  onFilterToggle: () => void;
  showFilters: boolean;
}

export function DashboardHeader({ onMobileMenuToggle, onFilterToggle, showFilters }: DashboardHeaderProps) {
  const router = useRouter();
  const { filters, setFilters } = useFilters();
  const { limits, canAccessFeature, currentTier } = useSubscriptionLimits();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const selectedSource = filters.table || "amazon";
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchNotifications = async (source: string) => {
    try {
      const maxNotifications = limits.maxNotifications >= UNLIMITED ? 50 : limits.maxNotifications;
      const limit = Math.min(50, maxNotifications);
      const res = await fetch(`${BASE_URL}/notifications?table=${source}&limit=${limit}`);
      const data = await res.json();

      if (data?.data) {
        const fetchedNotifications = data.data;
        const hasReachedLimit = limits.maxNotifications < UNLIMITED && fetchedNotifications.length >= limits.maxNotifications;

        if (hasReachedLimit) {
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
  }, [selectedSource, currentTier, limits.maxNotifications]);

  const handleSourceChange = (newSource: string) => {
    setFilters({ ...filters, table: newSource });
  };

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

  return (
    <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-none sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 sticky top-0 sm:top-4 z-20 mx-0 sm:mx-6">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button onClick={onMobileMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors">
          <Menu className="w-5 h-5 text-sky-900" />
        </button>
        <div className="flex-1 sm:flex-none">
          <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
            Dashboard <span className="w-5 h-3 sm:w-6 sm:h-4 inline-block">
              <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="Indian Flag" className="w-full h-full object-cover" />
            </span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Real-time competitor alerts from {selectedSource === "amazon" ? "Amazon" : "Flipkart"} • <span className="font-semibold text-sky-600">{currentTier.toUpperCase()}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-xs sm:text-sm" onClick={onFilterToggle}>
          <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{showFilters ? "Hide Filters" : "Filters"}</span>
          <span className="sm:hidden">Filter</span>
        </Button>

        <select className="flex-1 sm:flex-none border border-slate-300 rounded px-2 py-1 text-xs sm:text-sm bg-white/60 backdrop-blur-sm" value={selectedSource} onChange={(e) => handleSourceChange(e.target.value)}>
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
              {limits.maxNotifications < UNLIMITED && (
                <Lock className="absolute -bottom-1 -right-1 w-3 h-3 text-amber-500 bg-white rounded-full p-0.5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 max-w-[95vw] rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md max-h-[80vh] overflow-y-auto">
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
                <DropdownMenuItem key={n.id} className={`flex flex-col items-start py-3 px-4 border-b last:border-none border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${n.id === 'upgrade-prompt' ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''}`} onClick={() => n.id === 'upgrade-prompt' ? router.push("/subscription") : null}>
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-1">{getAlertIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs px-2 py-0 ${getSeverityColor(n.severity)}`}>{n.severity.toUpperCase()}</Badge>
                        <span className="text-xs text-slate-400">{n.type.replace(/_/g, " ").toUpperCase()}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-500">{n.time}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <div className="flex gap-2 p-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setNotifications([])}>Clear all</Button>
              <Button size="sm" className="flex-1 text-xs bg-sky-600 hover:bg-sky-700" onClick={() => fetchNotifications(selectedSource)}>Refresh</Button>
            </div>
            {!canAccessFeature('hasRealTimeAlerts') && notifications.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-blue-900 font-medium block">Upgrade to Premium for real-time alerts</span>
                    <Button size="sm" className="mt-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => router.push("/subscription")}>
                      <Crown className="w-3 h-3 mr-1" /> Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
