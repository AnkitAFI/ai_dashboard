"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SmartSearchInput from "@/components/ui/smart-search-input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, X, Search, ShoppingBag, MapPin, Compass, ArrowUpRight, HelpCircle, Plus, Sparkles, BarChart3, Info, Crown, Lock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ── Schemas & Interfaces ──────────────────────────────────────────────────────

interface ExplorerSerpItem {
  position: number;
  title: string;
  brand: string | null;
  price: number | null;
  rating: number | null;
  reviews: number | null;
  sales_volume: number | null;
  asin_or_pid: string;
}

interface ExplorerVariationItem {
  keyword: string;
  search_volume: number;
  difficulty: number;
  intent: string;
  cpc: number;
}

interface KeywordExplorerResponse {
  keyword: string;
  platform: string;
  search_volume: number;
  difficulty: number;
  intent: string;
  cpc: number;
  estimated_impressions: number;
  estimated_clicks: number;
  geo_distribution: Record<string, number>;
  variations: ExplorerVariationItem[];
  serp: ExplorerSerpItem[];
  cached_at: string;
  trend: number[];
  global_search_volume: number;
  global_breakdown: Record<string, number>;
  competitive_density: number;
  serp_features: string[];
}

interface TrackedProduct {
  asin_or_pid: string;
  platform: string;
}

