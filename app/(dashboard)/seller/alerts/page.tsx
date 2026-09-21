"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Menu, ShieldAlert, ShieldCheck, ShieldOff, Crown,
  Loader2, AlertTriangle, CheckCircle2, Settings2,
  Plus, Trash2, RefreshCw, Bell, BellOff, ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Types ─────────────────────────────────────────────────────────────────────
interface HijackerAlert {
  id: number;
  asin: string;
  alert_type: "NEW_HIJACKER" | "LOST_BUY_BOX";
  hijacker_seller_name: string | null;
  hijacker_price: number | null;
  your_price: number | null;
  price_difference: number | null;
  is_resolved: boolean;
  detected_at: string;
}

interface AlertSummary {
  active_threats: number;
  buy_box_lost: number;
  asins_protected: number;
}

interface HijackerSettings {
  hijacker_email_alerts_enabled: boolean;
  hijacker_min_price_diff: number;
  hijacker_alert_type_filter: "NEW_HIJACKER" | "LOST_BUY_BOX" | "BOTH";
  asin_limit: number | null;
  monitored_asin_count: number;
}

interface MonitoredASIN {
  asin: string;
  added_at: string;
}

// ── Helper: Format time ago ───────────────────────────────────────────────────
function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HijackerAlertsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const { toggle } = useSidebar();

  const [mounted, setMounted] = useState(false);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  // Store selector
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedSpId, setSelectedSpId] = useState<string>("");

  // Alerts data
  const [summary, setSummary] = useState<AlertSummary>({ active_threats: 0, buy_box_lost: 0, asins_protected: 0 });
  const [alerts, setAlerts] = useState<HijackerAlert[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Settings panel
  const [settings, setSettingsState] = useState<HijackerSettings>({
    hijacker_email_alerts_enabled: false,
    hijacker_min_price_diff: 0,
    hijacker_alert_type_filter: "BOTH",
    asin_limit: 20,
    monitored_asin_count: 0,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ASIN Watchlist
  const [monitoredAsins, setMonitoredAsins] = useState<MonitoredASIN[]>([]);
  const [newAsin, setNewAsin] = useState("");
  const [addingAsin, setAddingAsin] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  const isDark = resolvedTheme === "dark";

  // ── Fetch all accounts ──────────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setSelectedSpId(data.accounts[0].selling_partner_id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  // ── Fetch alerts + settings for selected store ──────────────────────────────
  const fetchData = useCallback(async (spId: string) => {
    setLoading(true);
    setIsPremiumRequired(false);
    try {
      const [alertsRes, settingsRes, asinsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/amazon-sp-api/hijacker/${spId}/alerts?show_resolved=${showResolved}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/amazon-sp-api/hijacker/${spId}/settings`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/amazon-sp-api/hijacker/${spId}/monitored-asins`, { credentials: "include" }),
      ]);

      if (alertsRes.status === 403 || settingsRes.status === 403) {
        setIsPremiumRequired(true);
        return;
      }

      if (alertsRes.ok) {
        const d = await alertsRes.json();
        setAlerts(d.alerts || []);
        setSummary(d.summary || { active_threats: 0, buy_box_lost: 0, asins_protected: 0 });
      }
      if (settingsRes.ok) {
        setSettingsState(await settingsRes.json());
      }
      if (asinsRes.ok) {
        const d = await asinsRes.json();
        setMonitoredAsins(d.asins || []);
      }
    } catch {
      toast({ title: "Could not load protection data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [showResolved, toast]);

  useEffect(() => { setMounted(true); fetchAccounts(); }, [fetchAccounts]);
  useEffect(() => { if (selectedSpId) fetchData(selectedSpId); }, [selectedSpId, fetchData]);

  // ── Resolve alert ───────────────────────────────────────────────────────────
  const handleResolve = async (alertId: number) => {
    setResolvingId(alertId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/amazon-sp-api/hijacker/${selectedSpId}/alerts/${alertId}/resolve`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        toast({ title: "✅ Threat marked as handled" });
        fetchData(selectedSpId);
      } else {
        toast({ title: "Could not resolve alert", variant: "destructive" });
      }
    } finally {
      setResolvingId(null);
    }
  };

  // ── Save settings ───────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/amazon-sp-api/hijacker/${selectedSpId}/settings`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hijacker_email_alerts_enabled: settings.hijacker_email_alerts_enabled,
            hijacker_min_price_diff: settings.hijacker_min_price_diff,
            hijacker_alert_type_filter: settings.hijacker_alert_type_filter,
          }),
        }
      );
      if (res.ok) {
        toast({ title: "✅ Protection settings saved" });
        setSettingsOpen(false);
      } else {
        toast({ title: "Could not save settings", variant: "destructive" });
      }
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Add ASIN to watchlist ───────────────────────────────────────────────────
  const handleAddAsin = async () => {
    if (!newAsin || newAsin.length !== 10) {
      toast({ title: "Please enter a valid 10-character ASIN", variant: "destructive" });
      return;
    }
    setAddingAsin(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/amazon-sp-api/hijacker/${selectedSpId}/monitored-asins`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asin: newAsin.toUpperCase() }),
        }
      );
      if (res.ok) {
        toast({ title: `✅ ${newAsin.toUpperCase()} is now being protected` });
        setNewAsin("");
        fetchData(selectedSpId);
      } else {
        const err = await res.json();
        if (err.detail?.includes("upgrade_required")) {
          toast({
            title: "Protection Limit Reached",
            description: "You can protect up to 20 products on your current plan. Upgrade to Enterprise for unlimited protection.",
            variant: "destructive",
          });
        } else if (err.detail?.includes("already")) {
          toast({ title: "This product is already being monitored", variant: "destructive" });
        } else {
          toast({ title: "Could not add product", variant: "destructive" });
        }
      }
    } finally {
      setAddingAsin(false);
    }
  };

  // ── Remove ASIN from watchlist ──────────────────────────────────────────────
  const handleRemoveAsin = async (asin: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/amazon-sp-api/hijacker/${selectedSpId}/monitored-asins/${asin}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        toast({ title: `${asin} removed from protection list` });
        fetchData(selectedSpId);
      }
    } catch {
      toast({ title: "Could not remove product", variant: "destructive" });
    }
  };

  if (!mounted) return null;

  const slotsUsed = monitoredAsins.length;
  const asinLimit = settings.asin_limit;
  const slotsRemaining = asinLimit !== null ? asinLimit - slotsUsed : null;
  const atLimit = asinLimit !== null && slotsUsed >= asinLimit;

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12 px-4 md:px-6">
      {/* ── Page Header ── */}
      <header className={`bg-transparent border-b pb-4 mt-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-rose-900/50 to-orange-900/50' : 'bg-gradient-to-br from-rose-100 to-orange-100'}`}>
            <ShieldAlert className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Listing Protection</h1>
            <p className="page-subtitle">Real-time alerts when someone tries to steal your Buy Box or hijack your listing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Store Selector */}
          {accounts.length > 0 && (
            <Select value={selectedSpId} onValueChange={setSelectedSpId}>
              <SelectTrigger className={`w-[200px] border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.selling_partner_id} value={acc.selling_partner_id}>
                    Store: {acc.selling_partner_id.slice(-6)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Action Buttons (Only visible if store connected and premium) */}
          {accounts.length > 0 && !isPremiumRequired && (
            <>
              {/* Settings Dialog */}
              <Dialog 
                open={settingsOpen} 
                onOpenChange={(open) => {
                  if (!open) {
                    // If closing without saving, re-fetch to discard unsaved changes
                    fetchData(selectedSpId);
                  }
                  setSettingsOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Alert Settings</DialogTitle>
                    <DialogDescription>
                      Customise how and when you receive protection alerts for this store.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-5 py-2">
                    {/* Email Alerts Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Email Alerts</p>
                        <p className="text-xs text-muted-foreground">Get an email the moment a threat is detected</p>
                      </div>
                      <Switch
                        checked={settings.hijacker_email_alerts_enabled}
                        onCheckedChange={(v) => setSettingsState((s) => ({ ...s, hijacker_email_alerts_enabled: v }))}
                      />
                    </div>

                    {/* Minimum Price Difference */}
                    <div className="flex flex-col gap-1.5">
                      <p className="font-medium text-sm">Minimum Price Difference (₹)</p>
                      <p className="text-xs text-muted-foreground">
                        Only alert me if the competitor's price is at least this much cheaper than mine.
                        Set to 0 to alert on any price.
                      </p>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={settings.hijacker_min_price_diff}
                        onChange={(e) =>
                          setSettingsState((s) => ({
                            ...s,
                            hijacker_min_price_diff: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="e.g. 20"
                      />
                    </div>

                    {/* Alert Type Filter */}
                    <div className="flex flex-col gap-1.5">
                      <p className="font-medium text-sm">Alert me about</p>
                      <Select
                        value={settings.hijacker_alert_type_filter}
                        onValueChange={(v: any) => setSettingsState((s) => ({ ...s, hijacker_alert_type_filter: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BOTH">Everything — intruders AND buy box losses</SelectItem>
                          <SelectItem value="NEW_HIJACKER">Only new intruders on my listing</SelectItem>
                          <SelectItem value="LOST_BUY_BOX">Only when I lose the Buy Box</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveSettings} disabled={savingSettings}>
                      {savingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Refresh */}
              <Button variant="outline" size="icon" onClick={() => fetchData(selectedSpId)} disabled={loading} className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </>
          )}
        </div>

      </header>

      {/* ── No store connected ── */}
      {!loading && accounts.length === 0 ? (
        <Card className={`mt-2 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <ShieldOff className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              To start protecting your listings, connect your Amazon Seller account from the Store Setup page.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full">
              Connect Seller Account
            </Button>
          </CardContent>
        </Card>
      ) : isPremiumRequired ? (
        /* ── Paywall ── */
        <Card className={`mt-2 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-900/50' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100'}`}>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
              <Crown className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Premium Feature Locked</h2>
            <p className="text-muted-foreground max-w-lg mb-8 text-lg">
              While you sleep, competitors can hijack your listings and steal your "Add to Cart" button.
              Our 24/7 protection system catches them within minutes and alerts you immediately.
              Available on Premium and Enterprise plans.
            </p>
            <Button onClick={() => window.location.href = '/subscription'} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Upgrade to Protect My Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-full bg-red-500/10">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.active_threats}</p>
              <p className="text-sm text-muted-foreground">Active Threats</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-full bg-amber-500/10">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.buy_box_lost}</p>
              <p className="text-sm text-muted-foreground">Buy Box Lost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-full bg-green-500/10">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.asins_protected}</p>
              <p className="text-sm text-muted-foreground">Products Protected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ASIN Watchlist Card ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Products Under Protection</CardTitle>
            <CardDescription>
              {asinLimit !== null
                ? `${slotsUsed} of ${asinLimit} product slots used`
                : `${slotsUsed} products protected (unlimited)`}
            </CardDescription>
          </div>
          <Dialog open={watchlistOpen} onOpenChange={setWatchlistOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a Product to Your Protection List</DialogTitle>
                <DialogDescription>
                  Enter the ASIN of the product you want to monitor. You can find the ASIN on the
                  product detail page on Amazon, in the "Product Information" section.
                  {asinLimit !== null && (
                    <span className="block mt-1 font-medium">
                      {slotsRemaining} of {asinLimit} slots remaining.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. B08XYZ12345"
                  value={newAsin}
                  onChange={(e) => setNewAsin(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="font-mono"
                />
                <Button onClick={handleAddAsin} disabled={addingAsin || atLimit}>
                  {addingAsin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Protect"}
                </Button>
              </div>
              {atLimit && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  You have reached the 20-product limit on your current plan.
                  Upgrade to Enterprise to protect unlimited products.
                </p>
              )}

              {/* Current watchlist */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2">
                {monitoredAsins.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products added yet. Add your first product above.
                  </p>
                ) : (
                  monitoredAsins.map((item) => (
                    <div
                      key={item.asin}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border bg-muted/30"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">{item.asin}</p>
                        <p className="text-xs text-muted-foreground">Added {timeAgo(item.added_at)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRemoveAsin(item.asin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        {/* Slot usage bar */}
        {asinLimit !== null && (
          <CardContent className="pt-0">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${atLimit ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(100, (slotsUsed / asinLimit) * 100)}%` }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── Alerts Table ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Threat Activity Log</CardTitle>
            <CardDescription>
              Every time an intruder appears or you lose the Buy Box, it appears here instantly.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Show handled</span>
            <Switch
              checked={showResolved}
              onCheckedChange={(v) => { setShowResolved(v); fetchData(selectedSpId); }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShieldCheck className="w-10 h-10 text-green-500" />
              <p className="font-semibold text-lg">All Clear!</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                No threats detected on your protected products. We are watching 24/7.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product (ASIN)</TableHead>
                  <TableHead>Type of Threat</TableHead>
                  <TableHead>Intruder's Price</TableHead>
                  <TableHead>Your Price</TableHead>
                  <TableHead>Price Gap</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className={alert.is_resolved ? "opacity-50" : ""}>
                    <TableCell className="font-mono text-sm font-medium">{alert.asin}</TableCell>
                    <TableCell>
                      {alert.alert_type === "NEW_HIJACKER" ? (
                        <Badge variant="destructive" className="gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          Intruder on Listing
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                          <AlertTriangle className="h-3 w-3" />
                          Buy Box Stolen
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-red-500 font-semibold">
                      {alert.hijacker_price !== null ? `₹${alert.hijacker_price.toLocaleString("en-IN")}` : "—"}
                    </TableCell>
                    <TableCell>
                      {alert.your_price !== null ? `₹${alert.your_price.toLocaleString("en-IN")}` : "—"}
                    </TableCell>
                    <TableCell>
                      {alert.price_difference !== null ? (
                        <span className={alert.price_difference > 0 ? "text-amber-500 font-medium" : "text-green-500 font-medium"}>
                          ₹{Math.abs(alert.price_difference).toLocaleString("en-IN")}
                          {alert.price_difference > 0 ? " cheaper" : " higher"}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {timeAgo(alert.detected_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {alert.is_resolved ? (
                        <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          Handled
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolvingId === alert.id}
                          className="gap-1.5"
                        >
                          {resolvingId === alert.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Mark as Handled
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
}
