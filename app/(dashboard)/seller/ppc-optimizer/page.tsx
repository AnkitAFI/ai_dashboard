"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  ShieldCheck, Crown, RefreshCw, Menu, Zap, Target, BarChart2,
  AlertTriangle, CheckCircle, RotateCcw, ArrowUp, ArrowDown,
  DollarSign, TrendingUp, Filter, Sliders, Lock, Sparkles, Check, X,
  EyeOff, Clock, Search, Edit3, CheckSquare, Square, Layers, Unplug, LineChart as LineChartIcon, Trash2, Plus, Rocket, List
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const BASE_URL = API_BASE_URL;

interface AdProfile {
  profile_id: string;
  country_code: string;
  currency_code: string;
  account_type: string;
}


interface SearchTermData {
  query_text: string;
  campaign_id: string;
  ad_group_id: string;
  spend: number;
  sales: number;
  clicks: number;
  impressions: number;
  orders: number;
  acos: number;
  roas: number;
  cvr: number;
}

interface KeywordTarget {
  target_id: string;
  ad_group_id: string;
  campaign_id: string;
  target_type: string;
  match_type: string;
  expression: string;
  bid: number;
  state: string;
}

interface Scorecard {
  profile_id: string;
  currency: string;
  total_spend: number;
  total_sales: number;
  total_orders: number;
  total_clicks: number;
  total_impressions: number;
  acos: number;
  roas: number;
  cpc?: number;
  ctr?: number;
  cvr?: number;
  tacos?: number;
  organic_sales?: number;
}

interface Recommendation {
  id: number;
  rule_type: "BLEEDER" | "HARVESTER" | "BID_OPTIMIZE" | "BUDGET";
  target_id: string;
  campaign_id: string;
  ad_group_id: string;
  recommended_action: string;
  current_value: string;
  recommended_value: string;
  evidence: any;
  status: string;
  created_at: string;
}

interface Entitlements {
  user_tier: string;
  monthly_applies_used: number;
  monthly_applies_limit: number;
  can_apply_recommendations: boolean;
  can_customize_target_acos: boolean;
  can_use_granular_keywords: boolean;
  max_granular_keywords: number;
  can_use_search_terms: boolean;
  max_search_terms: number;
  can_use_bulk_ops: boolean;
  can_use_portfolios: boolean;
  upsell_message: string | null;
}

interface Campaign {
  campaign_id: string;
  name: string;
  campaign_type: string;
  state: string;
  daily_budget: number;
  objective?: "LAUNCH" | "SCALE" | "LIQUIDATE";
  automation_mode?: "MANUAL" | "AUTOPILOT";
  min_bid?: number;
  max_bid?: number;
  dayparting_enabled?: boolean;
  dayparting_schedule?: any;
  ad_groups: {
    ad_group_id: string;
    name: string;
    default_bid: number;
    state: string;
  }[];
}

interface ChangeLogItem {
  id: number;
  recommendation_id: number;
  action_type: string;
  target_id: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

export default function PpcOptimizerPage() {
  const { user } = useAuth();
  const { toggle: openSidebar } = useSidebar();

  const [profiles, setProfiles] = useState<AdProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>([]);
  const [mainTab, setMainTab] = useState<"SUGGESTIONS" | "AD_MANAGER" | "CHANGE_LOG" | "ANALYTICS" | "CUSTOM_RULES" | "KEYWORDS" | "SEARCH_TERMS" | "BULK_OPS" | "PORTFOLIOS">("SUGGESTIONS");
  const [activeTab, setActiveTab] = useState<"BLEEDER" | "HARVESTER" | "BID_OPTIMIZE">("BLEEDER");
  const [loading, setLoading] = useState<boolean>(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [rollbackId, setRollbackId] = useState<number | null>(null);
  const [targetAcos, setTargetAcos] = useState<number>(25);
  const [showAcosModal, setShowAcosModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedRecIds, setSelectedRecIds] = useState<number[]>([]);
  const [filterActionType, setFilterActionType] = useState<string>("ALL");
  const [searchChangeLog, setSearchChangeLog] = useState<string>("");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>("");
  const [showDaypartingModal, setShowDaypartingModal] = useState<string | null>(null);
  
  type DaypartingSchedule = Record<string, number[]>;
  const defaultSchedule: DaypartingSchedule = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  };
  const [daypartingSchedule, setDaypartingSchedule] = useState<DaypartingSchedule>(defaultSchedule);
  const [autoIsolateEnabled, setAutoIsolateEnabled] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  
  // Analytics State
  const [analyticsTargetId, setAnalyticsTargetId] = useState<string | null>(null);
  const [analyticsTargetName, setAnalyticsTargetName] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);

