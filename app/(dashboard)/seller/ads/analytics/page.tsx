"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { BarChart, Activity, DollarSign, TrendingUp, AlertCircle, RefreshCw, Zap, Menu, Lock, Crown, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  profile_id: string;
  country_code: string;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
  spend: number;
  sales: number;
  acos: number;
}

// ── Tier Gate ─────────────────────────────────────────────────────────────────
function TierGate({ tier, feature, isDark }: { tier: "premium" | "enterprise"; feature: string; isDark: boolean }) {
  const router = useRouter();
  return (
    <div className={`absolute inset-0 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center z-10 gap-3 ${isDark ? 'bg-slate-900/85' : 'bg-white/85'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : isDark ? "bg-blue-900/50" : "bg-blue-50"}`}>
        <Lock className={`w-5 h-5 ${tier === "enterprise" ? isDark ? "bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/50" : "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300" : isDark ? "text-blue-400" : "text-blue-500"}`} />
      </div>
      <div className="text-center px-4">
        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feature}</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{tier === "premium" ? "Premium · ₹2,999/mo" : "Enterprise · Custom Pricing"}</p>
      </div>
      <button onClick={() => router.push("/subscription")}
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${tier === "enterprise" ? "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}>
        <Crown className="w-3 h-3" /> Upgrade
      </button>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedCampaignForKeywords, setSelectedCampaignForKeywords] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [customDate, setCustomDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const actualDateParam = dateRange === "custom" && customDate?.from && customDate?.to 
    ? `${format(customDate.from, "yyyy-MM-dd")}|${format(customDate.to, "yyyy-MM-dd")}`
    : dateRange;
  
  const { theme, resolvedTheme } = useTheme();
  const { toggle } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  // Automations State
  const [daypartingOpen, setDaypartingOpen] = useState(false);
  const [daypartingDays, setDaypartingDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  });
  const [daypartingHours, setDaypartingHours] = useState([8, 22]); // 8 AM to 10 PM
  const [daypartingActive, setDaypartingActive] = useState(false);

  const [biddingOpen, setBiddingOpen] = useState(false);
  const [targetAcos, setTargetAcos] = useState(25);
  const [maxIncrease, setMaxIncrease] = useState(20);
  const [maxDecrease, setMaxDecrease] = useState(15);
  const [biddingActive, setBiddingActive] = useState(false);
  
  const handleSaveDayparting = async () => {
    if (!selectedProfile) return;
    try {
      const res = await fetch(`${API_BASE_URL}/amazon-ads/analytics/automations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          rule_type: "DAYPARTING",
          rule_config: {
            days: daypartingDays,
            hours: daypartingHours
          }
        })
      });
      if (res.ok) {
        setDaypartingActive(true);
        setDaypartingOpen(false);
        toast({
          title: "Dayparting Automation Saved",
          description: "These rules will run automatically in the background.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBidding = async () => {
    if (!selectedProfile) return;
    try {
      const res = await fetch(`${API_BASE_URL}/amazon-ads/analytics/automations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          rule_type: "BID_ADJUSTMENT",
          rule_config: {
            target_acos: targetAcos,
            max_increase: maxIncrease,
            max_decrease: maxDecrease
          }
        })
      });
      if (res.ok) {
        setBiddingActive(true);
        setBiddingOpen(false);
        toast({
          title: "Auto Bid Adjustments Saved",
          description: `Target ACOS: ${targetAcos}%, Max Inc: ${maxIncrease}%, Max Dec: ${maxDecrease}%`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const queryClient = useQueryClient();
  const [updatingCampaign, setUpdatingCampaign] = useState<string | null>(null);
  
  // Advanced Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterMetric, setFilterMetric] = useState("spend");
  const [filterOperator, setFilterOperator] = useState(">");
  const [filterValue, setFilterValue] = useState("");
  const [filterName, setFilterName] = useState("");

  const tier = (user?.subscriptionTier || "free").toLowerCase();

  const handleStatusChange = async (campaignId: string, currentStatus: string) => {
    if (!selectedProfile || tier === "free") return;
    const newStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED";
    setUpdatingCampaign(campaignId);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${campaignId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          status: newStatus
        })
      });
      
      if (res.ok) {
        toast({
          title: "Status Updated",
          description: `Campaign is now ${newStatus.toLowerCase()} on Amazon.`,
        });
        queryClient.invalidateQueries({ queryKey: ["amazon-ads-campaigns", selectedProfile] });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update campaign status.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingCampaign(null);
    }
  };

  const isPremium = tier === "premium" || tier === "enterprise";

  // Keyword Data Fetching
  const { data: keywordsData, isLoading: keywordsLoading } = useQuery({
    queryKey: ["amazon-ads-keywords", selectedProfile, selectedCampaignForKeywords, actualDateParam],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${selectedCampaignForKeywords}/keywords?profile_id=${selectedProfile}&date_range=${actualDateParam}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch keywords");
      return await res.json();
    },
    enabled: !!selectedProfile && !!selectedCampaignForKeywords
  });

  const [updatingKeyword, setUpdatingKeyword] = useState<string | null>(null);

  const handleKeywordStatusChange = async (keywordId: string, currentStatus: string) => {
    if (!selectedProfile || tier === "free") return;
    const newStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED";
    setUpdatingKeyword(keywordId);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/keywords/${keywordId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          status: newStatus
        })
      });
      
      if (res.ok) {
        toast({ title: "Keyword Status Updated" });
        queryClient.invalidateQueries({ queryKey: ["amazon-ads-keywords"] });
      } else {
        toast({ title: "Update Failed", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingKeyword(null);
    }
  };

  // Saved Filters Fetching
  const { data: savedFilters } = useQuery({
    queryKey: ["amazon-ads-filters", selectedProfile],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/filters?profile_id=${selectedProfile}&module=amazon_ads_keywords`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch filters");
      return await res.json();
    },
    enabled: !!selectedProfile
  });

  const handleSaveFilter = async () => {
    if (!filterName || !filterValue) {
      toast({ title: "Missing fields", description: "Please enter a filter name and value.", variant: "destructive" });
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/filters`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: selectedProfile,
          module: "amazon_ads_keywords",
          filter_name: filterName,
          filter_config: { metric: filterMetric, operator: filterOperator, value: filterValue }
        })
      });
      
      if (res.ok) {
        toast({ title: "Filter Saved!" });
        queryClient.invalidateQueries({ queryKey: ["amazon-ads-filters", selectedProfile] });
        setIsFilterOpen(false);
      } else {
        toast({ title: "Failed to save filter", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Connection Status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["amazon-ads-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/status`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch status");
      return await res.json();
    }
  });

  const isConnected = statusData?.connected || false;
  const syncStatus = statusData?.sync_status || "COMPLETED";
  const isSyncing = syncStatus === "SYNCING" || syncStatus === "PENDING";

  // Fetch Connected Profiles
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ["amazon-ads-profiles"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/profiles`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      return data.profiles;
    }
  });

  // Auto-select the first profile if available
  useEffect(() => {
    if (profilesData && profilesData.length > 0 && !selectedProfile) {
      setSelectedProfile(profilesData[0].profile_id);
    }
  }, [profilesData, selectedProfile]);

  // Fetch Summary Metrics
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["amazon-ads-summary", selectedProfile, actualDateParam],
    queryFn: async () => {
      if (!selectedProfile) return null;
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/summary?profile_id=${selectedProfile}&date_range=${actualDateParam}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      return data.summary;
    },
    enabled: !!selectedProfile
  });

  // Fetch Campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["amazon-ads-campaigns", selectedProfile],
    queryFn: async () => {
      if (!selectedProfile) return null;
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns?profile_id=${selectedProfile}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      return data.campaigns;
    },
    enabled: !!selectedProfile
  });
  
  // Set default profile when loaded
  useEffect(() => {
    setMounted(true);
    if (profilesData && profilesData.length > 0 && !selectedProfile) {
      setSelectedProfile(profilesData[0].profile_id);
    }
  }, [profilesData, selectedProfile]);

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      
      {/* Header & Controls */}
      <header className={`bg-transparent border-b pb-4 mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDark ? 'border-sky-900/50' : 'border-sky-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-sky-50 hover:bg-sky-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
            <BarChart className={`w-6 h-6 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <div>
            <h1 className="page-title">
              Ads Analytics
            </h1>
            <p className="page-subtitle">
              Monitor campaign performance, ACOS, and advanced automation rules.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {profilesLoading ? (
            <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
          ) : (
            <Select 
              value={selectedProfile} 
              onValueChange={setSelectedProfile}
              disabled={tier !== "enterprise"}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Profile" />
              </SelectTrigger>
              <SelectContent>
                {profilesData?.map((p: Profile) => (
                  <SelectItem key={p.profile_id} value={p.profile_id}>
                    {p.country_code} ({p.profile_id.substring(0, 8)}...)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select 
            value={dateRange} 
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="ytd" disabled={tier === "free"}>
                <div className="flex items-center gap-2">
                  Year to Date
                  {tier === "free" && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
              </SelectItem>
              <SelectItem value="custom" disabled={tier === "free"}>
                <div className="flex items-center gap-2">
                  Custom Range...
                  {tier === "free" && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm",
                    !customDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDate?.from ? (
                    customDate.to ? (
                      <>
                        {format(customDate.from, "LLL dd, y")} -{" "}
                        {format(customDate.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDate.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDate?.from}
                  selected={customDate}
                  onSelect={setCustomDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          <Badge 
            variant="outline" 
            className={`hidden md:flex ml-2 capitalize px-3 py-1.5 text-xs shadow-sm font-bold items-center gap-1.5 ${
              tier === 'enterprise' 
                ? 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800' 
                : tier === 'premium' 
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' 
                  : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            {(tier === 'premium' || tier === 'enterprise') && <Crown className="w-3 h-3" />}
            {tier} Tier
          </Badge>
        </div>
      </header>

      {/* We always render the dashboard structure to tease features (like Automations), even with no profiles */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {syncStatus === "BACKFILLING" && (
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 flex gap-3 items-start">
              <RefreshCw className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 animate-spin shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-sky-900 dark:text-sky-200">Upgrading your data...</h4>
                <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">
                  We are securely backfilling your additional historical data for your upgraded tier. This happens safely in the background to respect Amazon's API rate limits. You can continue using the dashboard normally!
                </p>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {summaryLoading || !selectedProfile ? "--" : `₹${(summaryData?.spend || 0).toLocaleString()}`}
                    </h3>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {summaryLoading || !selectedProfile ? "--" : `₹${(summaryData?.sales || 0).toLocaleString()}`}
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ACOS</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {summaryLoading || !selectedProfile ? "--" : `${summaryData?.acos || 0}%`}
                    </h3>
                  </div>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ROAS</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {summaryLoading || !selectedProfile ? "--" : `${summaryData?.roas || 0}x`}
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
                    <BarChart className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
            <Tabs defaultValue="campaigns" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="campaigns" className="mt-0">
            <Card>
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Campaign Performance</CardTitle>
                  <CardDescription>Metrics by campaign</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : campaignsData && campaignsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Spend</TableHead>
                          <TableHead className="text-right">Sales</TableHead>
                          <TableHead className="text-right">ACOS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaignsData.map((c: Campaign) => (
                          <TableRow key={c.campaign_id}>
                            <TableCell className="font-medium">{c.campaign_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={c.status === "ENABLED"}
                                  disabled={tier === "free" || updatingCampaign === c.campaign_id}
                                  onCheckedChange={() => handleStatusChange(c.campaign_id, c.status)}
                                />
                                <span className={`text-xs font-medium ${c.status === "ENABLED" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                                  {updatingCampaign === c.campaign_id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin inline-block" />
                                  ) : (
                                    c.status
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">₹{c.spend.toLocaleString()}</TableCell>
                            <TableCell className="text-right">₹{c.sales.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{c.acos}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm">
                    {!isConnected && !statusLoading ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <span className="text-base font-medium text-foreground">No Account Connected</span>
                        <span className="text-sm mt-1 mb-4 text-center max-w-sm">
                          Connect your Amazon Ads account to view campaign metrics and configure automations.
                        </span>
                        <Button onClick={() => router.push("/seller/ads")} variant="default">
                          Connect Account
                        </Button>
                      </div>
                    ) : profilesData && profilesData.length === 0 && isSyncing ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="h-10 w-10 text-sky-500 animate-spin mb-4" />
                        <span className="text-base font-medium text-foreground">Syncing with Amazon...</span>
                        <span className="text-sm mt-1 mb-4 text-center max-w-md text-muted-foreground">
                          Your account is successfully connected! We are currently communicating with Amazon's servers to securely download your historical advertising data. This process usually takes 2 to 5 minutes.
                        </span>
                      </div>
                    ) : profilesData && profilesData.length === 0 ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <span className="text-base font-medium text-foreground">No Profiles Found</span>
                        <span className="text-sm mt-1 mb-4 text-center max-w-sm text-muted-foreground">
                          Your Amazon Ads account is connected, but we couldn't find any active advertiser profiles. Ensure you have set up a marketplace profile in Amazon Ads.
                        </span>
                      </div>
                    ) : !selectedProfile ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <span className="text-base font-medium text-foreground">Select a Profile</span>
                        <span className="text-sm mt-1 mb-4 text-center max-w-sm">
                          Please select an Amazon Ads profile from the dropdown above to view metrics.
                        </span>
                      </div>
                    ) : isSyncing ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="h-10 w-10 text-sky-500 animate-spin mb-4" />
                        <span className="text-base font-medium text-foreground">Generating Campaign Reports...</span>
                        <span className="text-sm mt-1 text-center max-w-md text-muted-foreground">
                          We've found your profile! We're now waiting for Amazon to generate your historical campaign performance reports. This usually takes 2 to 5 minutes for the initial setup.
                        </span>
                      </div>
                    ) : (
                      "No active campaigns found for this profile."
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="keywords" className="mt-0 relative overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="Keyword Analytics" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Performance</CardTitle>
                  <CardDescription>Analyze and manage search terms</CardDescription>
                  <div className="mt-4 flex gap-4">
                    <Select value={selectedCampaignForKeywords} onValueChange={setSelectedCampaignForKeywords}>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a Campaign to view keywords" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignsData?.map((c: any) => (
                          <SelectItem key={c.campaign_id} value={c.campaign_id}>{c.campaign_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Advanced Filter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Advanced Keyword Filter</DialogTitle>
                          <DialogDescription>Set condition-based logic to filter your search terms.</DialogDescription>
                        </DialogHeader>
                        
                        {savedFilters && savedFilters.length > 0 && (
                          <div className="mt-2 mb-4 p-3 bg-muted/50 rounded-lg">
                            <Label className="text-xs text-muted-foreground mb-2 block">Quick Apply Saved Filter</Label>
                            <Select onValueChange={(val) => {
                              const filter = savedFilters.find((f: any) => f.id === parseInt(val));
                              if (filter) {
                                setFilterMetric(filter.config.metric);
                                setFilterOperator(filter.config.operator);
                                setFilterValue(filter.config.value);
                                setFilterName(filter.name);
                              }
                            }}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a saved filter" />
                              </SelectTrigger>
                              <SelectContent>
                                {savedFilters.map((f: any) => (
                                  <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex gap-2 items-center my-4">
                          <Select value={filterMetric} onValueChange={setFilterMetric}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Metric" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spend">Spend (₹)</SelectItem>
                              <SelectItem value="sales">Sales (₹)</SelectItem>
                              <SelectItem value="acos">ACOS (%)</SelectItem>
                              <SelectItem value="clicks">Clicks</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={filterOperator} onValueChange={setFilterOperator}>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Op" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=">">{">"}</SelectItem>
                              <SelectItem value="<">{"<"}</SelectItem>
                              <SelectItem value="=">{"="}</SelectItem>
                            </SelectContent>
                          </Select>
                          
                            <Input 
                              type="number" 
                              placeholder="Value" 
                              className="flex-1"
                              value={filterValue}
                              onChange={(e) => setFilterValue(e.target.value)}
                            />
                          </div>
                          
                          <div className="mt-4 border-t pt-4">
                            <Label className="text-xs text-muted-foreground mb-2 block">Save this filter for future use</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Filter Name (e.g. Bleeding Keywords)" 
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="flex-1"
                              />
                              <Button variant="secondary" onClick={handleSaveFilter}>Save Filter</Button>
                            </div>
                          </div>
                          
                          <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => {
                              setFilterValue("");
                              setFilterName("");
                              setIsFilterOpen(false);
                            }}>Clear</Button>
                            <Button onClick={() => {
                              toast({ title: "Filter Applied", description: `Filtering keywords where ${filterMetric} ${filterOperator} ${filterValue}` });
                              setIsFilterOpen(false);
                            }}>Apply Filter</Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedCampaignForKeywords ? (
                    <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
                      Please select a campaign from the dropdown above.
                    </div>
                  ) : keywordsLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : keywordsData && keywordsData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Spend</TableHead>
                            <TableHead className="text-right">Sales</TableHead>
                            <TableHead className="text-right">ACOS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {keywordsData
                            .filter((k: any) => {
                              if (!filterValue) return true;
                              const val = parseFloat(filterValue);
                              if (isNaN(val)) return true;
                              
                              let compVal = 0;
                              if (filterMetric === "spend") compVal = k.spend;
                              if (filterMetric === "sales") compVal = k.sales;
                              if (filterMetric === "acos") compVal = k.acos;
                              if (filterMetric === "clicks") compVal = k.clicks;
                              
                              if (filterOperator === ">") return compVal > val;
                              if (filterOperator === "<") return compVal < val;
                              if (filterOperator === "=") return compVal === val;
                              return true;
                            })
                            .map((k: any) => (
                            <TableRow key={k.keyword_id}>
                              <TableCell className="font-medium">{k.keyword_text}</TableCell>
                              <TableCell><Badge variant="outline">{k.match_type}</Badge></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    checked={k.state === "ENABLED"}
                                    disabled={tier === "free" || updatingKeyword === k.keyword_id}
                                    onCheckedChange={() => handleKeywordStatusChange(k.keyword_id, k.state)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-right">₹{k.spend.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{k.sales.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{k.acos}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
                      No keywords found for this campaign in the selected date range.
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </TabsContent>
            </Tabs>
            </div>

            {/* Feature Toggles (Phase 3 Prep) */}
            <Card className="relative overflow-hidden">
              {!isPremium && <TierGate tier="premium" feature="AI Ad Automations" isDark={isDark} />}
              <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Automations
                  </CardTitle>
                  <CardDescription>Configure AI-driven ad optimizations per profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Dayparting */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Dayparting</Label>
                      <p className="text-xs text-muted-foreground">Pause campaigns during low-conversion hours.</p>
                    </div>
                    
                    <Dialog open={daypartingOpen} onOpenChange={setDaypartingOpen}>
                      <DialogTrigger asChild>
                        <Button variant={daypartingActive ? "default" : "outline"} className={daypartingActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                          {daypartingActive ? "Active" : "Configure"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Configure Dayparting</DialogTitle>
                          <DialogDescription>
                            Select the days and hours when your campaigns should be active. They will be paused outside these times.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="space-y-3">
                            <Label>Active Days</Label>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(daypartingDays).map(([day, isActive]) => (
                                <Badge 
                                  key={day} 
                                  variant={isActive ? "default" : "outline"}
                                  className={`cursor-pointer ${isActive ? 'bg-sky-600 hover:bg-sky-700 text-white border-transparent' : ''}`}
                                  onClick={() => setDaypartingDays(prev => ({...prev, [day]: !isActive}))}
                                >
                                  {day}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <Label>Active Hours (24h format)</Label>
                            <div className="pt-2">
                              <Slider 
                                value={daypartingHours} 
                                max={24} 
                                step={1} 
                                minStepsBetweenThumbs={1}
                                onValueChange={setDaypartingHours}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                              <span>{daypartingHours[0]}:00 AM</span>
                              <span>{daypartingHours[1]}:00 {daypartingHours[1] >= 12 ? 'PM' : 'AM'}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDaypartingActive(false)}>Disable</Button>
                          <Button onClick={handleSaveDayparting}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {/* Auto Bid Adjustments */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Auto Bid Adjustments</Label>
                      <p className="text-xs text-muted-foreground">Dynamically adjust bids based on ACOS targets.</p>
                    </div>
                    
                    <Dialog open={biddingOpen} onOpenChange={setBiddingOpen}>
                      <DialogTrigger asChild>
                        <Button variant={biddingActive ? "default" : "outline"} className={biddingActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                          {biddingActive ? "Active" : "Configure"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Target ACOS & Bid Limits</DialogTitle>
                          <DialogDescription>
                            The AI will automatically adjust bids daily to hit your target ACOS.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2">Target ACOS (%)</Label>
                            <Input 
                              type="number" 
                              value={targetAcos} 
                              onChange={(e) => setTargetAcos(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-emerald-600 dark:text-emerald-400">Max Increase (%)</Label>
                            <Input 
                              type="number" 
                              value={maxIncrease} 
                              onChange={(e) => setMaxIncrease(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-rose-600 dark:text-rose-400">Max Decrease (%)</Label>
                            <Input 
                              type="number" 
                              value={maxDecrease} 
                              onChange={(e) => setMaxDecrease(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBiddingActive(false)}>Disable</Button>
                          <Button onClick={handleSaveBidding}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                </CardContent>
              </div>
            </Card>
          </div>

        </motion.div>
    </div>
  );
}
