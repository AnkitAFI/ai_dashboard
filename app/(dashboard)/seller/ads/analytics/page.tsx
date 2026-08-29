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
import { InfoTip } from "@/components/ui/info-tip";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { BarChart, Activity, DollarSign, TrendingUp, AlertCircle, RefreshCw, Zap, Menu, Lock, Crown, Calendar as CalendarIcon, FileText, Pencil, Check, X, ShieldAlert } from "lucide-react";
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
  daily_budget: number;
  is_locked: boolean;
}

interface Keyword {
  keyword_id: string;
  keyword_text: string;
  match_type: string;
  state: string;
  spend: number;
  sales: number;
  acos: number;
  keyword_bid: number;
  is_locked: boolean;
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

// ── Editable Cell Component ───────────────────────────────────────────────────
function EditableCell({
  value,
  onSave,
  isLocked,
  onUnlock,
  tier,
  isDark,
  type = "currency"
}: {
  value: number;
  onSave: (val: number) => void;
  isLocked: boolean;
  onUnlock: () => void;
  tier: string;
  isDark: boolean;
  type?: "currency" | "number";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value.toString());

  const handleSave = () => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onSave(num);
      setIsEditing(false);
    } else {
      toast({ title: "Invalid Input", description: "Please enter a valid number greater than 0.", variant: "destructive" });
    }
  };

  if (isLocked) {
    return (
      <div className="flex items-center justify-end gap-2 group">
        <span>{type === "currency" ? `₹${value.toFixed(2)}` : value}</span>
        <button 
          onClick={onUnlock}
          title="This bid is manually locked and will not be adjusted by AI Automations. Click to unlock and hand control back to AI."
          className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-amber-500' : 'hover:bg-slate-100 text-amber-600'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-1">
        {type === "currency" && <span className="text-xs text-muted-foreground mr-1">₹</span>}
        <Input 
          type="number" 
          value={val} 
          onChange={(e) => setVal(e.target.value)}
          className="w-20 h-7 text-right text-xs px-2"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave} className="p-1 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-950">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { setIsEditing(false); setVal(value.toString()); }} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2 group">
      <span>{type === "currency" ? `₹${value.toFixed(2)}` : value}</span>
      {tier === "free" || tier === "basic" ? (
        <div title="Upgrade to Premium to manually edit bids and budgets">
          <Lock className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
        </div>
      ) : (
        <button 
          onClick={() => setIsEditing(true)}
          className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("campaigns");
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
  
  const [budgetScalingOpen, setBudgetScalingOpen] = useState(false);
  const [budgetScalingTargetAcos, setBudgetScalingTargetAcos] = useState(15);
  const [budgetScalingTargetRoas, setBudgetScalingTargetRoas] = useState(5);
  const [budgetScalingIncreasePct, setBudgetScalingIncreasePct] = useState(20);
  const [budgetScalingActive, setBudgetScalingActive] = useState(false);
  
  const [searchTermNegationOpen, setSearchTermNegationOpen] = useState(false);
  const [searchTermNegationMaxSpend, setSearchTermNegationMaxSpend] = useState(2000);
  const [searchTermNegationActive, setSearchTermNegationActive] = useState(false);
  
  // Placement Bid Modifier State
  const [placementModOpen, setPlacementModOpen] = useState(false);
  const [placementModActive, setPlacementModActive] = useState(false);
  const [placementModTargetAcos, setPlacementModTargetAcos] = useState(20);
  const [placementModBoost, setPlacementModBoost] = useState(5);
  const [placementModMax, setPlacementModMax] = useState(50);
  const [placementModType, setPlacementModType] = useState("placementTop");

  const handleSavePlacementMod = async () => {
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first to use this feature.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/automations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          rule_type: "PLACEMENT_BID_MODIFIER",
          rule_config: {
            target_acos: placementModTargetAcos,
            increase_pct: placementModBoost,
            max_modifier: placementModMax,
            placement_type: placementModType
          }
        })
      });
      if (res.ok) {
        setPlacementModActive(true);
        setPlacementModOpen(false);
        toast({
          title: "Placement Automation Saved",
          description: "We will automatically boost winning placements.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDayparting = async () => {
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first to use this feature.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/automations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
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
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first to use this feature.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/automations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
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

  const handleSaveBudgetScaling = async () => {
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first to use this feature.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/automations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          rule_type: "BUDGET_SCALING",
          rule_config: {
            target_acos: budgetScalingTargetAcos,
            target_roas: budgetScalingTargetRoas,
            increase_pct: budgetScalingIncreasePct
          }
        })
      });
      if (res.ok) {
        setBudgetScalingActive(true);
        setBudgetScalingOpen(false);
        toast({
          title: "Budget Scaling Automation Saved",
          description: "Profitable campaigns will now scale automatically.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSearchTermNegation = async () => {
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first to use this feature.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/automations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          rule_type: "SEARCH_TERM_NEGATION",
          rule_config: {
            max_spend: searchTermNegationMaxSpend
          }
        })
      });
      if (res.ok) {
        setSearchTermNegationActive(true);
        setSearchTermNegationOpen(false);
        toast({
          title: "Search Term Negation Saved",
          description: "Bleeding search terms will be automatically negated.",
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
  
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!selectedProfile) {
      toast({ title: "No Profile Selected", description: "Please select an Amazon Ads profile from the dropdown first to generate a report.", variant: "destructive" });
      return;
    }
    if (tier !== "enterprise") return;
    setIsDownloadingPdf(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/reports/pdf?profile_id=${selectedProfile}&date_range=${actualDateParam}`, {
        method: "GET",
        credentials: "include"
      });
      
      if (!res.ok) {
        toast({ title: "Failed to generate report", description: "Only Enterprise users can generate executive PDF reports.", variant: "destructive" });
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Insydz_Performance_Report_${actualDateParam}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Report Downloaded",
        description: "Your executive performance report has been successfully generated.",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error generating report", variant: "destructive" });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleBudgetChange = async (campaignId: string, newBudget: number) => {
    if (!selectedProfile || tier === "free") return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${campaignId}/budget`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          budget: newBudget
        })
      });
      
      if (res.ok) {
        toast({
          title: "Budget Update Queued",
          description: `Campaign budget updated to ₹${newBudget.toFixed(2)}.`,
        });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast({ title: "Failed to Update", description: "Something went wrong.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error occurred.", variant: "destructive" });
    }
  };

  const handleUnlockCampaign = async (campaignId: string) => {
    if (!selectedProfile || tier === "free") return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${campaignId}/lock?profile_id=${selectedProfile}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast({ title: "Unlocked", description: "Campaign is now managed by AI Automations again." });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBidChange = async (keywordId: string, campaignId: string, newBid: number) => {
    if (!selectedProfile || tier === "free") return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/keywords/${keywordId}/bid`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          campaign_id: campaignId,
          bid: newBid
        })
      });
      
      if (res.ok) {
        toast({
          title: "Bid Update Queued",
          description: `Keyword bid updated to ₹${newBid.toFixed(2)}.`,
        });
        queryClient.invalidateQueries({ queryKey: ["campaignKeywords"] });
      } else {
        toast({ title: "Failed to Update", description: "Something went wrong.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Network error occurred.", variant: "destructive" });
    }
  };

  const handleUnlockKeyword = async (keywordId: string, campaignId: string) => {
    if (!selectedProfile || tier === "free") return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/keywords/${keywordId}/lock?profile_id=${selectedProfile}&campaign_id=${campaignId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast({ title: "Unlocked", description: "Keyword is now managed by AI Automations again." });
        queryClient.invalidateQueries({ queryKey: ["campaignKeywords"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (campaignId: string, currentStatus: string) => {
    if (!selectedProfile || tier === "free") return;
    const newStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED";
    setUpdatingCampaign(campaignId);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${campaignId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
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

  // Search Terms Data Fetching
  const { data: searchTermsData, isLoading: searchTermsLoading } = useQuery({
    queryKey: ["amazon-ads-search-terms", selectedProfile, actualDateParam],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/search-terms?profile_id=${selectedProfile}&date_range=${actualDateParam}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch search terms");
      return await res.json();
    },
    enabled: !!selectedProfile && isPremium
  });


  // Placements Data Fetching
  const { data: placementsData, isLoading: placementsLoading } = useQuery({
    queryKey: ["amazon-ads-placements", selectedProfile, actualDateParam],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/placement-performance?profile_id=${selectedProfile}&date_range=${actualDateParam}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch placements");
      return await res.json();
    },
    enabled: !!selectedProfile && isPremium
  });

  const [negatingSearchTerm, setNegatingSearchTerm] = useState<string | null>(null);
  const [recentlyNegated, setRecentlyNegated] = useState<Set<string>>(new Set());
  const [promotingSearchTerm, setPromotingSearchTerm] = useState<string | null>(null);
  const [recentlyPromoted, setRecentlyPromoted] = useState<Set<string>>(new Set());

  const handleNegateSearchTerm = async (searchTerm: string, campaignId: string, adGroupId: string) => {
    if (!selectedProfile || tier === "free") return;
    setNegatingSearchTerm(searchTerm);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/search-terms/negate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          campaign_id: campaignId,
          ad_group_id: adGroupId,
          search_term: searchTerm
        })
      });
      if (res.ok) {
        toast({
          title: "Search Term Negated",
          description: `"${searchTerm}" has been added as a Negative Exact keyword.`,
        });
        setRecentlyNegated(prev => {
          const newSet = new Set(prev);
          newSet.add(searchTerm);
          return newSet;
        });
        // We could invalidate queries, but the user might have to wait for the next sync to see it gone.
        // For now, simple toast is fine.
      } else {
        toast({ title: "Failed to negate search term", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error negating search term", variant: "destructive" });
    } finally {
      setNegatingSearchTerm(null);
    }
  };

  const handlePromoteSearchTerm = async (searchTerm: string, campaignId: string, adGroupId: string, exactBid: number) => {
    if (!selectedProfile || tier === "free") return;
    setPromotingSearchTerm(searchTerm);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/search-terms/promote`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          campaign_id: campaignId,
          ad_group_id: adGroupId,
          search_term: searchTerm,
          exact_bid: exactBid
        })
      });
      if (res.ok) {
        toast({
          title: "Search Term Promoted!",
          description: `"${searchTerm}" is now an Exact Match keyword.`,
        });
        setRecentlyPromoted(prev => {
          const newSet = new Set(prev);
          newSet.add(searchTerm);
          return newSet;
        });
      } else {
        toast({ title: "Failed to promote search term", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error promoting search term", variant: "destructive" });
    } finally {
      setPromotingSearchTerm(null);
    }
  };

  const [editingBidModifier, setEditingBidModifier] = useState<{campaignId: string, placement: string} | null>(null);

  const handleUpdateBidModifier = async (campaignId: string, placement: string, percentage: number) => {
    if (!selectedProfile || tier === "free") return;
    setEditingBidModifier({ campaignId, placement });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-ads/analytics/campaigns/${campaignId}/bidding-adjustments`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
          placement: placement,
          percentage: percentage
        })
      });
      if (res.ok) {
        toast({
          title: "Bid Modifier Updated",
          description: `Applied +${percentage}% bid boost to ${placement}.`,
        });
      } else {
        toast({ title: "Failed to update bid modifier", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating bid modifier", variant: "destructive" });
    } finally {
      setEditingBidModifier(null);
    }
  };

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
    if (!selectedProfile) {
      toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first.", variant: "destructive" });
      return;
    }
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

          <div className="relative group">
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF} 
              disabled={isDownloadingPdf || tier !== 'enterprise'}
              className={`hidden md:flex gap-2 font-semibold ${tier === 'enterprise' ? 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-400 dark:border-fuchsia-800 dark:hover:bg-fuchsia-900/40' : ''}`}
            >
              {isDownloadingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Export PDF Report
              {tier !== 'enterprise' && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
            </Button>
            {tier !== 'enterprise' && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 text-white text-xs rounded shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                Unlock Automated PDF Reporting with Enterprise Tier
              </div>
            )}
          </div>

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="search-terms">Search Terms</TabsTrigger>
                  <TabsTrigger value="placements">Placements <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300 border-fuchsia-200">NEW</Badge></TabsTrigger>
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
                          <TableHead className="text-right pr-6">Daily Budget</TableHead>
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
                            <TableCell className="text-right">
                              <EditableCell
                                value={c.daily_budget}
                                onSave={(val) => handleBudgetChange(c.campaign_id, val)}
                                isLocked={c.is_locked}
                                onUnlock={() => handleUnlockCampaign(c.campaign_id)}
                                tier={tier as string}
                                isDark={isDark}
                              />
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
                        <Button variant={filterValue ? "default" : "outline"} className={filterValue ? "bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2" : "flex items-center gap-2"}>
                          <Zap className="w-4 h-4" /> Advanced Filter {filterValue && "(Active)"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">Advanced Keyword Filter <InfoTip isDark={isDark} text="Use this to quickly find your worst-performing or best-performing keywords." /></DialogTitle>
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
                              if (!selectedProfile) {
                                toast({ title: "Account Not Connected", description: "Please connect your Amazon Ads account first.", variant: "destructive" });
                                return;
                              }
                              if (!filterValue) {
                                toast({ title: "Invalid Filter", description: "Please enter a value before applying the filter.", variant: "destructive" });
                                return;
                              }
                              toast({ title: "Filter Applied", description: `Filtering keywords where ${filterMetric} ${filterOperator} ${filterValue}` });
                              setIsFilterOpen(false);
                            }}>Apply Filter</Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {filterValue && (
                    <div className="mt-4 flex items-center justify-between p-3 border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Showing only keywords where <strong>{filterMetric.toUpperCase()} {filterOperator} {filterValue}</strong></span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFilterValue(""); setFilterName(""); }} className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/50 h-8">
                        Clear Filter
                      </Button>
                    </div>
                  )}
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
                            <TableHead className="text-right pr-6">Bid</TableHead>
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
                              <TableCell className="text-right">
                                <EditableCell
                                  value={k.keyword_bid}
                                  onSave={(val) => handleBidChange(k.keyword_id, selectedCampaignForKeywords, val)}
                                  isLocked={k.is_locked}
                                  onUnlock={() => handleUnlockKeyword(k.keyword_id, selectedCampaignForKeywords)}
                                  tier={tier as string}
                                  isDark={isDark}
                                />
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
            
            <TabsContent value="search-terms" className="mt-0">
              <Card className="relative overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="Search Term Analytics" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <CardHeader className="pb-2 flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Search Term Harvesting</CardTitle>
                      <CardDescription>Customer search terms that triggered your ads</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedProfile ? (
                      <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
                        Please select an Ad Profile first.
                      </div>
                    ) : searchTermsLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : searchTermsData?.search_terms && searchTermsData.search_terms.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer Search Term</TableHead>
                              <TableHead>Matched Keyword</TableHead>
                              <TableHead className="text-right">Spend</TableHead>
                              <TableHead className="text-right">Sales</TableHead>
                              <TableHead className="text-right">ACOS</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchTermsData.search_terms.map((st: any, idx: number) => (
                              <TableRow key={`${st.search_term}-${idx}`}>
                                <TableCell className="font-medium">{st.search_term}</TableCell>
                                <TableCell>
                                  <div className="text-xs">{st.keyword_text}</div>
                                  <div className="text-[10px] text-muted-foreground">{st.match_type}</div>
                                </TableCell>
                                <TableCell className="text-right">₹{st.spend.toLocaleString()}</TableCell>
                                <TableCell className="text-right">₹{st.sales.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={st.acos > 40 ? "destructive" : st.acos > 0 ? "secondary" : "outline"} className="font-mono">
                                    {st.acos}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    {st.is_promoted || recentlyPromoted.has(st.search_term) ? (
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                        🚀 Promoted
                                      </Badge>
                                    ) : (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={promotingSearchTerm === st.search_term}
                                            className="h-7 text-xs border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
                                          >
                                            {promotingSearchTerm === st.search_term ? (
                                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                            ) : (
                                              <span className="mr-1">🚀</span>
                                            )}
                                            Promote
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64" align="end">
                                          <div className="grid gap-4">
                                            <div className="space-y-2">
                                              <h4 className="font-medium leading-none">Promote to Exact Match</h4>
                                              <p className="text-sm text-muted-foreground">
                                                This creates a new Exact keyword and negates the current one to prevent self-competition.
                                              </p>
                                            </div>
                                            <div className="grid gap-2">
                                              <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor={`bid-${idx}`}>Exact Bid</Label>
                                                <Input
                                                  id={`bid-${idx}`}
                                                  defaultValue={(st.spend / (st.clicks || 1) * 1.2).toFixed(2)}
                                                  className="col-span-2 h-8"
                                                />
                                              </div>
                                              <Button 
                                                size="sm" 
                                                onClick={() => {
                                                  const val = (document.getElementById(`bid-${idx}`) as HTMLInputElement)?.value;
                                                  if (val) {
                                                    handlePromoteSearchTerm(st.search_term, st.campaign_id, st.ad_group_id, parseFloat(val));
                                                  }
                                                }}
                                              >
                                                Execute Promotion
                                              </Button>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}

                                    {st.is_negated || recentlyNegated.has(st.search_term) ? (
                                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                        ✅ Negated
                                      </Badge>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={negatingSearchTerm === st.search_term}
                                        onClick={() => handleNegateSearchTerm(st.search_term, st.campaign_id, st.ad_group_id)}
                                        className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                      >
                                        {negatingSearchTerm === st.search_term ? (
                                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                        ) : (
                                          <span className="mr-1">🚫</span>
                                        )}
                                        Negate
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
                        No search terms found in the selected date range.
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </TabsContent>

            {/* PLACEMENTS TAB */}
            <TabsContent value="placements" className="mt-0">
              <Card className="relative overflow-hidden">
                {!isPremium && <TierGate tier="premium" feature="Placement Analytics & Bid Modifiers" isDark={isDark} />}
                <div className={!isPremium ? "blur-sm pointer-events-none" : ""}>
                  <CardHeader className="pb-2 flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Placement Performance</CardTitle>
                      <CardDescription>Top of Search, Rest of Search, and Product Pages</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {placementsLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : placementsData?.placements && placementsData.placements.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Placement</TableHead>
                              <TableHead className="text-right">Spend</TableHead>
                              <TableHead className="text-right">Sales</TableHead>
                              <TableHead className="text-right">ACOS</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {placementsData.placements.map((p: any, idx: number) => {
                              // Friendly names for placements
                              let placementName = p.placement;
                              if (p.placement === "placementTop") placementName = "Top of Search";
                              else if (p.placement === "placementRestOfSearch") placementName = "Rest of Search";
                              else if (p.placement === "placementProductPage") placementName = "Product Pages";

                              return (
                                <TableRow key={`${p.placement}-${p.campaign_id}-${idx}`}>
                                  <TableCell className="font-medium">
                                    {placementName}
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{p.campaign_id}</div>
                                  </TableCell>
                                  <TableCell className="text-right">₹{p.spend.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">₹{p.sales.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={p.acos > 40 ? "destructive" : p.acos > 0 ? "secondary" : "outline"} className="font-mono">
                                      {p.acos}%
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {p.placement !== "placementRestOfSearch" && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm" className="h-7 text-xs">
                                            Edit Modifier
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64" align="end">
                                          <div className="space-y-4">
                                            <h4 className="font-medium text-sm leading-none">Bid Modifier (%)</h4>
                                            <p className="text-xs text-muted-foreground">Increase bids by up to 900% when your ad competes for <strong>{placementName}</strong>.</p>
                                            <div className="flex items-center gap-2">
                                              <Input 
                                                type="number" 
                                                id={`modifier-${idx}`} 
                                                defaultValue={0} 
                                                min={0} 
                                                max={900} 
                                                className="h-8"
                                              />
                                              <Button 
                                                size="sm" 
                                                className="h-8"
                                                onClick={() => {
                                                  const val = (document.getElementById(`modifier-${idx}`) as HTMLInputElement)?.value;
                                                  handleUpdateBidModifier(p.campaign_id, p.placement, Number(val || 0));
                                                }}
                                                disabled={editingBidModifier?.campaignId === p.campaign_id && editingBidModifier?.placement === p.placement}
                                              >
                                                {editingBidModifier?.campaignId === p.campaign_id && editingBidModifier?.placement === p.placement ? (
                                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                                ) : "Save"}
                                              </Button>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
                        No placement data found in the selected date range.
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
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
                  {activeTab === "campaigns" && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium flex items-center gap-1">
                        Dayparting <InfoTip isDark={isDark} text="Automatically turns your ads off during the night or low-sales hours so you don't waste money." />
                      </Label>
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
                              <div className="flex gap-4 mt-2 text-[10px] justify-center pt-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-sm bg-sky-200 dark:bg-sky-500"></div>
                                  <span className="text-muted-foreground font-medium">Ads Active</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                                  <span className="text-muted-foreground font-medium">Ads Paused</span>
                                </div>
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
                  )}
                  
                  {/* Auto Bid Adjustments */}
                  {(activeTab === "campaigns" || activeTab === "keywords") && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium flex items-center gap-1">
                        Auto Bid Adjustments <InfoTip isDark={isDark} text="The AI will automatically increase or decrease your bids every day to hit your target profit margin (ACOS)." />
                      </Label>
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
                  )}
                  
                  {/* Smart Budget Scaling */}
                  {activeTab === "campaigns" && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium flex items-center gap-2">Smart Budget Scaling <InfoTip isDark={isDark} text="If a campaign is making good profit, the AI will automatically add more budget to it so you don't run out of money." /><Badge variant="secondary" className="text-[10px] px-1.5 py-0">NEW</Badge></Label>
                      <p className="text-xs text-muted-foreground">Automatically increase budgets for profitable campaigns.</p>
                    </div>
                    
                    <Dialog open={budgetScalingOpen} onOpenChange={setBudgetScalingOpen}>
                      <DialogTrigger asChild>
                        <Button variant={budgetScalingActive ? "default" : "outline"} className={budgetScalingActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                          {budgetScalingActive ? "Active" : "Configure"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Smart Budget Scaling</DialogTitle>
                          <DialogDescription>
                            If a campaign is highly profitable, the AI will increase its daily budget so you don't run out of funds.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2">Target ACOS (%) &lt;</Label>
                            <Input 
                              type="number" 
                              value={budgetScalingTargetAcos} 
                              onChange={(e) => setBudgetScalingTargetAcos(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2">Target ROAS (x) &gt;</Label>
                            <Input 
                              type="number" 
                              value={budgetScalingTargetRoas} 
                              onChange={(e) => setBudgetScalingTargetRoas(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-emerald-600 dark:text-emerald-400">Increase Budget By (%)</Label>
                            <Input 
                              type="number" 
                              value={budgetScalingIncreasePct} 
                              onChange={(e) => setBudgetScalingIncreasePct(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBudgetScalingActive(false)}>Disable</Button>
                          <Button onClick={handleSaveBudgetScaling}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  )}
                  
                  {/* Automated Search Term Negation */}
                  {activeTab === "search-terms" && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium flex items-center gap-2">Auto-Negate Bleeding Search Terms <InfoTip isDark={isDark} text="Automatically blocks bad search terms that are spending money but giving zero sales." /><Badge variant="secondary" className="text-[10px] px-1.5 py-0">NEW</Badge></Label>
                      <p className="text-xs text-muted-foreground">Automatically block customer search terms that waste money.</p>
                    </div>
                    
                    <Dialog open={searchTermNegationOpen} onOpenChange={setSearchTermNegationOpen}>
                      <DialogTrigger asChild>
                        <Button variant={searchTermNegationActive ? "default" : "outline"} className={searchTermNegationActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                          {searchTermNegationActive ? "Active" : "Configure"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Auto-Negate Bleeding Search Terms</DialogTitle>
                          <DialogDescription>
                            If a search term spends more than your threshold over 7 days but generates 0 sales, the AI will automatically add it as a Negative Exact keyword to stop the bleeding.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-destructive dark:text-red-400">Max Spend with 0 Sales (₹) &gt;</Label>
                            <Input 
                              type="number" 
                              value={searchTermNegationMaxSpend} 
                              onChange={(e) => setSearchTermNegationMaxSpend(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSearchTermNegationActive(false)}>Disable</Button>
                          <Button onClick={handleSaveSearchTermNegation}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  )}

                  {/* Auto-Boost Winning Placements */}
                  {activeTab === "placements" && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium flex items-center gap-2">Auto-Boost Winning Placements <InfoTip isDark={isDark} text="If your ad performs best at the Top of Search, the AI will bid higher specifically for that spot." /><Badge variant="secondary" className="text-[10px] px-1.5 py-0">NEW</Badge></Label>
                      <p className="text-xs text-muted-foreground">Automatically increase bid modifiers when a placement is highly profitable.</p>
                    </div>
                    
                    <Dialog open={placementModOpen} onOpenChange={setPlacementModOpen}>
                      <DialogTrigger asChild>
                        <Button variant={placementModActive ? "default" : "outline"} className={placementModActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
                          {placementModActive ? "Active" : "Configure"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Auto-Boost Winning Placements</DialogTitle>
                          <DialogDescription>
                            If a specific placement (like Top of Search) has a great ACOS, the AI will automatically boost its bid modifier.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2">Placement Type</Label>
                            <Select value={placementModType} onValueChange={setPlacementModType}>
                              <SelectTrigger className="col-span-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placementTop">Top of Search</SelectItem>
                                <SelectItem value="placementProductPage">Product Pages</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2">Target ACOS (%) &lt;</Label>
                            <Input 
                              type="number" 
                              value={placementModTargetAcos} 
                              onChange={(e) => setPlacementModTargetAcos(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-emerald-600 dark:text-emerald-400">Boost Modifier By (%)</Label>
                            <Input 
                              type="number" 
                              value={placementModBoost} 
                              onChange={(e) => setPlacementModBoost(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-2 text-muted-foreground">Max Allowed Modifier (%)</Label>
                            <Input 
                              type="number" 
                              value={placementModMax} 
                              onChange={(e) => setPlacementModMax(Number(e.target.value))} 
                              className="col-span-2" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPlacementModActive(false)}>Disable</Button>
                          <Button onClick={handleSavePlacementMod}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  )}

                </CardContent>
              </div>
            </Card>
          </div>

        </motion.div>
    </div>
  );
}
