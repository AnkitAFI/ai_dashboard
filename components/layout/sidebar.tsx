"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  MessageSquare,
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
  Star,
  Bookmark,
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
    ],
  },
  {
    label: "DISCOVER MARKET",
    icon: Compass,
    items: [
      { href: "/categories", label: "Browse Categories", icon: PieChart },
      { href: "/sales", label: "Top Selling Products", icon: TrendingUp },
    ],
  },
  {
    label: "BEAT COMPETITION",
    icon: Sword,
    items: [
      { href: "/explorer/white-space-finder", label: "Opportunity Finder", icon: ShieldCheck, badge: "NEW" },
      { href: "/share-of-voice", label: "Market Visibility", icon: BarChart3 },
      { href: "/keyword-intelligence", label: "Keyword Tracker", icon: History },
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
      { href: "/explorer/whatsapp-alerts", label: "WhatsApp Alerts", icon: MessageSquare, badge: "NEW" },
      { href: "/explorer/festive-trends", label: "Festive Trends", icon: Star, badge: "NEW", disabled: true },
      { href: "/explorer/my-watchlist", label: "My Watchlist", icon: Bookmark, badge: "NEW" },
    ],
  },
  {
    label: "SETTINGS",
    icon: Settings,
    items: [
      { href: "/subscription", label: "Subscription", icon: Crown },
      { href: "/about", label: "About", icon: Info },
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
      { href: "/categories", label: "Browse Categories", icon: PieChart },
      { href: "/seller/price-comparison", label: "Price Comparison", icon: DollarSign, badge: "NEW" },
      { href: "/seller/review-comparison", label: "Review Comparison", icon: Star, badge: "NEW" },
      { href: "/seller/keyword-gap", label: "Keyword Gap Analysis", icon: History, badge: "NEW" },
      { href: "/sales", label: "Top Selling Products", icon: TrendingUp },
      { href: "/seller/competitor-analysis", label: "Competitor Analysis", icon: Shield, badge: "NEW" },
    ],
  },
  {
    label: "OPTIMIZE",
    icon: Zap,
    items: [
      { href: "/seller/price-optimizer", label: "Price Optimizer", icon: TrendingUp },
      { href: "/keyword-tracker", label: "Keyword Tracker", icon: History },
      { href: "/seller/ai-advisor", label: "AI Advisor", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    label: "TRACK & GROW",
    icon: Activity,
    items: [
      { href: "/share-of-voice", label: "Market Visibility", icon: BarChart3 },
      { href: "/seller/whatsapp-alerts", label: "WhatsApp Alerts", icon: MessageSquare, badge: "NEW" },
      { href: "/seller/festive-trends", label: "Festive Trends", icon: Star, badge: "NEW", disabled: true },
      { href: "/seller/rank-tracker", label: "Rank Tracker", icon: Target, badge: "NEW" },
    ],
  },
  {
    label: "SETTINGS",
    icon: Settings,
    items: [
      { href: "/subscription", label: "Subscription", icon: Crown },
      { href: "/about", label: "About", icon: Info },
      { href: "/order-history", label: "Order History", icon: Receipt },
    ],
  },
];



interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<'explorer' | 'seller'>('explorer');

  // Sync isCollapsed with isMobileOpen on mobile
  useEffect(() => {
    // Only force collapse state based on mobile prop if on mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) { // 1024 is 'lg' breakpoint
        if (isMobileOpen !== undefined) {
          setIsCollapsed(!isMobileOpen);
        }
      } else {
        // On desktop, keep it expanded to match layout margin
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen]);

  useEffect(() => {
    const savedMode = localStorage.getItem('sidebar-mode');
    if (savedMode === 'explorer' || savedMode === 'seller') {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-mode', mode);
    window.dispatchEvent(new Event('sidebar-mode-changed'));
  }, [mode]);

  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
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
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === href;
  };

  const getDisplayName = () => {
    if (!user) return "User";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    if (user.name) return user.name;
    return "User";
  };

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
      {(!isCollapsed || isMobileOpen) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            setIsCollapsed(true);
            onClose?.();
          }}
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
            <Link href="/" className="cursor-pointer">
              <img
                src="/logo.png"
                alt="Insydz Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-md hover:scale-105 transition"
              />
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
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) onClose?.();
            }}
            className="lg:hidden text-slate-600"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mode Toggle */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div
              className="relative p-1 rounded-full flex items-center"
              style={{
                background: 'linear-gradient(135deg, #00C6FF 0%, #0099FF 50%, #00D4AA 100%)',
                boxShadow: '0 2px 10px rgba(0, 198, 255, 0.3)',
              }}
            >
              <button
                onClick={() => {
                  setMode('explorer');
                  router.push("/dashboard");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 z-10 relative",
                  mode === 'explorer'
                    ? "bg-white text-[#003366] shadow-lg"
                    : "bg-transparent text-white hover:text-white/90"
                )}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Explorer
              </button>
              <button
                onClick={() => {
                  setMode('seller');
                  router.push("/dashboard");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 z-10 relative",
                  mode === 'seller'
                    ? "bg-white text-[#003366] shadow-lg"
                    : "bg-transparent text-white hover:text-white/90"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Seller
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
                    <Link key={item.href} href={item.disabled ? "#" : item.href}
                      className={cn(item.disabled && "cursor-not-allowed block")}>
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
            <Link href="/settings" className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-sm hover:scale-105 transition-transform">
              <Settings className="h-4 w-4" />
            </Link>

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