interface KeywordExplorerProps {
  showToast: (title: string, description: string, variant?: "success" | "error") => void;
  trackedProducts: TrackedProduct[];
  onKeywordAdded: () => void;
  userTier?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DifficultyGauge({ value }: { value: number }) {
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let strokeColor = "stroke-green-500";
  let bgClass = "bg-green-50 text-green-700 border-green-200";
  let label = "Easy";
  let desc = "Low organic barrier. Highly actionable to rank on page 1.";

  if (value >= 60) {
    strokeColor = "stroke-rose-500";
    bgClass = "bg-rose-50 text-rose-700 border-rose-200";
    label = "Hard";
    desc = "High brand concentration. Needs significant reviews to compete.";
  } else if (value >= 30) {
    strokeColor = "stroke-amber-500";
    bgClass = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Medium";
    desc = "Moderate listings authority. Possible with solid optimizations.";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`transition-all duration-700 ease-out ${strokeColor}`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-sm font-extrabold text-slate-800">{value}%</span>
      </div>
      <div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${bgClass}`}>
          {label}
        </span>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  let label = "Researching (Informational)";
  let desc = "Buyer is seeking product details, specs, or guides.";

  if (intent === "Transactional") {
    badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
    label = "Ready to Buy (Transactional)";
    desc = "Highest purchase intent. Buyer is looking to buy immediately.";
  } else if (intent === "Commercial") {
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Comparing Brands (Commercial)";
    desc = "Buyer is comparing prices, reviews, and features.";
  }

  return (
    <div>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}`}>
        {label}
      </span>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

// ── Quick Track Modal ─────────────────────────────────────────────────────────

function QuickTrackModal({
  keyword,
  platform,
  trackedProducts,
  onClose,
  showToast,
  onKeywordAdded,
}: {
  keyword: string;
  platform: string;
  trackedProducts: TrackedProduct[];
  onClose: () => void;
  showToast: (title: string, description: string, variant?: "success" | "error") => void;
  onKeywordAdded: () => void;
}) {
  const [useExisting, setUseExisting] = useState(trackedProducts.length > 0);
  const [pidInput, setPidInput] = useState("");
  const [selectedPid, setSelectedPid] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories?table=${platform}`)
      .then((r) => r.json())
      .then((d) => setCategories(d.map((c: any) => c.category)))
      .catch(() => setCategories([]));
  }, [platform]);

  // Set default selection if any existing
  useEffect(() => {
    const matched = trackedProducts.filter((p) => p.platform === platform);
    if (matched.length > 0) {
      setSelectedPid(matched[0].asin_or_pid);
    }
  }, [trackedProducts, platform]);

  const handleTrack = async () => {
    const finalPid = useExisting ? selectedPid : pidInput.trim();
    if (!finalPid) {
      showToast("Required Field", "Please enter or select a product ID / ASIN.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/keyword-tracker/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: keyword,
          asin_or_pid: finalPid,
          platform: platform,
          category: category || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Success", `Now tracking keyword "${keyword}" for ${finalPid}`);
        onKeywordAdded();
        onClose();
      } else {
        showToast("Error", data.detail?.message ?? "Failed to track keyword", "error");
      }
    } catch {
      showToast("Network Error", "Unable to connect to service.", "error");
    } finally {
      setLoading(false);
    }
  };

  const platformMatchedProducts = trackedProducts.filter((p) => p.platform === platform);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          data-track-id="close_track_modal_btn"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          Track Keyword
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Add <strong className="text-slate-700">"{keyword}"</strong> on {platform === "amazon" ? "Amazon" : "Flipkart"} to your dashboard rankings.
        </p>

        <div className="space-y-4">
          {platformMatchedProducts.length > 0 && (
            <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={useExisting}
                  onChange={() => setUseExisting(true)}
                  className="accent-purple-600"
                  data-track-id="use_existing_product_radio"
                />
                Use Tracked Product
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  checked={!useExisting}
                  onChange={() => setUseExisting(false)}
                  className="accent-purple-600"
                  data-track-id="track_new_product_radio"
                />
                Track New ASIN/PID
              </label>
            </div>
          )}

          {useExisting && platformMatchedProducts.length > 0 ? (
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={selectedPid} onValueChange={setSelectedPid}>
                <SelectTrigger data-track-id="track_selected_product_select" data-filter-value={selectedPid}>
                  <SelectValue placeholder="Choose target product" />
                </SelectTrigger>
                <SelectContent>
                  {platformMatchedProducts.map((p) => (
                    <SelectItem key={p.asin_or_pid} value={p.asin_or_pid}>
                      {p.asin_or_pid} ({platform === "amazon" ? "Amazon" : "Flipkart"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>ASIN / Product ID</Label>
              <Input
                value={pidInput}
                onChange={(e) => setPidInput(e.target.value)}
                placeholder={platform === "amazon" ? "e.g., B08XYZ" : "e.g., ITMABCDEF"}
                data-track-id="track_pid_input"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-track-id="track_category_select" data-filter-value={category}>
                <SelectValue placeholder={categories.length === 0 ? "No categories" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading} data-track-id="track_rank_cancel_btn">
              Cancel
            </Button>
            <Button onClick={handleTrack} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={loading} data-track-id="track_rank_submit_btn">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Track Rank"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KeywordExplorer({
  showToast,
  trackedProducts,
  onKeywordAdded,
  userTier = "free",
}: KeywordExplorerProps) {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordExplorerResponse | null>(null);

  // Quick track modal state
  const [trackTarget, setTrackTarget] = useState<string | null>(null);

  // AI Strategy Advisor states
  const [strategyText, setStrategyText] = useState<string>("");
  const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string>("");

  // Show all states UI toggle
  const [showAllStates, setShowAllStates] = useState<boolean>(false);

  // Calculate regional breakdown dynamically
  const calculateRegions = () => {
    if (!data || !data.geo_distribution) return [];
    const zones = [
      {
        name: "South India",
        states: [
          "Tamil Nadu",
          "Karnataka",
          "Telangana",
          "Andhra Pradesh",
          "Kerala",
          "Puducherry",
          "Lakshadweep",
          "Andaman and Nicobar Islands"
        ]
      },
      {
        name: "North India",
        states: [
          "Delhi",
          "Uttar Pradesh",
          "Punjab",
          "Haryana",
          "Rajasthan",
          "Uttarakhand",
          "Himachal Pradesh",
          "Jammu and Kashmir",
          "Ladakh",
          "Chandigarh"
        ]
      },
      {
        name: "West India",
        states: [
          "Maharashtra",
          "Gujarat",
          "Goa",
          "Madhya Pradesh",
          "Chhattisgarh",
          "Dadra and Nagar Haveli and Daman and Diu"
        ]
      },
      {
        name: "East India",
        states: [
          "West Bengal",
          "Bihar",
          "Odisha",
          "Jharkhand",
          "Assam",
          "Sikkim",
          "Arunachal Pradesh",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Tripura"
        ]
      }
    ];

    const regions = zones.map((zone) => {
      let pctSum = 0;
      zone.states.forEach((state) => {
        pctSum += data.geo_distribution[state] || 0;
      });
      const volume = Math.round((data.search_volume * pctSum) / 100);
      return {
        name: zone.name,
        percentage: Math.round(pctSum * 10) / 10,
        volume,
      };
    });

    return regions.sort((a, b) => b.volume - a.volume);
  };

  const regionalBreakdown = calculateRegions();

  const fetchStrategy = async (searchVal: string, targetPlatform: string) => {
    setStrategyLoading(true);
    setStrategyError("");
    setStrategyText("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/keyword-tracker/explorer/strategy?keyword=${encodeURIComponent(
          searchVal
        )}&platform=${targetPlatform}`,
        { credentials: "include" }
      );
      const resJson = await res.json();
      if (res.ok) {
        setStrategyText(resJson.strategy || "");
      } else {
        setStrategyError(resJson.detail?.message ?? "Error generating strategy");
      }
    } catch (err) {
      setStrategyError("Network error. Unable to load strategy.");
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleSearch = async (overrideKeyword?: string) => {
    const searchVal = (overrideKeyword || keyword || "wireless headphones").trim();
    if (!searchVal) {
      showToast("Error", "Please enter a search query.", "error");
      return;
    }

    setLoading(true);
    setShowAllStates(false);
    setStrategyText("");
    setStrategyError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/keyword-tracker/explorer?keyword=${encodeURIComponent(
          searchVal
        )}&platform=${platform}`,
        { credentials: "include" }
      );
      const resJson = await res.json();
      if (res.ok) {
        setData(resJson);
        if (overrideKeyword) setKeyword(overrideKeyword);
        fetchStrategy(searchVal, platform);
      } else {
        showToast("Search failed", resJson.detail?.message ?? "Error exploring keyword", "error");
      }
    } catch (err) {
      showToast("Network Error", "Could not query details from server.", "error");
    } finally {
      setLoading(false);
    }
  };



  // Trigger search on platform change only if there is an active search query
  useEffect(() => {
    if (keyword.trim()) {
      handleSearch();
    }
  }, [platform]);

  const handleQuickTrack = (kw: string) => {
    setTrackTarget(kw);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-background opacity-100 relative">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Search Keyword</Label>
              <SmartSearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Analyze products, volume, & KD (e.g. bluetooth speakers, face serum)"
                inputClassName="h-11 border-slate-200 focus-visible:ring-purple-600 rounded-xl"
                dictionary={[
                  "bluetooth speakers", "wireless earbuds", "face serum", "water bottle",
                  "desk organizer", "phone stand", "laptop stand", "keyboard", "mouse pad",
                  "yoga mat", "resistance bands", "protein shaker", "air purifier",
                  "led lights", "smart watch", "fitness tracker", "neck pillow",
                  "electric toothbrush", "hair dryer", "trimmer", "sunscreen",
                  "moisturizer", "lip balm", "perfume", "body lotion", "shampoo",
                  "coffee mug", "lunch box", "water purifier", "mixer grinder",
                  "pressure cooker", "non stick pan", "bed sheets", "curtains",
                  "cushion cover", "bath towel", "storage box", "shoe rack",
                  "baby diapers", "baby wipes", "toys", "board games",
                  "running shoes", "casual shoes", "sandals", "backpack",
                  ...(data?.variations?.map((v: any) => v.keyword) ?? []),
                ]}
                maxSuggestions={6}
                onEnter={() => handleSearch()}
                id="keyword-search-input"
              />
            </div>
            <div className="w-full md:w-44 space-y-2">
              <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Marketplace</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl" data-track-id="marketplace-select" data-filter-value={platform}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-orange-600" /> Amazon India
                    </div>
                  </SelectItem>
                  <SelectItem value="flipkart">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-yellow-600" /> Flipkart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full md:w-36 h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex gap-2 items-center justify-center transition-all"
              onClick={() => handleSearch()}
              disabled={loading}
              data-track-id="analyze-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Compass className="h-4.5 w-4.5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {loading && (
        <Card className="border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm animate-pulse rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <div>
              <h4 className="font-bold text-purple-950">
                Retrieving Marketplace Intel
              </h4>
              <p className="text-xs text-purple-700 mt-1 max-w-md">
                We are scanning local search index data, calculating product demand, classifying search intentions, and compiling search recommendations. This process operates 100% free of charge.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State Banner */}
      {!data && !loading && (
        <Card className="border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Compass className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Keyword Explorer</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1.5 mx-auto">
                Type in any search term above (e.g., "face serum", "water bottle") and click **Analyze** to retrieve search volumes, buyer intent, regional demand, competitor SERPs, and local AI advice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Panels */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">

          {/* Key Metrics Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Search Volume */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Monthly Volume
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  {data.search_volume.toLocaleString("en-IN")}
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Monthly searches by buyers. Higher means more potential customers.
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-100 mt-2">
                <div className="flex justify-between">
                  <span>Est. Impressions (Views):</span>
                  <span className="font-semibold text-slate-600">{data.estimated_impressions.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Clicks (Visits):</span>
                  <span className="font-semibold text-slate-600">{data.estimated_clicks.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Difficulty */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  KD%
                  <Info className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Competition level to rank. Lower is easier to reach Page 1.
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                <DifficultyGauge value={data.difficulty} />
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Regional Breakdown
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  India
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Estimated search volume by Indian region.
                </p>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 mt-2 space-y-1 text-xs">
                {regionalBreakdown.length > 0 ? (
                  regionalBreakdown.map((region) => (
                    <div key={region.name} className="flex justify-between text-slate-600">
                      <span className="truncate">{region.name}</span>
                      <span className="font-bold text-slate-700">
                        {region.volume.toLocaleString("en-IN")} ({region.percentage}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">No regional data.</div>
                )}
              </CardContent>
            </Card>

            {/* Competitive Density */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Competitive Density
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </CardDescription>
                <CardTitle className="text-3xl font-extrabold text-slate-800">
                  {data.competitive_density !== undefined ? data.competitive_density.toFixed(2) : "0.00"}
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  PPC competition index from 0.00 to 1.00.
                </p>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 mt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>PPC Competition</span>
                    <span>
                      {data.competitive_density >= 0.80 ? "High" : data.competitive_density >= 0.50 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${data.competitive_density >= 0.80 ? "bg-rose-500" : data.competitive_density >= 0.50 ? "bg-amber-500" : "bg-green-500"
                        }`}
                      style={{ width: `${(data.competitive_density || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intent & CPC */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
                  Mindset & Ad Cost
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </CardDescription>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                  Buyer intent and estimated sponsor cost.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <IntentBadge intent={data.intent} />
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Est. CPC:</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-700">₹{data.cpc.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend & Geo Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Search Trend Chart */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl p-6 bg-white lg:col-span-3">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
                  12-Month Search Volume Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Historical search volume distribution over the past year.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    (data.trend || []).map((vol, idx) => {
                      const monthNames = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
                      return {
                        month: monthNames[idx % 12],
                        Volume: vol
                      };
                    })
                  } margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#94a3b8" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      stroke="#94a3b8"
                      width={45}
                      tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                    />
                    <Tooltip
                      contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                      labelClassName="font-bold text-slate-700"
                    />
                    <Bar dataKey="Volume" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geo breakdown list */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl lg:col-span-2 relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-rose-500" />
                  State-wise Interest Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimated percentage demand distribution across top Indian commerce hubs.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative min-h-[220px]">
                <div className={showAllStates ? "max-h-[280px] overflow-y-auto pr-2 space-y-3" : "space-y-3"}>
                  {Object.entries(data.geo_distribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, showAllStates ? undefined : 8)
                    .map(([state, pct]) => (
                      <div key={state} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{state}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
                <div className="pt-3 text-center border-t border-slate-100 mt-3">
                  <button
                    onClick={() => setShowAllStates(!showAllStates)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none inline-flex items-center gap-1.5"
                    data-track-id="toggle-states-distribution-btn"
                    data-filter-value={showAllStates ? "show_all" : "show_top_8"}
                  >
                    {showAllStates ? "Show Top 8 States" : "Show All 36 States & UTs"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Keyword variations table */}
            <Card className="shadow-xs border border-slate-200 rounded-2xl lg:col-span-5">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-indigo-500" />
                  Related Keyword Variations
                </CardTitle>
                <CardDescription className="text-xs">
                  Autocomplete keywords matching your search prefix.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                        <th className="p-3">Keyword</th>
                        <th className="p-3 text-right">Vol</th>
                        <th className="p-3 text-center">KD%</th>
                        <th className="p-3 text-center">Intent</th>
                        <th className="p-3 text-right">CPC</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data.variations.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-medium text-slate-800">
                            <button
                              onClick={() => handleSearch(v.keyword)}
                              disabled={loading}
                              className="hover:underline text-purple-700 text-left disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                              data-track-id="related_keyword_variation_btn"
                            >
                              {v.keyword}
                            </button>
                          </td>
                          <td className="p-3 text-right font-semibold">{v.search_volume.toLocaleString("en-IN")}</td>
                          <td className="p-3 text-center font-medium">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${v.difficulty >= 60
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : v.difficulty >= 30
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-green-50 text-green-600 border border-green-100"
                                }`}
                            >
                              {v.difficulty}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${v.intent === "Transactional"
                                  ? "bg-purple-100 text-purple-700"
                                  : v.intent === "Commercial"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {v.intent.charAt(0)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">₹{v.cpc.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleQuickTrack(v.keyword)}
                              disabled={loading}
                              className="p-1 hover:bg-purple-100 text-purple-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Add to Rank Tracker"
                              data-track-id="quick_track_keyword_btn"
                              data-filter-value={v.keyword}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SERP Features Badges */}
          {data.serp_features && data.serp_features.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SERP Features:</span>
              {data.serp_features.map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-150 text-[10px] font-semibold">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {/* SERP Analysis top 10 products */}
          <Card className="shadow-xs border border-slate-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-orange-500" />
                SERP Analysis (Top 10 Results)
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time snapshot of the highest performing database listings for this search term.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="p-3 text-center w-12">Pos</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-center">Rating</th>
                      <th className="p-3 text-right">Reviews</th>
                      <th className="p-3 text-right">Monthly Sales</th>
                      <th className="p-3 w-28">ASIN/PID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.serp.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No matching items cataloged in the database.
                        </td>
                      </tr>
                    ) : (
                      data.serp.map((item) => (
                        <tr key={item.position} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-500">{item.position}</td>
                          <td className="p-3 max-w-sm font-medium text-slate-800 truncate" title={item.title}>
                            {item.title}
                          </td>
                          <td className="p-3 text-slate-500 font-medium">
                            {(() => {
                              const brandVal = item.brand;
                              if (brandVal && brandVal !== "None" && brandVal !== "—" && brandVal.trim() !== "") {
                                return brandVal;
                              }
                              if (item.title) {
                                const words = item.title.trim().split(/\s+/);
                                if (words.length > 0) {
                                  const firstWord = words[0].replace(/^\W+|\W+$/g, "");
                                  if (firstWord) return firstWord;
                                }
                              }
                              return "—";
                            })()}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {item.price ? `₹${item.price.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="p-3 text-center font-bold text-amber-600">
                            {item.rating ? `${item.rating}★` : "—"}
                          </td>
                          <td className="p-3 text-right font-medium text-slate-600">
                            {item.reviews ? item.reviews.toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="p-3 text-right font-bold text-indigo-600">
                            {item.sales_volume ? item.sales_volume.toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[10px] select-all">
                            {item.asin_or_pid}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Copywriting & PPC Bidding Strategy Card */}
          <Card className="shadow-xs border border-slate-200 rounded-2xl overflow-hidden relative">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-purple-600 animate-pulse" />
                AI Copywriting & PPC Bidding Strategy
              </CardTitle>
              <CardDescription className="text-xs">
                Local AI-generated strategy recommendations based on keyword intent, volume, and difficulty.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 min-h-[200px] relative">
              {strategyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <p className="text-xs text-slate-500 font-medium">Generating copywriting & PPC strategy</p>
                </div>
              ) : strategyError ? (
                <div className="text-xs text-rose-600 p-4 border border-rose-100 rounded-lg bg-rose-50/50">
                  Failed to generate AI strategy: {strategyError}
                </div>
              ) : strategyText ? (
                <div
                  className="prose prose-sm max-w-none text-xs text-slate-600 space-y-4"
                  dangerouslySetInnerHTML={{ __html: strategyText }}
                />
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">
                  Analyze a keyword to generate copywriting & advertising strategy advice from your local LLM.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cache footer indicator */}
          <div className="text-right text-[10px] text-slate-400 font-mono">
            Analysis Cache Created: {new Date(data.cached_at).toLocaleString("en-IN")}
          </div>
        </div>
      )}

      {/* Quick Track popup overlay */}
      {trackTarget && (
        <QuickTrackModal
          keyword={trackTarget}
          platform={platform}
          trackedProducts={trackedProducts}
          onClose={() => setTrackTarget(null)}
          showToast={showToast}
          onKeywordAdded={onKeywordAdded}
        />
      )}
    </div>
  );
}
