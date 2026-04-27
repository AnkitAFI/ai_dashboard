"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Filter, Menu, TrendingDown, TrendingUp, Star, Package, AlertCircle, ExternalLink, Lock, Crown } from "lucide-react";
import { useFilters } from "@/components/dashboard/filters-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/use-subscription-limits";
import { useRouter, usePathname } from "next/navigation";
import { useAlerts, Notification, NotificationDetails } from "@/components/dashboard/alert-context";

// Types are now imported from alert-context

type AlertType = "price_drop" | "price_increase" | "review_spike" | "sales_spike" | "new_product" | string;
type SeverityType = "high" | "medium" | "low" | string;

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  onFilterToggle: () => void;
  showFilters: boolean;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/overview": {
    title: "Dashboard",
    subtitle: "Real-time competitor alerts & marketplace insights",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Real-time competitor alerts & marketplace insights",
  },
  "/seller/products": {
    title: "My Products",
    subtitle: "Manage and track your active inventory",
  },
  "/seller/ai-advisor": {
    title: "AI Advisor",
    subtitle: "Smart insights and recommendations for your business",
  },
  "/explorer/competitor-prices": {
    title: "Competitor Prices",
    subtitle: "Track price movements across major platforms",
  },
  "/explorer/profitability-optimizer": {
    title: "Profitability Optimizer",
    subtitle: "Calculate margins and optimize your pricing strategy",
  },
  "/explorer/review-analytics": {
    title: "Review Analytics",
    subtitle: "Understand customer sentiment and feedback trends",
  },
  "/explorer/white-space-finder": {
    title: "White Space Finder",
    subtitle: "Discover untapped market opportunities",
  },
  "/order-history": {
    title: "Order History",
    subtitle: "View and manage your subscription billing",
  },
  "/subscription": {
    title: "Subscription",
    subtitle: "Manage your plan and usage limits",
  },
};

export function DashboardHeader({ onMobileMenuToggle, onFilterToggle, showFilters }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { filters, setFilters } = useFilters();
  const { limits, canAccessFeature, currentTier } = useSubscriptionLimits();
  const { showAlertDetails } = useAlerts();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const selectedSource = filters.table || "amazon";
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const currentRoute = ROUTE_TITLES[pathname] || {
    title: pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard",
    subtitle: "AI-powered marketplace intelligence",
  };

  const isDashboard = pathname === "/overview" || pathname === "/dashboard" || pathname === "/" || pathname === "/seller/my-products";

  const fetchNotifications = async (source: string) => {
    try {
      const maxNotifications = limits.maxNotifications >= UNLIMITED ? 50 : limits.maxNotifications;
      const limit = Math.min(50, maxNotifications);
      const res = await fetch(`${BASE_URL}/notifications?table=${source}&limit=${limit}`, { cache: 'no-store' });
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
            {currentRoute.title} {isDashboard && (
              <span className="w-5 h-3 sm:w-6 sm:h-4 inline-block">
                <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="Indian Flag" className="w-full h-full object-cover shadow-sm rounded-sm" />
              </span>
            )}
          </h2>
          <p className="text-slate-600 text-[10px] sm:text-xs">
            {currentRoute.subtitle} • <span className="font-semibold text-sky-600">{currentTier.toUpperCase()}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {isDashboard && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all ${showFilters ? 'bg-sky-100 border-sky-300 text-sky-700 shadow-sm' : ''}`} 
            onClick={onFilterToggle}
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{showFilters ? "Hide Filters" : "Filters"}</span>
          </Button>
        )}

        <select 
          className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium" 
          value={selectedSource} 
          onChange={(e) => handleSourceChange(e.target.value)}
        >
          <option value="flipkart">Flipkart</option>
          <option value="amazon">Amazon</option>
          <option value="both">All Platforms</option>
        </select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2 h-9 w-9 rounded-xl hover:bg-sky-50 transition-colors">
              <Bell className="w-4 h-4 sm:w-5 h-5 text-sky-900" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-sm ring-2 ring-white">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 max-w-[95vw] rounded-2xl shadow-2xl bg-white max-h-[80vh] overflow-y-auto border-slate-200">
            <DropdownMenuLabel className="font-bold text-slate-800 text-base sticky top-0 bg-white z-10 p-4 border-b border-slate-100">
              🚨 Competitor Alerts
              <p className="text-[10px] font-normal text-slate-500 mt-1 flex items-center gap-1">
                Real-time marketplace monitoring
                {limits.maxNotifications < UNLIMITED && (
                  <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> {notifications.filter(n => n.id !== 'upgrade-prompt').length}/{limits.maxNotifications}
                  </span>
                )}
              </p>
            </DropdownMenuLabel>
            {notifications.length === 0 ? (
              <div className="text-sm text-slate-500 py-12 text-center">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-xs text-slate-400">No new alerts at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={`flex flex-col items-start py-4 px-4 hover:bg-sky-50/50 cursor-pointer transition-colors outline-none ${n.id === 'upgrade-prompt' ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50' : ''}`} 
                    onClick={() => {
                      if (n.id === 'upgrade-prompt') {
                        router.push("/subscription");
                      } else {
                        showAlertDetails(n);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-1 flex-shrink-0">{getAlertIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold border-0 ${getSeverityColor(n.severity)}`}>{n.severity.toUpperCase()}</Badge>
                          <span className="text-[10px] text-slate-400 font-medium tracking-wider">{n.type.replace(/_/g, " ").toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> {n.time}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1" />
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <div className="sticky bottom-0 bg-white p-3 border-t border-slate-100 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1 text-xs font-bold text-slate-500 hover:text-slate-700" onClick={() => setNotifications([])}>Clear All</Button>
              <Button size="sm" className="flex-1 text-xs font-bold bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-100" onClick={() => fetchNotifications(selectedSource)}>Refresh Feed</Button>
            </div>
            {!canAccessFeature('hasRealTimeAlerts') && notifications.length > 0 && (
              <div className="m-3 p-4 bg-gradient-to-br from-indigo-600 to-sky-600 rounded-xl text-white shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold mb-1">Unlock Real-Time Intelligence</p>
                    <p className="text-[10px] text-sky-100 mb-3 opacity-90">Get instant price & review alerts before competitors react.</p>
                    <Button size="sm" className="w-full bg-white text-sky-600 hover:bg-sky-50 font-bold text-[10px] h-8 rounded-lg" onClick={() => router.push("/subscription")}>
                      Upgrade to Premium
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