  // Custom Rules State
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    condition_acos_gt: 40,
    condition_clicks_gt: 15,
    action_type: "DECREASE_BID",
    action_value: 15
  });
  const [isCreatingRule, setIsCreatingRule] = useState<boolean>(false);
  
  // Promotion Pipelines State
  const [promotionPipelines, setPromotionPipelines] = useState<any[]>([]);
  
  // Keyword Manager State
  const [keywordTargets, setKeywordTargets] = useState<KeywordTarget[]>([]);
  const [isTargetsLoading, setIsTargetsLoading] = useState<boolean>(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [tempTargetBid, setTempTargetBid] = useState<string>("");
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>("");
  
  // Search Term Explorer State
  const [searchTerms, setSearchTerms] = useState<SearchTermData[]>([]);
  const [isSearchTermsLoading, setIsSearchTermsLoading] = useState<boolean>(false);
  const [stSearchQuery, setStSearchQuery] = useState<string>("");

  const loadSearchTerms = async () => {
    if (!selectedProfileId) return;
    setIsSearchTermsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/search-terms?profile_id=${selectedProfileId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSearchTerms(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSearchTermsLoading(false);
  };

  const handleNegateSearchTerm = async (query_text: string, ad_group_id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/search-terms/negate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile_id: selectedProfileId, ad_group_id, query_text })
      });
      if (res.ok) {
        setNotification({ type: "success", text: `Successfully negated '${query_text}'!` });
        // Optionally refresh
        loadSearchTerms();
      } else {
        const err = await res.json();
        setNotification({ type: "error", text: err.detail || "Failed to negate search term." });
      }
    } catch (e) {
      setNotification({ type: "error", text: "Network error negating search term." });
    }
  };
  
  // Bulk Operations State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const handleBulkDownload = () => {
    if (!selectedProfileId) return;
    window.location.href = `${BASE_URL}/api/v1/ads/bulk-operations/download?profile_id=${selectedProfileId}`;
  };

  const handleBulkUpload = async () => {
    if (!bulkFile || !selectedProfileId) return;
    setIsBulkUploading(true);
    setBulkResult(null);
    setNotification(null);
    
    const formData = new FormData();
    formData.append("profile_id", selectedProfileId);
    formData.append("file", bulkFile);
    
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/bulk-operations/upload`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setBulkResult(data);
        if (data.error_count > 0) {
           setNotification({ type: "error", text: `Partial Success: Updated ${data.success_count} rows, but encountered ${data.error_count} errors.` });
        } else {
           setNotification({ type: "success", text: `Success! Updated ${data.success_count} bids from CSV.` });
        }
        setBulkFile(null); // Clear file input on success
      } else {
        setNotification({ type: "error", text: data.detail || "Upload failed." });
      }
    } catch (e) {
      setNotification({ type: "error", text: "Network error during upload." });
    }
    setIsBulkUploading(false);
  };
  
  // Portfolios State
  interface Portfolio {
    portfolio_id: string;
    name: string;
    budget_amount: number;
    state: string;
    campaign_count: number;
    total_spend: number;
  }
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<string>("");

  const loadPortfolios = async () => {
    if (!selectedProfileId || !entitlements?.can_use_portfolios) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/portfolios?profile_id=${selectedProfileId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data.portfolios || []);
      }
    } catch (e) {
      console.error("Error loading portfolios", e);
    }
  };

  useEffect(() => {
    if (mainTab === "PORTFOLIOS") {
      loadPortfolios();
    }
  }, [mainTab, selectedProfileId, entitlements]);

  const handleUpdateBudget = async (portfolio_id: string) => {
    if (!selectedProfileId) return;
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      setNotification({ type: "error", text: "Invalid budget amount." });
      return;
    }
    
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/portfolios/${portfolio_id}/budget?profile_id=${selectedProfileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ new_budget: amount })
      });
      if (res.ok) {
        setNotification({ type: "success", text: `Budget updated to $${amount.toFixed(2)}` });
        setEditingPortfolio(null);
        setNewBudget("");
        loadPortfolios();
      } else {
        const data = await res.json();
        setNotification({ type: "error", text: data.detail || "Failed to update budget." });
      }
    } catch (e) {
      setNotification({ type: "error", text: "Network error updating budget." });
    }
  };

  const loadKeywordTargets = async () => {
    if (!selectedProfileId) return;
    setIsTargetsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/targets?profile_id=${selectedProfileId}&limit=500`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setKeywordTargets(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsTargetsLoading(false);
  };

  useEffect(() => {
    if (mainTab === "KEYWORDS") {
      loadKeywordTargets();
    }
    if (mainTab === "SEARCH_TERMS") {
      loadSearchTerms();
    }
  }, [mainTab, selectedProfileId]);

  const handleSaveTargetBid = async (targetId: string, newState?: string) => {
    try {
      const payload: any = {};
      if (newState) payload.state = newState;
      if (tempTargetBid && editingTargetId === targetId) payload.bid = parseFloat(tempTargetBid);
      
      const res = await fetch(`${BASE_URL}/api/v1/ads/targets/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNotification({ type: "success", text: "Target updated successfully!" });
        setEditingTargetId(null);
        loadKeywordTargets();
      } else {
        setNotification({ type: "error", text: "Failed to update target." });
      }
    } catch (e) {
      setNotification({ type: "error", text: "Error updating target." });
    }
  };

  const [newPipeline, setNewPipeline] = useState({
    discovery_campaign_id: "", discovery_ad_group_id: "",
    testing_campaign_id: "", testing_ad_group_id: "",
    refining_campaign_id: "", refining_ad_group_id: "",
    scaling_campaign_id: "", scaling_ad_group_id: "",
    testing_min_orders: 2, refining_min_orders: 4, scaling_min_orders: 6,
    min_clicks: 5, target_acos: 0.25, enable_auto_negative: true
  });
  const [isCreatingPipeline, setIsCreatingPipeline] = useState<boolean>(false);
  
  // Campaign Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [builderSku, setBuilderSku] = useState("");
  const [builderBudget, setBuilderBudget] = useState(50);
  const [builderPreview, setBuilderPreview] = useState<any>(null);
  const [builderJobId, setBuilderJobId] = useState<number | null>(null);
  const [builderJobStatus, setBuilderJobStatus] = useState<any>(null);
  const [isPollingJob, setIsPollingJob] = useState(false);
  
  // Existing Campaigns detected
  const [existingCampaigns, setExistingCampaigns] = useState<any[]>([]);
  const [showExistingWarning, setShowExistingWarning] = useState(false);
  // Harvesting Workflows State
  const [harvestingWorkflows, setHarvestingWorkflows] = useState<any[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({
    source_campaign_id: "",
    source_ad_group_id: "",
    dest_campaign_id: "",
    dest_ad_group_id: "",
    min_orders: 3,
    min_clicks: 10,
    min_spend: 0.0,
    target_acos: 25.0,
    enable_auto_negative: true,
    enable_auto_exact: true
  });
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState<boolean>(false);

  const showToast = (type: "success" | "error", text: string) => setNotification({ type, text });

  const toggleObjective = (campaignId: string, currentObj: string = "SCALE") => {
    const next = currentObj === "SCALE" ? "LAUNCH" : currentObj === "LAUNCH" ? "LIQUIDATE" : "SCALE";
    setCampaigns((prev) =>
      prev.map((c) => (c.campaign_id === campaignId ? { ...c, objective: next as any } : c))
    );
    showToast("success", `Campaign strategy objective updated to ${next}`);
  };

  const toggleAutomationMode = (campaignId: string, currentMode: string = "MANUAL") => {
    const next = currentMode === "MANUAL" ? "AUTOPILOT" : "MANUAL";
    setCampaigns((prev) =>
      prev.map((c) => (c.campaign_id === campaignId ? { ...c, automation_mode: next as any } : c))
    );
    showToast("success", `Automation mode set to ${next === "AUTOPILOT" ? "Autopilot 24/7" : "Manual Review"}`);
  };

  const toggleDayparting = async (campaignId: string, scheduleToSave?: DaypartingSchedule) => {
    const campaign = campaigns.find(c => c.campaign_id === campaignId);
    if (!campaign) return;
    
    // If they are just clicking the toggle directly on the row, we flip the state.
    // If they are saving from the modal, we force it to true and save the schedule.
    const newEnabledState = scheduleToSave ? true : !campaign.dayparting_enabled;

    // Optimistic UI Update
    setCampaigns((prev) =>
      prev.map((c) => (c.campaign_id === campaignId ? { ...c, dayparting_enabled: newEnabledState, dayparting_schedule: scheduleToSave || c.dayparting_schedule } : c))
    );

    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaigns/dayparting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          campaign_id: campaignId, 
          enabled: newEnabledState,
          schedule: scheduleToSave 
        })
      });
      if (!res.ok) throw new Error("Failed to update dayparting");
      
      showToast("success", `Hourly Dayparting Engine ${newEnabledState ? 'Enabled' : 'Disabled'} for this campaign.`);
    } catch (e) {
      console.error(e);
      // Revert UI if failed
      setCampaigns((prev) =>
        prev.map((c) => (c.campaign_id === campaignId ? { ...c, dayparting_enabled: !newEnabledState } : c))
      );
      showToast("error", "Failed to update Dayparting Engine.");
    }
  };

  const openAnalytics = async (targetId: string, name: string) => {
    setAnalyticsTargetId(targetId);
    setAnalyticsTargetName(name);
    setIsAnalyticsLoading(true);
    setAnalyticsData([]);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/analytics/trend?target_id=${targetId}&profile_id=${profiles[0]?.profile_id}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.trend) {
        setAnalyticsData(data.trend);
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to load trend data.");
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency + " ";
    return `${sym}${amount.toLocaleString()}`;
  };

  const handleDisconnect = async () => {
    setShowDisconnectModal(false);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/oauth/disconnect`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setProfiles([]);
        setSelectedProfileId("");
        setIsConnected(false);
        showToast("success", "Amazon Advertising disconnected successfully.");
      } else {
        const err = await res.json();
        showToast("error", err.detail || "Failed to disconnect account.");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Network error while disconnecting.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (profId?: string) => {
    setLoading(true);
    try {
      // 0. Check connection status
      const statusRes = await fetch(`${BASE_URL}/api/v1/ads/oauth/status`, { credentials: "include" });
      if (statusRes.ok) {
        const { is_connected } = await statusRes.json();
        setIsConnected(is_connected);
      }

      // 1. Fetch Entitlements
      const entRes = await fetch(`${BASE_URL}/api/v1/ads/entitlements`, {
        credentials: "include"
      });
      if (entRes.ok) {
        const entData = await entRes.json();
        setEntitlements(entData);
      }

      // 2. Fetch Profiles (Production API)
      const profRes = await fetch(`${BASE_URL}/api/v1/ads/profiles`, {
        credentials: "include"
      });
      let profList: AdProfile[] = [];
      if (profRes.ok) {
        profList = await profRes.json();
        setProfiles(profList);
      }

      const currentProfId = profId || (profList.length > 0 ? profList[0].profile_id : "");
      if (currentProfId) {
        setSelectedProfileId(currentProfId);

        // 3. Fetch Scorecard
        try {
          const scRes = await fetch(`${BASE_URL}/api/v1/ads/scorecard?profile_id=${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (scRes.ok) {
            const scData = await scRes.json();
            setScorecard(scData);
          }
        } catch (e) {
          console.error("Scorecard fetch error:", e);
        }

        // 4. Fetch Recommendations
        try {
          const recRes = await fetch(`${BASE_URL}/api/v1/ads/recommendations?profile_id=${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            setRecommendations(recData.recommendations || []);
          }
        } catch (e) {
          console.error("Recommendations fetch error:", e);
        }

        // 5. Fetch Campaigns (Ad Manager)
        try {
          const campRes = await fetch(`${BASE_URL}/api/v1/ads/campaigns/${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (campRes.ok) {
            const campData = await campRes.json();
            setCampaigns(campData);
          }
        } catch (e) {
          console.error("Campaigns fetch error:", e);
        }

        // 6. Fetch Change Logs (WORM Audit Trail)
        try {
          const logRes = await fetch(`${BASE_URL}/api/v1/ads/change-logs/${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (logRes.ok) {
            const logData = await logRes.json();
            setChangeLogs(logData);
          }
        } catch (e) {
          console.error("Change logs fetch error:", e);
        }

        // 7. Fetch Custom Rules
        try {
          const ruleRes = await fetch(`${BASE_URL}/api/v1/ads/custom-rules/${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (ruleRes.ok) {
            const ruleData = await ruleRes.json();
            setCustomRules(ruleData);
          }
        } catch (e) {
          console.error("Custom rules fetch error:", e);
        }
        // 8. Fetch Promotion Pipelines
        try {
          const plRes = await fetch(`${BASE_URL}/api/v1/ads/promotion-pipelines/${encodeURIComponent(currentProfId)}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          });
          if (plRes.ok) {
            const plData = await plRes.json();
            setPromotionPipelines(plData);
          }
        } catch (e) {
          console.error("Promotion pipelines fetch error:", e);
        }
        // 9. Fetch Harvesting Workflows
        try {
          const wfRes = await fetch(`${BASE_URL}/api/v1/ads/harvesting-workflows?profile_id=${encodeURIComponent(currentProfId)}`, {
            credentials: "include"
          });
          if (wfRes.ok) {
            const wfData = await wfRes.json();
            setHarvestingWorkflows(wfData);
          }
        } catch (e) {
          console.error("Harvesting workflows fetch error:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load PPC Optimizer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Poll Campaign Builder Job
  useEffect(() => {
    let interval: any;
    if (builderJobId && isPollingJob) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/ads/campaign-builder/jobs/${builderJobId}`, {
            credentials: "include"
          });
          if (res.ok) {
            const data = await res.json();
            setBuilderJobStatus(data);
            if (["COMPLETED", "FAILED", "ROLLED_BACK", "CANCELLED"].includes(data.status)) {
              setIsPollingJob(false);
              clearInterval(interval);
              fetchAllData(selectedProfileId || undefined); // Refresh pipelines
            }
          }
        } catch (e) {
          console.error("Job polling error", e);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [builderJobId, isPollingJob]);

  const handleProfileChange = (profId: string) => {
    setSelectedProfileId(profId);
    fetchAllData(profId);
  };

  const handleCheckSku = async () => {
    if (!builderSku) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaigns/check-sku?sku=${encodeURIComponent(builderSku)}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setExistingCampaigns(data.existing_campaigns || []);
        if (data.existing_campaigns?.length > 0) setShowExistingWarning(true);
        else setShowExistingWarning(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreviewBuilder = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaign-builder/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sku: builderSku, global_budget: builderBudget })
      });
      if (res.ok) {
        const data = await res.json();
        setBuilderPreview(data.preview);
        setBuilderStep(2);
      } else {
        const err = await res.json();
        showToast("error", err.detail || "Validation failed.");
      }
    } catch (e) {
      showToast("error", "Failed to fetch preview.");
    }
  };

  const handleLaunchBuilder = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaign-builder/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          profile_id: selectedProfileId,
          sku: builderSku, 
          global_budget: builderBudget,
          template_id: "proven_pipeline"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBuilderJobId(data.job_id);
        setIsPollingJob(true);
        setBuilderStep(3); // Progress view
      }
    } catch (e) {
      showToast("error", "Launch failed.");
    }
  };

  const handleCancelJob = async () => {
    if (!builderJobId) return;
    try {
      await fetch(`${BASE_URL}/api/v1/ads/campaign-builder/jobs/${builderJobId}/cancel`, {
        method: "POST",
        credentials: "include"
      });
      showToast("success", "Cancellation requested.");
    } catch (e) {
      showToast("error", "Cancel failed.");
    }
  };
  
  const handleResolveJob = async (resolution: string) => {
    if (!builderJobId) return;
    try {
      await fetch(`${BASE_URL}/api/v1/ads/campaign-builder/jobs/${builderJobId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resolution })
      });
      showToast("success", `Resolution applied: ${resolution}`);
      setIsPollingJob(true); // resume polling
    } catch (e) {
      showToast("error", "Resolve failed.");
    }
  };

  const handleApply = async (recId: number) => {
    setApplyingId(recId);
    setNotification(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/recommendations/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recommendation_id: recId })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: "success", text: `Recommendation applied successfully! Audit Log ID: #${data.audit_log_id}` });
        setRecommendations((prev) =>
          prev.map((r) => (r.id === recId ? { ...r, status: "APPLIED" } : r))
        );
        if (entitlements) {
          setEntitlements({
            ...entitlements,
            monthly_applies_used: entitlements.monthly_applies_used + 1
          });
        }
      } else {
        setNotification({ type: "error", text: data.detail || "Failed to apply recommendation." });
      }
    } catch (err) {
      setNotification({ type: "error", text: "Network error applying recommendation." });
    } finally {
      setApplyingId(null);
    }
  };

  const handleRollback = async (recId: number) => {
    setRollbackId(recId);
    setNotification(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/recommendations/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recommendation_id: recId })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: "success", text: "Change undone successfully! Your bid has been restored." });
        setRecommendations((prev) =>
          prev.map((r) => (r.id === recId ? { ...r, status: "ROLLED_BACK" } : r))
        );
      } else {
        setNotification({ type: "error", text: data.detail || "Failed to rollback recommendation." });
      }
    } catch (err) {
      setNotification({ type: "error", text: "Network error reverting recommendation." });
    } finally {
      setRollbackId(null);
    }
  };

  const handleDismiss = async (recId: number, days: number = 7) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/recommendations/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recommendation_id: recId, snooze_days: days })
      });
      if (res.ok) {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === recId ? { ...r, status: "DISMISSED" } : r))
        );
        showToast("success", `Recommendation snoozed for ${days} days.`);
      } else {
        showToast("error", "Failed to snooze recommendation.");
      }
    } catch (e) {
      showToast("error", "Error snoozing recommendation.");
    }
  };

  const handleBulkApply = async () => {
    if (selectedRecIds.length === 0) return;
    setLoading(true);
    let count = 0;
    for (const id of selectedRecIds) {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/ads/recommendations/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recommendation_id: id })
        });
        if (res.ok) {
          count++;
          setRecommendations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "APPLIED" } : r))
          );
        }
      } catch (e) {
        console.error("Bulk apply error for id", id, e);
      }
    }
    setSelectedRecIds([]);
    setLoading(false);
    showToast("success", `Successfully applied ${count} selected recommendations in bulk!`);
    if (selectedProfileId) {
      await fetchAllData(selectedProfileId);
    }
  };

  const handleToggleCampaignState = async (campaignId: string, currentState: string) => {
    const nextState = currentState === "ENABLED" ? "PAUSED" : "ENABLED";
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaigns/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ campaign_id: campaignId, state: nextState })
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.campaign_id === campaignId ? { ...c, state: nextState } : c))
        );
        showToast("success", `Campaign status updated to ${nextState}`);
      } else {
        showToast("error", "Failed to update campaign status.");
      }
    } catch (e) {
      showToast("error", "Error updating campaign status.");
    }
  };

  const handleSaveBudget = async (campaignId: string) => {
    const bVal = parseFloat(tempBudget);
    if (isNaN(bVal) || bVal <= 0) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/campaigns/update-budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ campaign_id: campaignId, daily_budget: bVal })
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.campaign_id === campaignId ? { ...c, daily_budget: bVal } : c))
        );
        setEditingBudgetId(null);
        showToast("success", `Budget updated to ₹${bVal.toLocaleString()}`);
      } else {
        showToast("error", "Failed to update budget.");
      }
    } catch (e) {
      showToast("error", "Error updating budget.");
    }
  };

  const toggleSelectRec = (recId: number) => {
    setSelectedRecIds((prev) =>
      prev.includes(recId) ? prev.filter((id) => id !== recId) : [...prev, recId]
    );
  };

  const toggleSelectAll = (recs: Recommendation[]) => {
    const activeIds = recs.filter((r) => r.status === "PENDING").map((r) => r.id);
    if (activeIds.every((id) => selectedRecIds.includes(id))) {
      setSelectedRecIds((prev) => prev.filter((id) => !activeIds.includes(id)));
    } else {
      setSelectedRecIds((prev) => Array.from(new Set([...prev, ...activeIds])));
    }
  };

  const filteredRecs = recommendations.filter((r) => r.rule_type === activeTab && r.status !== "DISMISSED");
  const filteredChangeLogs = changeLogs.filter((log) => {
    const matchesAction = filterActionType === "ALL" || log.action_type === filterActionType;
    const matchesSearch = !searchChangeLog || 
      log.target_id.toLowerCase().includes(searchChangeLog.toLowerCase()) ||
      (log.old_value && log.old_value.toLowerCase().includes(searchChangeLog.toLowerCase())) ||
      (log.new_value && log.new_value.toLowerCase().includes(searchChangeLog.toLowerCase()));
    return matchesAction && matchesSearch;
  });
  const activeProfile = profiles.find((p) => p.profile_id === selectedProfileId);
  const currSym = activeProfile?.currency_code || "INR";

  const handleCreateRule = async () => {
    if (!newRule.rule_name.trim()) return showToast("error", "Rule Name is required");
    setIsCreatingRule(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/custom-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_id: selectedProfileId,
          ...newRule
        })
      });
      if (!res.ok) throw new Error("Failed to create rule");
      showToast("success", "Custom Rule created successfully!");
      setNewRule({ rule_name: "", condition_acos_gt: 40, condition_clicks_gt: 15, action_type: "DECREASE_BID", action_value: 15 });
      // Refetch
      fetchAllData(selectedProfileId);
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to create rule.");
    } finally {
      setIsCreatingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/custom-rules/${ruleId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete rule");
      setCustomRules(prev => prev.filter(r => r.id !== ruleId));
      showToast("success", "Custom Rule deleted.");
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to delete rule.");
    }
  };

  const handleCreatePipeline = async () => {
    if (!newPipeline.discovery_ad_group_id || !newPipeline.testing_ad_group_id) {
      showToast("error", "At minimum, Discovery and Testing Ad Groups are required.");
      return;
    }
    setIsCreatingPipeline(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/promotion-pipelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_id: selectedProfileId,
          ...newPipeline
        })
      });
      if (!res.ok) throw new Error("Failed to create pipeline");
      showToast("success", "Promotion Pipeline created successfully!");
      setNewPipeline({
        discovery_campaign_id: "", discovery_ad_group_id: "",
        testing_campaign_id: "", testing_ad_group_id: "",
        refining_campaign_id: "", refining_ad_group_id: "",
        scaling_campaign_id: "", scaling_ad_group_id: "",
        testing_min_orders: 2, refining_min_orders: 4, scaling_min_orders: 6,
        min_clicks: 5, target_acos: 0.25, enable_auto_negative: true
      });
      fetchAllData(selectedProfileId); // Refresh list
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to create pipeline.");
    } finally {
      setIsCreatingPipeline(false);
    }
  };

  const handleDeletePipeline = async (pipelineId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/promotion-pipelines/${pipelineId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete pipeline");
      setPromotionPipelines(prev => prev.filter(p => p.id !== pipelineId));
      showToast("success", "Pipeline deleted.");
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to delete pipeline.");
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.source_campaign_id || !newWorkflow.source_ad_group_id || !newWorkflow.dest_campaign_id || !newWorkflow.dest_ad_group_id) {
      return showToast("error", "Source and Destination mappings are required");
    }
    setIsCreatingWorkflow(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/harvesting-workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile_id: selectedProfileId,
          ...newWorkflow
        })
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      showToast("success", "Harvester Workflow created successfully!");
      setNewWorkflow({
        source_campaign_id: "", source_ad_group_id: "",
        dest_campaign_id: "", dest_ad_group_id: "",
        min_orders: 3, min_clicks: 10, min_spend: 0.0, target_acos: 25.0,
        enable_auto_negative: true, enable_auto_exact: true
      });
      fetchAllData(selectedProfileId);
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to create workflow.");
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/ads/harvesting-workflows/${workflowId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete workflow");
      setHarvestingWorkflows(prev => prev.filter(w => w.id !== workflowId));
      showToast("success", "Workflow deleted.");
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to delete workflow.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      {/* ── Top Bar ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={openSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Amazon Ads Optimizer (India)
                </h1>
                {profiles.length > 0 ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700 flex items-center gap-1 px-2 py-0.5 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Live Account Connected
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 px-2 py-0.5 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    Account Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Smart 24/7 Campaign Optimization • Real-time Profit & Spend Analytics • 1-Click Bid Adjustments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Marketplace Profile Selector */}
            {profiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {profiles.map((p) => (
                  <option key={p.profile_id} value={p.profile_id}>
                    {p.country_code} ({p.currency_code}) — {p.account_type.toUpperCase()}
                  </option>
                ))}
              </select>
            )}

            {/* Target ACOS & Refresh Buttons (Only show when connected) */}
            {profiles.length > 0 && (
              <>
                <button
                  onClick={() => setShowAcosModal(true)}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                >
                  <Sliders className="w-4 h-4" />
                  Target ACOS: {targetAcos}%
                </button>

                <button
                  onClick={() => fetchAllData(selectedProfileId)}
                  disabled={loading}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>

                <button
                  onClick={() => setShowDisconnectModal(true)}
                  disabled={loading}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 transition-all disabled:opacity-50"
                  title="Disconnect Account"
                >
                  <Unplug className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Notification Alert */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              {notification.text}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Entitlement Upsell Banner (Free Tier / Limit Warning) ───────────── */}
        {entitlements && !entitlements.can_apply_recommendations && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-pink-900/90 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-md">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  Free Tier Preview Mode
                </h3>
                <p className="text-xs sm:text-sm text-purple-200">
                  {entitlements.upsell_message || "Upgrade to unlock 1-Click Bleeder Blocking & Winner Keyword Launching!"}
                </p>
              </div>
            </div>
            <a
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-950 font-bold text-sm shadow-md transition-transform hover:scale-105 whitespace-nowrap"
            >
              Upgrade to Premium
            </a>
          </div>
        )}

        {/* ── Production Onboarding Card (When No Amazon Ads Account is Connected) ── */}
        {!loading && !isConnected && (
          <div className="mb-8 p-8 sm:p-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Connect Your Amazon Advertising Account
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
              Insydz automatically stops loss-making search terms, scales your profitable keywords, and manages your CPC bids 24/7. Connect your Amazon Seller account securely to unlock the PPC Optimizer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left w-full">
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  1-Click Undo Protection
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Easily undo any bid change or keyword action anytime with a single click.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2 text-sm">
                  <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  Stop Wasted Ad Spend
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically pause keywords that spend money without generating orders.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-2 text-sm">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  100% Secure & Private
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Official Amazon Ads connection. No access to your bank account or payouts.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <a
                href={`${BASE_URL}/api/v1/ads/oauth/authorize?user_id=${user?.id || 1}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-xl bg-[#F3A847] hover:bg-[#f3a847]/90 text-gray-900 font-bold text-base shadow-sm transition-all"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M13.95 14.28c-.4-.36-1.12-.24-1.57.17-.5.45-.63 1.13-.27 1.62.83 1.15 2.27 1.58 3.52 1.48 1.45-.11 2.82-.93 3.4-2.29.35-.83.35-1.9-.11-2.67-.84-1.42-2.82-1.77-4.2-1.02-1.08.6-1.63 1.77-1.34 2.89.17.65.75 1.14 1.41 1.25.75.13 1.44-.35 1.64-1.05.15-.53-.13-.97-.56-1.1-.34-.1-.7.12-.81.44-.12.37.12.72.47.81.2.06.41-.05.47-.23.05-.16-.04-.33-.2-.37-.09-.02-.18.03-.2.11-.03.11.05.21.16.24.06.01.12-.03.14-.08.01-.06-.03-.12-.09-.13-.03 0-.07.02-.07.06 0 .03.03.06.06.07.02 0 .04-.01.05-.03.01-.02 0-.04-.02-.04-.01 0-.02.01-.02.02 0 .01.01.02.02.02.01 0 .01-.01.01-.01 0 0 0 0 0 0z" />
                </svg>
                Connect Amazon Advertising Account
              </a>
              <span className="text-xs text-gray-500 font-medium">
                Takes less than 30 seconds • Instant secure data sync
              </span>
            </div>
          </div>
        )}

        {/* ── Zero Profiles Found Card ── */}
        {!loading && isConnected && profiles.length === 0 && (
          <div className="mb-8 p-8 sm:p-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 shadow-sm text-center max-w-3xl mx-auto flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-6" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Amazon Connected, But No Profiles Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8">
              Your Amazon Seller account was successfully linked, but the Amazon API returned exactly 0 advertising profiles. 
              This usually means that the account you logged into has not actively registered for Amazon Advertising, or does not have any active ad campaigns.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchAllData()}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Refresh Connection
              </button>
              <button
                onClick={() => setShowDisconnectModal(true)}
                className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl font-semibold hover:bg-red-200 transition-all"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        )}

        {profiles.length > 0 && (
          /* ── LIVE DATA WORKSPACE (When Connected) ── */
          <>
            {/* ── Top KPI Scorecard ───────────────────────────────── */}
            {scorecard && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                <span>Total Ad Spend</span>
                <DollarSign className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(scorecard.total_spend, currSym)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 30 Days</div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                <span>Total Ad Sales</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(scorecard.total_sales, currSym)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                +18.4% vs prev
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                <span>Total Orders</span>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {scorecard.total_orders.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                CVR: {((scorecard.total_orders / (scorecard.total_clicks || 1)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                <span>ACOS</span>
                <BarChart2 className="w-4 h-4 text-amber-500" />
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  scorecard.acos <= targetAcos
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {scorecard.acos}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Target: {targetAcos}%</div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                <span>ROAS</span>
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {scorecard.roas}x
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                Profitable
              </div>
            </div>
          </div>
        )}

        {/* ── Top-Level Navigation Tabs ─────────── */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-2xl px-4 pt-2 gap-4">
          <button
            onClick={() => setMainTab("SUGGESTIONS")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "SUGGESTIONS"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI RoAS Recommendations
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
              {recommendations.length}
            </Badge>
          </button>

          <button
            onClick={() => setMainTab("AD_MANAGER")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "AD_MANAGER"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Target className="w-4 h-4" />
            Campaign Manager
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
              {campaigns.length}
            </Badge>
          </button>

          <button
            onClick={() => setMainTab("CHANGE_LOG")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "CHANGE_LOG"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Audit Trail & Undo
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
              {changeLogs.length}
            </Badge>
          </button>

          <button
            onClick={() => setMainTab("ANALYTICS")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "ANALYTICS"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Ad Spends & Profitability
          </button>

          <button
            onClick={() => setMainTab("CUSTOM_RULES")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "CUSTOM_RULES"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Ad Automation Rules
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
              {customRules.length}
            </Badge>
          </button>
          <button
            onClick={() => setMainTab("KEYWORDS")}
            className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
              mainTab === "KEYWORDS"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <List className="w-4 h-4" />
            Keyword Bid Manager
          </button>

        </div>

        {/* ── 1. SUGGESTIONS TAB ───────────────────── */}
        {mainTab === "SUGGESTIONS" && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm overflow-hidden">
            {/* Sub-Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={() => setActiveTab("BLEEDER")}
                className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === "BLEEDER"
                    ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                High Spend, Zero Sales (Money Wasters)
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ml-1">
                  {recommendations.filter((r) => r.rule_type === "BLEEDER").length}
                </Badge>
              </button>

              <button
                onClick={() => setActiveTab("HARVESTER")}
                className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === "HARVESTER"
                    ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-950/10"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Profitable Search Terms (Harvesting)
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 ml-1">
                  {recommendations.filter((r) => r.rule_type === "HARVESTER").length}
                </Badge>
              </button>

              <button
                onClick={() => setActiveTab("BID_OPTIMIZE")}
                className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === "BID_OPTIMIZE"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Sliders className="w-4 h-4" />
                RoAS-Based Bid Adjustments
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 ml-1">
                  {recommendations.filter((r) => r.rule_type === "BID_OPTIMIZE").length}
                </Badge>
              </button>
            </div>

            {/* Recommendations Cards List */}
            <div className="p-4 sm:p-6">
              
              {/* HARVESTER WORKFLOW BUILDER */}
              {activeTab === "HARVESTER" && (
                <div className="mb-8 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/40 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Automated Campaign Funnels
                    </h3>
                  </div>
                  
                  {/* Active Pipelines List */}
                  {promotionPipelines.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Pipelines</h4>
                      {promotionPipelines.map(p => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-900 border border-green-100 dark:border-green-900/40 rounded-xl">
                          <div className="flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">#{p.id}</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">Discovery: {p.discovery_ad_group_id || 'N/A'}</span>
                            <span className="text-gray-400">➔</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">Testing: {p.testing_ad_group_id || 'N/A'}</span>
                            <span className="text-gray-400">➔</span>
                            <span className="font-medium text-purple-600 dark:text-purple-400">Refining: {p.refining_ad_group_id || 'N/A'}</span>
                            <span className="text-gray-400">➔</span>
                            <span className="font-medium text-green-600 dark:text-green-400">Scaling: {p.scaling_ad_group_id || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <button onClick={() => handleDeletePipeline(p.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Create New Pipeline */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-green-200 dark:border-green-800/40">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Create New Promotion Pipeline</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {/* Discovery -> Testing */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/40">
                        <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 mb-2">Stage 1: Discovery (Auto)</label>
                        <input type="text" value={newPipeline.discovery_ad_group_id} onChange={e => setNewPipeline({...newPipeline, discovery_ad_group_id: e.target.value})} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm mb-2" placeholder="Ad Group ID" />
                        <label className="block text-xs text-gray-500">Graduates at {newPipeline.testing_min_orders} orders</label>
                        <input type="range" min="1" max="10" value={newPipeline.testing_min_orders} onChange={e => setNewPipeline({...newPipeline, testing_min_orders: parseInt(e.target.value)})} className="w-full" />
                      </div>
                      
                      {/* Testing -> Refining */}
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/40">
                        <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-2">Stage 2: Testing (Broad)</label>
                        <input type="text" value={newPipeline.testing_ad_group_id} onChange={e => setNewPipeline({...newPipeline, testing_ad_group_id: e.target.value})} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm mb-2" placeholder="Ad Group ID" />
                        <label className="block text-xs text-gray-500">Graduates at {newPipeline.refining_min_orders} orders</label>
                        <input type="range" min="1" max="10" value={newPipeline.refining_min_orders} onChange={e => setNewPipeline({...newPipeline, refining_min_orders: parseInt(e.target.value)})} className="w-full" />
                      </div>
                      
                      {/* Refining -> Scaling */}
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/40">
                        <label className="block text-xs font-bold text-purple-800 dark:text-purple-400 mb-2">Stage 3: Refining (Phrase)</label>
                        <input type="text" value={newPipeline.refining_ad_group_id} onChange={e => setNewPipeline({...newPipeline, refining_ad_group_id: e.target.value})} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm mb-2" placeholder="Ad Group ID" />
                        <label className="block text-xs text-gray-500">Graduates at {newPipeline.scaling_min_orders} orders</label>
                        <input type="range" min="1" max="10" value={newPipeline.scaling_min_orders} onChange={e => setNewPipeline({...newPipeline, scaling_min_orders: parseInt(e.target.value)})} className="w-full" />
                      </div>

                      {/* Scaling */}
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/40">
                        <label className="block text-xs font-bold text-green-800 dark:text-green-400 mb-2">Stage 4: Scaling (Exact)</label>
                        <input type="text" value={newPipeline.scaling_ad_group_id} onChange={e => setNewPipeline({...newPipeline, scaling_ad_group_id: e.target.value})} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm mb-2" placeholder="Ad Group ID" />
                        <label className="block text-xs text-gray-500 mt-2">Final destination.</label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Global Target ACOS {"(<=)"}</label>
                        <input type="number" step="0.01" value={newPipeline.target_acos} onChange={e => setNewPipeline({...newPipeline, target_acos: parseFloat(e.target.value)})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                          <input type="checkbox" checked={newPipeline.enable_auto_negative} onChange={e => setNewPipeline({...newPipeline, enable_auto_negative: e.target.checked})} className="rounded text-green-600 focus:ring-green-500" />
                          Auto-Negate in Previous Stage
                        </label>
                      </div>
                      <div className="flex justify-end items-end">
                        <button
                          onClick={handleCreatePipeline}
                          disabled={isCreatingPipeline}
                          className="inline-flex items-center justify-center w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-colors"
                        >
                          {isCreatingPipeline ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Create Pipeline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                  <p className="text-sm">Scanning your campaigns for savings and profit opportunities...</p>
                </div>
              ) : filteredRecs.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-80" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No active {activeTab.toLowerCase()} recommendations right now
                  </h3>
                  <p className="text-sm max-w-md mx-auto mt-1">
                    Your campaigns are currently performing within your {targetAcos}% Target ACOS threshold. We scan 24/7 for new optimization opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Select Bar */}
                  <div className="flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2.5 rounded-xl">
                    <button
                      onClick={() => toggleSelectAll(filteredRecs)}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white transition-colors"
                    >
                      {filteredRecs.filter((r) => r.status === "PENDING").length > 0 &&
                      filteredRecs
                        .filter((r) => r.status === "PENDING")
                        .every((r) => selectedRecIds.includes(r.id)) ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                      Select All Pending ({filteredRecs.filter((r) => r.status === "PENDING").length})
                    </button>

                    {selectedRecIds.length > 0 && (
                      <button
                        onClick={handleBulkApply}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Apply Selected ({selectedRecIds.length}) in Bulk
                      </button>
                    )}
                  </div>

                  {filteredRecs.map((rec) => {
                    const ev = rec.evidence || {};
                    const isApplied = rec.status === "APPLIED";
                    const isRolledBack = rec.status === "ROLLED_BACK";
                    const canApply = entitlements?.can_apply_recommendations;
                    const isSelected = selectedRecIds.includes(rec.id);

                    return (
                      <div
                        key={rec.id}
                        className={`border rounded-xl p-4 sm:p-5 transition-all ${
                          isApplied
                            ? "bg-green-50/20 dark:bg-green-950/10 border-green-200 dark:border-green-900/40"
                            : isRolledBack
                            ? "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-70"
                            : "bg-white dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Left Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {rec.status === "PENDING" && (
                                <button
                                  onClick={() => toggleSelectRec(rec.id)}
                                  className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <span className="font-bold text-gray-900 dark:text-white text-base">
                                {ev.search_term || ev.keyword || rec.target_id}
                              </span>
                              <button
                                onClick={() => openAnalytics(rec.target_id, ev.search_term || ev.keyword || rec.target_id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-indigo-500 transition-colors"
                                title="View 60-Day Trend"
                              >
                                <LineChartIcon className="w-4 h-4" />
                              </button>
                              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                                {rec.rule_type}
                              </Badge>
                              {ev.match_type && (
                                <Badge className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs">
                                  {ev.match_type}
                                </Badge>
                              )}
                            </div>

                            {/* Key Evidence Stats */}
                            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                              {ev.clicks !== undefined && (
                                <span>
                                  Clicks: <strong className="text-gray-700 dark:text-gray-300">{ev.clicks}</strong>
                                </span>
                              )}
                              {ev.spend !== undefined && (
                                <span>
                                  Spend:{" "}
                                  <strong className="text-gray-700 dark:text-gray-300">
                                    {formatCurrency(ev.spend, currSym)}
                                  </strong>
                                </span>
                              )}
                              {ev.acos !== undefined && (
                                <span>
                                  ACOS:{" "}
                                  <strong className={ev.acos > targetAcos ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                                    {ev.acos.toFixed(1)}%
                                  </strong>
                                </span>
                              )}
                              {ev.sales !== undefined && (
                                <span>
                                  Sales:{" "}
                                  <strong className="text-gray-700 dark:text-gray-300">
                                    {formatCurrency(ev.sales, currSym)}
                                  </strong>
                                </span>
                              )}
                              {ev.orders !== undefined && (
                                <span>
                                  Orders: <strong className="text-gray-700 dark:text-gray-300">{ev.orders}</strong>
                                </span>
                              )}
                              {ev.current_bid !== undefined && (
                                <span>
                                  Bid: {formatCurrency(ev.current_bid, currSym)} ➔{" "}
                                  <strong className="text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(ev.suggested_bid, currSym)}
                                  </strong>
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {ev.reason || "Deterministic mathematical optimization recommendation."}
                            </p>

                            {rec.rule_type === "HARVESTER" && (
                              <div className="mt-3 flex flex-col gap-2 p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg text-sm text-green-900 dark:text-green-300 shadow-sm">
                                <div className="font-semibold flex items-center gap-2 mb-1 border-b border-green-200 dark:border-green-800/40 pb-2">
                                  <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  1-Click Isolation Actions
                                </div>
                                <div className="flex items-center gap-2">
                                  {ev.enable_auto_exact ? (
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <div className="w-4 h-4" />
                                  )}
                                  <span className={!ev.enable_auto_exact ? "text-gray-400 line-through" : ""}>
                                    Add as EXACT Keyword in Destination Ad Group
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {ev.enable_auto_negative ? (
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <div className="w-4 h-4" />
                                  )}
                                  <span className={!ev.enable_auto_negative ? "text-gray-400 line-through" : ""}>
                                    Add as NEGATIVE EXACT in Source Ad Group
                                  </span>
                                </div>
                              </div>
                            )}

                            {rec.rule_type === "BID_OPTIMIZE" && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Bid Safety Limit: Safely limited between Min ₹2.00 and Max ₹150.00</span>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Rule Version: v1.0</span>
                              <span>•</span>
                              <span>Status: {rec.status}</span>
                            </div>
                          </div>

                          {/* Right Actions (1-Click Apply, Snooze, or Undo) */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isApplied ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <Check className="w-3.5 h-3.5" /> Applied
                                </span>
                                <button
                                  onClick={() => handleRollback(rec.id)}
                                  disabled={rollbackId === rec.id}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                                >
                                  <RotateCcw className={`w-3.5 h-3.5 ${rollbackId === rec.id ? "animate-spin" : ""}`} />
                                  Undo (1-Click Restore)
                                </button>
                              </div>
                            ) : isRolledBack ? (
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 italic">
                                Undone / Restored
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDismiss(rec.id, 7)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                  title="Snooze for 7 days"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Snooze 7d
                                </button>

                                <button
                                  onClick={() => handleApply(rec.id)}
                                  disabled={applyingId === rec.id || !canApply}
                                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all ${
                                    !canApply
                                      ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                      : rec.rule_type === "BLEEDER"
                                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white hover:scale-105"
                                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-105"
                                  }`}
                                >
                                  {!canApply ? (
                                    <>
                                      <Lock className="w-4 h-4" />
                                      Unlock in Premium
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-4 h-4" />
                                      {rec.rule_type === "BLEEDER"
                                        ? "Block Bleeder"
                                        : rec.rule_type === "HARVESTER"
                                        ? "Isolate Search Term"
                                        : "Apply Bid"}
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── 2. ALL CAMPAIGNS TAB ──────────── */}
        {mainTab === "AD_MANAGER" && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  All Campaigns — Manage Bids & Strategy
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time sync with your Amazon India Sponsored Products & Brands campaigns.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Rocket className="w-4 h-4" />
                  Launch New Campaigns
                </button>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  {campaigns.length} Active Campaigns
                </Badge>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  No campaigns found in this profile.
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Connect your active Amazon Advertising account to view and manage your live campaigns.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-inner bg-white dark:bg-gray-950">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800/95 backdrop-blur text-gray-700 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 font-extrabold">
                    <tr className="text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Campaign Name & Type</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Status</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Strategy Objective</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Automation Mode</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 text-right">Daily Budget</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Ad Groups & Default Bid</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Dayparting</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm font-medium">
                    {campaigns.map((camp) => {
                      const obj = camp.objective || "SCALE";
                      const autoMode = camp.automation_mode || "MANUAL";
                      const isDayparting = !!camp.dayparting_enabled;

                      return (
                        <tr key={camp.campaign_id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors border-b border-gray-200 dark:border-gray-800">
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {camp.name}
                            </div>
                            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                              {camp.campaign_type}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <button
                              onClick={() => handleToggleCampaignState(camp.campaign_id, camp.state)}
                              className="focus:outline-none"
                              title="Click to toggle Enabled/Paused"
                            >
                              <Badge
                                className={`font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                                  camp.state === "ENABLED"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                                    camp.state === "ENABLED" ? "bg-green-500" : "bg-gray-400"
                                  }`}
                                />
                                {camp.state}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <button
                              onClick={() => toggleObjective(camp.campaign_id, obj)}
                              className="focus:outline-none"
                              title="Click to rotate objective: LAUNCH -> SCALE -> LIQUIDATE"
                            >
                              <Badge
                                className={`font-bold cursor-pointer transition-all hover:scale-105 ${
                                  obj === "LAUNCH"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                    : obj === "LIQUIDATE"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                                }`}
                              >
                                {obj === "LAUNCH" ? "🚀 Launch (40% ACOS)" : obj === "LIQUIDATE" ? "💰 Liquidate (15% ACOS)" : "📈 Scale (25% ACOS)"}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <button
                              onClick={() => toggleAutomationMode(camp.campaign_id, autoMode)}
                              className="focus:outline-none"
                              title="Click to toggle Manual vs Autopilot 24/7"
                            >
                              <Badge
                                className={`font-bold cursor-pointer transition-all hover:scale-105 ${
                                  autoMode === "AUTOPILOT"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {autoMode === "AUTOPILOT" ? "🤖 Autopilot 24/7" : "👤 Manual Review"}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle text-right font-mono">
                            {editingBudgetId === camp.campaign_id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-gray-500 text-xs">₹</span>
                                <input
                                  type="number"
                                  value={tempBudget}
                                  onChange={(e) => setTempBudget(e.target.value)}
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                                <button
                                  onClick={() => handleSaveBudget(camp.campaign_id)}
                                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingBudgetId(null)}
                                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingBudgetId(camp.campaign_id);
                                  setTempBudget(camp.daily_budget.toString());
                                }}
                                className="font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center justify-end gap-1"
                                title="Click to edit budget inline"
                              >
                                ₹{camp.daily_budget.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ day</span>
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <div className="space-y-1">
                              {camp.ad_groups.map((ag) => (
                                <div key={ag.ad_group_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded text-xs gap-4">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">{ag.name}</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                    Default Bid: ₹{ag.default_bid.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                            <button
                              onClick={() => {
                                setShowDaypartingModal(camp.campaign_id);
                                setDaypartingSchedule(camp.dayparting_schedule || defaultSchedule);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isDayparting
                                  ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                              }`}
                              title="Click to configure hourly Dayparting Ad Schedule"
                            >
                              <Clock className="w-3 h-3" />
                              {isDayparting ? "Dayparting ON (Custom)" : "Dayparting OFF (24/7)"}
                            </button>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right align-middle">
                            <button
                              onClick={() => setMainTab("SUGGESTIONS")}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                            >
                              Optimize
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 3. HISTORY & UNDO TAB ── */}
        {mainTab === "CHANGE_LOG" && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Change History & 1-Click Undo
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete history of all automatic and manual bid changes applied to your campaigns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {changeLogs.length} Logged Actions
                </Badge>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by keyword, target ID, or value..."
                  value={searchChangeLog}
                  onChange={(e) => setSearchChangeLog(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterActionType}
                  onChange={(e) => setFilterActionType(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-semibold focus:outline-none"
                >
                  <option value="ALL">All Action Types ({changeLogs.length})</option>
                  <option value="ADD_NEGATIVE_KEYWORD">Bleeders / Negative Keywords</option>
                  <option value="ADD_KEYWORD">Winners / New Keywords</option>
                  <option value="UPDATE_BID">Bid Adjustments</option>
                </select>
              </div>
            </div>

            {filteredChangeLogs.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <RotateCcw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  No audit logs matching filters.
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try selecting a different action filter or clearing your search term.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-inner bg-white dark:bg-gray-950">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800/95 backdrop-blur text-gray-700 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 font-extrabold">
                    <tr className="text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Timestamp</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Action Type</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Target Keyword / ID</th>
                      <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Old ➔ New Value</th>
                      <th className="py-3.5 px-4 whitespace-nowrap text-right">1-Click Undo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm font-medium">
                    {filteredChangeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors border-b border-gray-200 dark:border-gray-800">
                        <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle text-gray-600 dark:text-gray-300 font-medium">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold">
                            {log.action_type}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {log.target_id}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800 align-middle">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="text-gray-500 dark:text-gray-400 line-through">{log.old_value}</span>
                            <span className="text-gray-400">➔</span>
                            <span className="text-green-600 dark:text-green-400">{log.new_value}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right align-middle">
                          {log.recommendation_id ? (
                            <button
                              onClick={() => handleRollback(log.recommendation_id)}
                              disabled={rollbackId === log.recommendation_id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${rollbackId === log.recommendation_id ? "animate-spin" : ""}`} />
                              {rollbackId === log.recommendation_id ? "Reverting..." : "Undo Change"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Audit only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 4. PROFIT & AD SPEND ANALYTICS TAB ─────── */}
        {mainTab === "ANALYTICS" && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Total Profitability & Ad Spend Breakdown
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                See how your total advertising spend impacts overall business profit and organic sales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  TACoS (Total ACOS)
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {scorecard && scorecard.total_sales > 0 ? ((scorecard.total_spend / scorecard.total_sales) * 100).toFixed(1) : "0.0"}%
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Healthy (&lt; 20%)
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Target ACOS
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {scorecard ? scorecard.acos.toFixed(1) : "0.0"}%
                </div>
                <div className="text-[11px] text-green-600 dark:text-green-400 mt-2 font-semibold">
                  {scorecard && scorecard.acos <= targetAcos
                    ? `Below ${targetAcos}% Target`
                    : `Above ${targetAcos}% Target`}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  ROAS Multiplier
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {scorecard ? `${scorecard.roas.toFixed(2)}x` : "0.00x"}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  ₹{scorecard ? scorecard.total_sales.toLocaleString() : "0"} / ₹spend
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  CTR (Click-Through)
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {scorecard && scorecard.total_impressions > 0 ? ((scorecard.total_clicks / scorecard.total_impressions) * 100).toFixed(2) : "0.00"}%
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  {scorecard ? scorecard.total_clicks.toLocaleString() : "0"} Clicks
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  CPC (Cost Per Click)
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  ₹{scorecard && scorecard.total_clicks > 0 ? (scorecard.total_spend / scorecard.total_clicks).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  Average Bid Efficiency
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  CVR (Conversion Rate)
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {scorecard && scorecard.total_clicks > 0 ? ((scorecard.total_orders / scorecard.total_clicks) * 100).toFixed(1) : "0.0"}%
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  {scorecard ? scorecard.total_orders : "0"} Total Orders
                </div>
              </div>
            </div>




          </div>
        )}

        {/* ── 6. CUSTOM RULES TAB ───────────────────── */}
        
        
        {mainTab === "KEYWORDS" && !entitlements?.can_use_granular_keywords && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-16 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 dark:ring-indigo-900/10">
              <Lock className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Unlock Granular Keyword Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
              Micromanage bids for every keyword and ASIN target across your entire account. Take full manual control of your ACOS with instant inline editing.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </button>
            <p className="mt-5 text-xs font-medium text-gray-400">
              Premium also unlocks <span className="text-indigo-400">Custom Automation Rules</span> and <span className="text-indigo-400">Unlimited 1-Click Applies</span>.
            </p>
          </div>
        )}

        {mainTab === "KEYWORDS" && entitlements?.can_use_granular_keywords && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Granular Keyword Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manually review and edit bids for every keyword across your entire account.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500"
                    value={targetSearchQuery}
                    onChange={(e) => setTargetSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={loadKeywordTargets}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isTargetsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {entitlements && keywordTargets.length >= entitlements.max_granular_keywords && entitlements.max_granular_keywords > 0 && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3 text-purple-800 dark:text-purple-300">
                  <Crown className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    You've reached your Premium tier limit of <b>{entitlements.max_granular_keywords}</b> visible keywords.
                  </p>
                </div>
                <button className="text-sm font-bold text-purple-700 dark:text-purple-400 hover:underline">
                  Upgrade to Enterprise
                </button>
              </div>
            )}

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-inner bg-white dark:bg-gray-950">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800/95 backdrop-blur text-gray-700 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 font-extrabold">
                  <tr className="text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Target Expression</th>
                    <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Type / Match</th>
                    <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Campaign / Ad Group</th>
                    <th className="py-3.5 px-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">Status</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Current Bid</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {keywordTargets
                    .filter(t => t.expression.toLowerCase().includes(targetSearchQuery.toLowerCase()))
                    .map((target) => (
                    <tr key={target.target_id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-800">
                        {target.expression}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">{target.target_type}</span>
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded inline-block w-max">
                            {target.match_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 border-r border-gray-100 dark:border-gray-800">
                        <div className="truncate max-w-[200px]" title={target.campaign_id}>Camp: {target.campaign_id}</div>
                        <div className="truncate max-w-[200px]" title={target.ad_group_id}>AdG: {target.ad_group_id}</div>
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100 dark:border-gray-800">
                        <select 
                          className={`text-xs font-bold rounded px-2 py-1.5 border-0 focus:ring-2 cursor-pointer shadow-sm ${
                            target.state === 'ENABLED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                          value={target.state}
                          onChange={(e) => handleSaveTargetBid(target.target_id, e.target.value)}
                        >
                          <option value="ENABLED">ENABLED</option>
                          <option value="PAUSED">PAUSED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {editingTargetId === target.target_id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-500 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.02"
                              className="w-20 px-2 py-1.5 text-sm border-2 border-indigo-500 rounded focus:ring-4 focus:ring-indigo-500/20 shadow-inner"
                              value={tempTargetBid}
                              onChange={(e) => setTempTargetBid(e.target.value)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveTargetBid(target.target_id)}
                              className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTargetId(null)}
                              className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 shadow-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3 group">
                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200">${target.bid?.toFixed(2) || '0.00'}</span>
                            <button
                              onClick={() => {
                                setEditingTargetId(target.target_id);
                                setTempTargetBid(target.bid?.toString() || "");
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-transparent hover:border-indigo-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {keywordTargets.length === 0 && !isTargetsLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <List className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                          No keywords found.
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          You don't have any active keywords or ASIN targets syncing.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mainTab === "CUSTOM_RULES" && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-orange-500" />
                  Visual If/Then Rule Builder
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                  Take complete control of your PPC automation. Create custom "If/Then" mathematical rules that run 24/7. When conditions are met, Insydz will execute the action automatically.
                </p>
              </div>
            </div>

            {/* Rule Builder Form */}
            <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-5 mb-8">
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Create New Rule</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newRule.rule_name}
                    onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                    placeholder="e.g. Bleeder Block"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-4 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <span className="text-xs font-bold text-gray-500 block mb-2">IF CONDITION</span>
                  <div className="flex items-center gap-2 text-sm">
                    ACOS &gt;
                    <input
                      type="number"
                      value={newRule.condition_acos_gt}
                      onChange={(e) => setNewRule({ ...newRule, condition_acos_gt: parseFloat(e.target.value) })}
                      className="w-16 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-900 text-center"
                    />
                    % AND Clicks &gt;
                    <input
                      type="number"
                      value={newRule.condition_clicks_gt}
                      onChange={(e) => setNewRule({ ...newRule, condition_clicks_gt: parseInt(e.target.value) })}
                      className="w-16 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-900 text-center"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <span className="text-xs font-bold text-gray-500 block mb-2">THEN ACTION</span>
                  <div className="flex items-center gap-2 text-sm">
                    <select
                      value={newRule.action_type}
                      onChange={(e) => setNewRule({ ...newRule, action_type: e.target.value })}
                      className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-900"
                    >
                      <option value="DECREASE_BID">Decrease Bid by</option>
                      <option value="INCREASE_BID">Increase Bid by</option>
                    </select>
                    <input
                      type="number"
                      value={newRule.action_value}
                      onChange={(e) => setNewRule({ ...newRule, action_value: parseFloat(e.target.value) })}
                      className="w-16 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-900 text-center"
                    />
                    %
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={handleCreateRule}
                    disabled={isCreatingRule}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {isCreatingRule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Rule
                  </button>
                </div>
              </div>
            </div>

            {/* List of Saved Rules */}
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Active Rules ({customRules.length})</h4>
            {customRules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">You haven't created any custom rules yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white mb-1">{rule.rule_name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        <span className="text-orange-600 dark:text-orange-400">IF</span> ACOS &gt; {rule.condition_acos_gt}% AND Clicks &gt; {rule.condition_clicks_gt} 
                        <span className="text-orange-600 dark:text-orange-400 mx-2">THEN</span> 
                        {rule.action_type === "DECREASE_BID" ? "Decrease Bid" : "Increase Bid"} by {rule.action_value}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
      )}
      </div>

      {/* ── Custom Target ACOS Slider Modal ────────────────────────────────────── */}
      {showAcosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                Custom Target ACOS
              </h3>
              <button
                onClick={() => setShowAcosModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Adjusting your Target ACOS dynamically updates bid optimization recommendations across all ad groups.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Target Profitability Ratio</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-lg">{targetAcos}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={targetAcos}
                onChange={(e) => setTargetAcos(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>10% (Conservative / High Margin)</span>
                <span>50% (Aggressive Launch)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAcosModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAcosModal(false);
                  fetchAllData(selectedProfileId);
                }}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all"
              >
                Apply Target ACOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hourly Ad Scheduling (Dayparting) Modal ── */}
      {showDaypartingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                24/7 Ad Scheduling (Dayparting)
              </h3>
              <button
                onClick={() => setShowDaypartingModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Select the specific hours you want your campaign to be <strong className="text-red-500">PAUSED</strong> to save budget during low-converting times. <br/>
              <span className="text-xs text-gray-500">(Green = Running, Red = Paused)</span>
            </p>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="flex mb-1">
                  <div className="w-24 shrink-0 text-xs font-bold text-gray-500">Day</div>
                  <div className="flex-1 flex gap-1">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="flex-1 text-[10px] text-center font-semibold text-gray-400">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid Rows */}
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                  <div key={day} className="flex mb-1 items-center">
                    <div className="w-24 shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{day}</div>
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 24 }).map((_, h) => {
                        const isPaused = (daypartingSchedule[day] || []).includes(h);
                        return (
                          <button
                            key={h}
                            onClick={() => {
                              setDaypartingSchedule(prev => {
                                const currentDayHours = prev[day] || [];
                                const newDayHours = isPaused 
                                  ? currentDayHours.filter(hour => hour !== h)
                                  : [...currentDayHours, h];
                                return { ...prev, [day]: newDayHours };
                              });
                            }}
                            className={`flex-1 h-8 rounded-sm border transition-colors ${
                              isPaused
                                ? "bg-red-100 border-red-300 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-800"
                                : "bg-emerald-400 border-emerald-500 hover:bg-emerald-300 dark:bg-emerald-600 dark:border-emerald-500"
                            }`}
                            title={`${day} at ${h}:00 - ${isPaused ? 'Paused' : 'Running'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl text-xs text-gray-600 dark:text-gray-300 mb-6 mt-4">
              <span><strong>Note:</strong> Times are relative to your Ad Profile's local timezone.</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDaypartingModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleDayparting(showDaypartingModal, daypartingSchedule);
                  setShowDaypartingModal(null);
                }}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md"
              >
                Apply 7x24 Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Disconnect Confirmation Modal ── */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Unplug className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Disconnect Amazon Account?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Insydz will immediately lose access to your Amazon Advertising account. Automated optimizations and data syncing will stop. <br/><br/>
                <strong>Note:</strong> Your Amazon campaigns will continue running normally on Amazon.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDisconnect}
                className="w-full px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Yes, Disconnect Account
              </button>
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="w-full px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 60-Day Visual Analytics Modal ── */}
      {analyticsTargetId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LineChartIcon className="w-6 h-6 text-indigo-500" />
                  Keyword Analytics: <span className="text-indigo-600 dark:text-indigo-400">{analyticsTargetName}</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">60-Day historical trend for Spend, Sales, and ACOS</p>
              </div>
              <button
                onClick={() => setAnalyticsTargetId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAnalyticsLoading ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : analyticsData.length === 0 ? (
              <div className="h-[350px] w-full flex flex-col items-center justify-center text-gray-400">
                <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                <p>No historical data available for this target yet.</p>
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickMargin={10} />
                    <YAxis yAxisId="left" stroke="#8B5CF6" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={12} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#E5E7EB' }}
                      formatter={(value: any, name: string) => [name === 'acos' ? `${value}%` : `₹${value}`, name.toUpperCase()]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Sales" />
                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Spend" />
                    <Line yAxisId="right" type="monotone" dataKey="acos" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" dot={false} name="ACOS %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ── Campaign Builder Modal ── */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-indigo-500" />
                  Campaign Preset Builder
                </h3>
                <p className="text-sm text-gray-500 mt-1">1-Click Multi-Stage Pipeline Creation</p>
              </div>
              <button
                onClick={() => { setIsBuilderOpen(false); setBuilderStep(1); setBuilderJobStatus(null); setBuilderJobId(null); setIsPollingJob(false); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input */}
            {builderStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Target ASIN / SKU</label>
                  <input
                    type="text"
                    value={builderSku}
                    onChange={(e) => setBuilderSku(e.target.value)}
                    onBlur={handleCheckSku}
                    placeholder="e.g., B08N5M7S6K"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>
                {showExistingWarning && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Existing Campaigns Found</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                          We detected {existingCampaigns.length} existing campaigns for this SKU. Creating new ones might cause keyword overlap.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Global Daily Budget (INR)</label>
                  <input
                    type="number"
                    value={builderBudget}
                    onChange={(e) => setBuilderBudget(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={handlePreviewBuilder} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">
                    Preview Generation
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {builderStep === 2 && builderPreview && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Pre-Flight Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Resource Blueprint</div>
                      <div className="text-sm font-medium">{builderPreview.campaigns_to_create} Campaigns + {builderPreview.ad_groups_to_create} Ad Groups</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pipeline Link</div>
                      <div className="text-sm font-medium text-green-600">Will Link Automatically</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Est. Daily Budget</div>
                      <div className="text-sm font-medium">₹{builderPreview.estimated_daily_spend}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Est. Monthly Spend</div>
                      <div className="text-sm font-medium text-amber-600">≈ ₹{builderPreview.estimated_monthly_spend}</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-between">
                  <button onClick={() => setBuilderStep(1)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    Back
                  </button>
                  <button onClick={handleLaunchBuilder} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Launch Background Job
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Progress & Result */}
            {builderStep === 3 && (
              <div className="space-y-6 text-center py-4">
                {(!builderJobStatus || builderJobStatus.status === "QUEUED" || builderJobStatus.status === "RUNNING") ? (
                  <>
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Building Campaign Bundle...</h3>
                    <p className="text-sm text-gray-500 mb-6">You can safely close this window. The job is running in the background.</p>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                      <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${builderJobStatus?.progress_percentage || 5}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{builderJobStatus?.current_step?.replace(/_/g, ' ') || 'Initializing...'}</span>
                      <span>{builderJobStatus?.completed_steps || 0} / {builderJobStatus?.total_steps || 4} Steps</span>
                    </div>

                    <div className="mt-6">
                      <button onClick={handleCancelJob} className="text-sm text-red-500 hover:text-red-600 underline">Cancel Job</button>
                    </div>
                  </>
                ) : builderJobStatus.status === "COMPLETED" ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bundle Successfully Launched!</h3>
                    <p className="text-sm text-gray-500 mt-2">All campaigns created and wired into a promotion pipeline.</p>
                    <div className="mt-6">
                      <button onClick={() => { setIsBuilderOpen(false); setBuilderStep(1); }} className="px-6 py-2 bg-gray-900 text-white rounded-lg">Close Dashboard</button>
                    </div>
                  </>
                ) : builderJobStatus.status === "FAILED" ? (
                  <>
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-600">Job Failed</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      Error: {builderJobStatus.error_message}
                    </p>
                    <div className="mt-6 flex flex-col gap-3">
                      <button onClick={() => handleResolveJob("RETRY")} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg">Retry Current Step</button>
                      <button onClick={() => handleResolveJob("ARCHIVE")} className="px-6 py-2 bg-red-100 text-red-700 font-bold rounded-lg">Rollback & Archive Campaigns</button>
                      <button onClick={() => handleResolveJob("KEEP")} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Accept Orphaned State</button>
                    </div>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Job {builderJobStatus.status}</h3>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
