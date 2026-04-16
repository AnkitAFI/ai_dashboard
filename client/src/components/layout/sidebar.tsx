import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import {
  Home,
  Crown,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Receipt,
  DollarSign,
  PieChart,
  Users,
  History,
  Target,
  BarChart3,
  Search,
  Rocket,
  Compass,
  ShieldCheck,
  Tag,
  Activity,
  Sparkles,
  Sword,
  Shield,
  Store,
  Zap,
  User,
  Star,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

interface NavSection {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const EXPLORER_SECTIONS: NavSection[] = [
  {
    label: "GET STARTED",
    icon: Rocket,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/explorer/start-here", label: "Start Here Guide", icon: Rocket, badge: "NEW" },
    ],
  },
  {
    label: "DISCOVER MARKET",
    icon: Compass,
    items: [
      { href: "/categories", label: "Browse Categories", icon: PieChart },
      { href: "/sales", label: "Top Selling Products", icon: TrendingUp },
      { href: "/explorer/product-research", label: "Product Research", icon: Search, badge: "NEW" },
    ],
  },
  {
    label: "BEAT COMPETITION",
    icon: Sword,
    items: [
      { href: "/explorer/competitor-prices", label: "Competitor Prices", icon: Shield, badge: "NEW" },
      { href: "/explorer/review-analytics", label: "Review Analytics", icon: Users, badge: "NEW" },
      { href: "/explorer/white-space-finder", label: "Opportunity Finder", icon: ShieldCheck, badge: "NEW" },
      { href: "/share-of-voice", label: "Market Visibility", icon: BarChart3 },
      { href: "/keyword-tracker", label: "Keyword Tracker", icon: History },
    ],
  },
  {
    label: "DECIDE & PRICE",
    icon: Tag,
    items: [
      { href: "/product-tracker", label: "Product Radar (AI)", icon: Target },
      { href: "/explorer/profitability-optimizer", label: "Price Optimizer", icon: Calculator, badge: "NEW" },
      { href: "/explorer/ai-advisor", label: "AI Advisor", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    label: "TRACK & GROW",
    icon: Activity,
    items: [
      { href: "/explorer/whatsapp-alerts", label: "WhatsApp Alerts", icon: Menu, badge: "NEW" },
      { href: "/explorer/festive-trends", label: "Festive Trends", icon: TrendingUp, badge: "SOON", disabled: true },
      { href: "/explorer/my-watchlist", label: "My Watchlist", icon: History, badge: "NEW" },
    ],
  },
  {
    label: "USERS",
    icon: Users,
    items: [
      { href: "/subscription", label: "Subscription", icon: Crown },
      { href: "/about", label: "About", icon: Info },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/order-history", label: "Order History", icon: Receipt },
    ],
  },
];

const SELLER_SECTIONS: NavSection[] = [
  {
    label: "MY STORE",
    icon: Store,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/seller/my-products", label: "My Products", icon: Tag, badge: "NEW" },
      { href: "/seller/listing-audit", label: "Listing Audit", icon: Search, badge: "NEW" },
    ],
  },
  {
    label: "COMPETITORS",
    icon: Users,
    items: [
      { href: "/seller/price-comparison", label: "Price Comparison", icon: DollarSign, badge: "NEW" },
      { href: "/seller/review-comparison", label: "Review Comparison", icon: Star, badge: "NEW" }, // Added Star icon below
      { href: "/seller/keyword-gap", label: "Keyword Gap Analysis", icon: History, badge: "NEW" },
    ],
  },
  {
    label: "OPTIMIZE",
    icon: Zap,
    items: [
      { href: "/seller/price-optimizer", label: "Price Optimizer", icon: TrendingUp, badge: "NEW" },
      { href: "/seller/seo-optimizer", label: "SEO Optimizer", icon: Search, badge: "NEW" },
      { href: "/seller/ai-advisor", label: "AI Advisor", icon: Sparkles, badge: "NEW" },
    ],
  },
  {
    label: "MONITOR",
    icon: Activity,
    items: [
      { href: "/keyword-tracker", label: "Rank Tracker", icon: History },
      { href: "/share-of-voice", label: "Market Visibility", icon: BarChart3 },
      { href: "/seller/whatsapp-alerts", label: "WhatsApp Alerts", icon: Menu, badge: "NEW" },
      { href: "/seller/festive-trends", label: "Festive Trends", icon: TrendingUp, badge: "SOON", disabled: true },
    ],
  },
  {
    label: "USERS",
    icon: User,
    items: [
      { href: "/subscription", label: "Subscription", icon: Crown },
      { href: "/about", label: "About", icon: Info },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/order-history", label: "Order History", icon: Receipt },
    ],
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'explorer' | 'seller'>(() => {
    // Persistent mode storage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('sidebar-mode');
      if (savedMode === 'explorer' || savedMode === 'seller') return savedMode;
    }
    return 'explorer';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-mode', mode);
  }, [mode]);

  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();

  // ✅ REMOVED: localStorage effect - now using auth context
  // User data comes directly from the auth context

  const handleLogout = async () => {
    try {
      await logout(); // ✅ Calls backend to clear session
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";

    // Try firstName and lastName first
    if (user.firstName || user.lastName) {
      const first = user.firstName?.[0] || "";
      const last = user.lastName?.[0] || "";
      return `${first}${last}`.toUpperCase() || "U";
    }

    // Fallback to name field
    if (user.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }

    // Final fallback
    return "U";
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return "bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-white";
      case "basic":
        return "bg-[#B3E5FC] text-[#004C75]";
      default:
        return "bg-slate-200 text-gray-700";
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === href;
  };

  const getDisplayName = () => {
    if (!user) return "User";

    // Try firstName and lastName
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }

    // Fallback to name field
    if (user.name) {
      return user.name;
    }

    // Final fallback
    return "User";
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 z-50 flex items-center justify-center border-r border-white/20 backdrop-blur-2xl bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0072FF] mx-auto"></div>
          <p className="text-sm text-slate-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 flex flex-col border-r border-white/20 backdrop-blur-2xl shadow-lg",
          "bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90",
          isCollapsed ? "w-16 -translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            {/* ✅ CLICKABLE LOGO */}
            <Link href="/">
              <a className="cursor-pointer">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-10 h-10 object-contain rounded-xl shadow-md hover:scale-105 transition"
                />
              </a>
            </Link>

            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-[#003366] tracking-tight">Insydz</h1>
                <p className="text-xs text-slate-600">Analytics Dashboard</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden text-slate-600"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mode Toggle */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="bg-[#1e293b]/20 p-1.5 rounded-2xl flex items-center border border-white/10 backdrop-blur-md">
              <button
                onClick={() => {
                  setMode('explorer');
                  setLocation("/dashboard");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-[10px] font-bold transition-all duration-300",
                  mode === 'explorer'
                    ? "bg-[#F97316] text-white shadow-lg scale-[1.02]"
                    : "text-slate-600 hover:text-[#003366] hover:bg-white/40"
                )}
              >
                <Search className="w-4 h-4 mr-2" />
                Explorer Mode
              </button>
              <button
                onClick={() => {
                  setMode('seller');
                  setLocation("/dashboard");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-[10px] font-bold transition-all duration-300",
                  mode === 'seller'
                    ? "bg-[#F97316] text-white shadow-lg scale-[1.02]"
                    : "text-slate-600 hover:text-[#003366] hover:bg-white/40"
                )}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Seller Mode
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 sidebar-scroll">
          {(mode === 'explorer' ? EXPLORER_SECTIONS : SELLER_SECTIONS).map(section => (
            <div key={section.label} className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center space-x-2 px-2">
                  {section.icon && <section.icon className="h-3 w-3 text-slate-400" />}
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">
                    {section.label}
                  </p>
                  <div className="h-[1px] flex-1 bg-slate-200/50" />
                </div>
              )}

              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.disabled ? "#" : item.href}>
                      <a className={cn(item.disabled && "cursor-not-allowed")}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          disabled={item.disabled}
                          className={cn(
                            "w-full justify-start transition-all duration-200 rounded-xl font-medium relative group",
                            isCollapsed && "justify-center px-2",
                            isActive(item.href)
                              ? "bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-md"
                              : "text-slate-700 hover:bg-white/60",
                            item.disabled && "opacity-50 grayscale select-none"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate text-sm">{item.label}</span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "ml-2 text-[8px] px-1.5 py-0 leading-none h-4 uppercase font-bold tracking-tighter",
                                    item.badge === "AI" ? "bg-orange-100 text-orange-600 border-orange-200" :
                                      item.badge === "NEW" ? "bg-blue-100 text-blue-600 border-blue-200" :
                                        "bg-slate-100 text-slate-500 border-slate-200"
                                  )}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          )}
                        </Button>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="p-2 px-3 border-t border-white/20 backdrop-blur-lg">
          <div className={cn(
            "flex items-center p-2 bg-white/70 rounded-xl shadow-sm",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex-1 ml-2.5 min-w-0">
                <p className="font-semibold text-sm text-[#003366] truncate">
                  {getDisplayName()}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] mt-0.5 font-medium px-2 py-0 rounded-full leading-relaxed",
                    getSubscriptionColor(user?.subscriptionTier || "free")
                  )}
                >
                  {user?.subscriptionTier
                    ? `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`
                    : "Free Plan"
                  }
                </Badge>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn("text-slate-500 hover:text-[#0072FF] h-8 w-8 p-0", isCollapsed && "p-2")}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
