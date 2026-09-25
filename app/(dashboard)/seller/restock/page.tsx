"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Menu, Package, AlertTriangle, Loader2, Crown, Search, Filter, Settings, CheckCircle2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import SyncPendingBanner from "@/components/seller/sync-pending-banner";

export default function RestockForecasterDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, resolvedTheme } = useTheme();
  const { toggle } = useSidebar();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedSpId, setSelectedSpId] = useState<string>("");
  const [accountStatus, setAccountStatus] = useState<string>("");
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, OOS, CRITICAL
  
  // Bulk update states
  const [bulkLeadTime, setBulkLeadTime] = useState(30);
  const [bulkTransitTime, setBulkTransitTime] = useState(5);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  // State Sales (Demographics) Modal
  const [isStateSalesOpen, setIsStateSalesOpen] = useState(false);
  const [selectedAsinForStates, setSelectedAsinForStates] = useState<string | null>(null);
  const [stateSalesData, setStateSalesData] = useState<any[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  
  const openStateSales = async (asin: string) => {
    setSelectedAsinForStates(asin);
    setIsStateSalesOpen(true);
    setIsLoadingStates(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/inventory/${selectedSpId}/state-sales?asin=${asin}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStateSalesData(data.data || []);
      } else {
        toast({ title: "Oops!", description: "Could not load location data right now.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedSpId) {
      fetchData(selectedSpId);
    }
  }, [selectedSpId]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts && data.accounts.length > 0) {
          setAccountStatus(data.accounts[0].sync_status || "");
          setConnectedAt(data.accounts[0].connected_at || null);
          setSelectedSpId(data.accounts[0].selling_partner_id);
        } else {
          setLoading(false); // No accounts
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchData = async (spId: string) => {
    setLoading(true);
    setIsPremiumRequired(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/inventory/${spId}/forecaster`, { credentials: "include" });
      
      if (res.status === 403) {
        // 403 can mean tier restriction OR pending sync.
        // Only show premium lock if we know user tier is insufficient.
        const tier = (typeof window !== "undefined" ? (user?.subscriptionTier || "free") : "free");
        const isPremium = tier === "premium" || tier === "enterprise";
        if (!isPremium) {
          setIsPremiumRequired(true);
        }
        // If premium but still 403, account is pending sync — leave isPremiumRequired false
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setInventoryData(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateAsinSettings = async (asin: string, payload: any) => {
    setIsUpdating(asin);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/inventory/${selectedSpId}/settings/${asin}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save changes");
      
      // We don't refetch everything, just update the local state for immediate feedback
      // In a real app, you might want to recalculate days_remaining locally, 
      // but for absolute accuracy, a refetch is safer if math is complex. 
      // For this implementation, we will refetch silently.
      fetchData(selectedSpId);
      toast({ title: "Saved ✓", description: "Settings updated securely." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not save settings.", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  const applyBulkSettings = async () => {
    setIsBulkUpdating(true);
    try {
      // Determine if we apply to ALL or just filtered
      const asinsToUpdate = filteredData.map(d => d.asin);
      
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/inventory/${selectedSpId}/settings/bulk/global`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          asins: asinsToUpdate, // If empty list passed to backend, it might ignore or do all. We pass explicit list.
          supplier_lead_time_days: bulkLeadTime,
          transit_time_days: bulkTransitTime
        })
      });
      
      if (!res.ok) throw new Error("Failed to bulk update");
      
      toast({ title: "Bulk Applied", description: `Updated ${asinsToUpdate.length} ASINs.` });
      setIsBulkDialogOpen(false);
      fetchData(selectedSpId);
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not apply bulk settings.", variant: "destructive" });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  if (!mounted) return null;

  // KPIs
  const oosCount = inventoryData.filter(d => d.total_stock === 0).length;
  const criticalCount = inventoryData.filter(d => d.total_stock > 0 && d.is_critical).length;
  const healthyCount = inventoryData.filter(d => d.total_stock > 0 && !d.is_critical).length;

  // Filter Logic
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.asin.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.product_title && item.product_title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (filterType === "OOS") matchesFilter = item.total_stock === 0;
    if (filterType === "CRITICAL") matchesFilter = item.total_stock > 0 && item.is_critical;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && inventoryData.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12">
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-blue-900/50' : 'bg-gradient-to-br from-indigo-100 to-blue-100'}`}>
            <Package className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Restock Forecaster</h1>
            <p className="page-subtitle">Never run out of stock. Exact purchase order dates based on your supply chain.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {accounts.length > 1 ? (
            <select 
              value={selectedSpId} 
              onChange={(e) => setSelectedSpId(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              {accounts.map(acc => (
                <option key={acc.selling_partner_id} value={acc.selling_partner_id}>
                  Store: {acc.selling_partner_id.substring(0, 8)}...
                </option>
              ))}
            </select>
          ) : accounts.length === 1 ? (
            <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
              Store: {accounts[0].selling_partner_id.substring(0, 8)}...
            </div>
          ) : null}

          {!isPremiumRequired && accounts.length > 0 && accountStatus === "COMPLETED" && inventoryData.length > 0 && (
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full border-indigo-200 dark:border-indigo-800">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Bulk Settings
                </Button>
              </DialogTrigger>
              <DialogContent className={isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}>
                <DialogHeader>
                  <DialogTitle>Bulk Apply Lead Times</DialogTitle>
                  <DialogDescription>
                    Apply these settings to all {filteredData.length} ASINs currently visible in your table.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Supplier Lead Time</label>
                    <Input 
                      type="number" 
                      value={bulkLeadTime} 
                      onChange={(e) => setBulkLeadTime(parseInt(e.target.value) || 0)} 
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Transit Time</label>
                    <Input 
                      type="number" 
                      value={bulkTransitTime} 
                      onChange={(e) => setBulkTransitTime(parseInt(e.target.value) || 0)} 
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={applyBulkSettings} disabled={isBulkUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                    {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Apply to {filteredData.length} ASINs
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isStateSalesOpen} onOpenChange={setIsStateSalesOpen}>
            <DialogContent className={`max-w-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white'}`}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  Where Your Customers Are (State-wise Sales)
                </DialogTitle>
                <DialogDescription>
                  See which states are buying <span className="font-bold">{selectedAsinForStates}</span> the most. Use this to plan targeted ads or localized inventory!
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 min-h-[300px]">
                {isLoadingStates ? (
                  <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                    <p>Fetching your customer locations...</p>
                  </div>
                ) : stateSalesData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed">
                    <MapPin className="w-10 h-10 mb-2 opacity-20" />
                    <p>No geographic sales data found for this product yet.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[400px] pr-2">
                    <table className="w-full text-sm text-left">
                      <thead className={`text-xs uppercase bg-muted/40 sticky top-0 ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>
                        <tr>
                          <th className="px-4 py-3 font-semibold rounded-tl-lg">State</th>
                          <th className="px-4 py-3 font-semibold text-right">Units Sold</th>
                          <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stateSalesData.map((s, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < 3 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {i + 1}
                              </span>
                              {s.state}
                            </td>
                            <td className="px-4 py-3 text-right font-bold">{s.units_sold}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{s.revenue.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
        </div>
      </header>

      {accounts.length === 0 ? (
        <Card className={`mt-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your Amazon Seller account to start forecasting inventory securely.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full">
              Connect Seller Account
            </Button>
          </CardContent>
        </Card>
      ) : isPremiumRequired ? (
        <Card className={`mt-8 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-900/50' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100'}`}>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
              <Crown className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Premium Feature Locked</h2>
            <p className="text-muted-foreground max-w-lg mb-8 text-lg">
              The <b>Restock Forecaster</b> tool is an exclusive feature for our Premium and Enterprise members. 
              Upgrade your plan to never go out of stock again and manage complex supply chains easily.
            </p>
            <Button onClick={() => window.location.href = '/subscription'} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      ) : (accountStatus === "PENDING" || accountStatus === "SYNCING") && inventoryData.length === 0 ? (
        <SyncPendingBanner
          connectedAt={connectedAt}
          syncStatus={accountStatus}
          featureName="inventory data"
          pollFn={async () => {
            const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              return data.accounts?.[0]?.sync_status || "PENDING";
            }
            return "PENDING";
          }}
          onSyncComplete={() => fetchAccounts()}
        />
      ) : accountStatus === "COMPLETED" && inventoryData.length === 0 ? (
        <Card className={`mt-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <Package className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Inventory Found</h2>
            <p className="text-muted-foreground max-w-md mb-3">
              Your store is synced but we couldn't find any active FBA inventory.
            </p>
            <p className={`text-sm max-w-md mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              This happens if you have no FBA products listed, or your inventory was recently removed. Once you send stock to an Amazon FBA warehouse, it will appear here.
            </p>
            <Button variant="outline" onClick={() => fetchAccounts()} className="rounded-full">
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : accountStatus === "FAILED" ? (
        <Card className={`mt-8 rounded-2xl border ${isDark ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">Sync Failed</h2>
            <p className="text-muted-foreground max-w-md mb-3">
              We lost access to your Amazon Seller account. This usually means Amazon revoked the connection or the authorization expired.
            </p>
            <p className={`text-sm max-w-md mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Please disconnect and reconnect your store to restore access. Your historical data is safe and will reappear after reconnecting.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} className="bg-red-500 hover:bg-red-600 text-white rounded-full font-bold gap-2">
              Reconnect Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Out of Stock</p>
                  <h3 className="text-3xl font-bold text-red-500">{oosCount} ASINs</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Critical Restocks</p>
                  <h3 className="text-3xl font-bold text-amber-500">{criticalCount} ASINs</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Healthy Stock</p>
                  <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{healthyCount} ASINs</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">Inventory Pipeline</CardTitle>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search ASIN or Title..." 
                      className="pl-9 rounded-full h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className={`h-9 px-3 rounded-full border text-sm font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="ALL">All Items</option>
                    <option value="CRITICAL">Critical Only</option>
                    <option value="OOS">Out of Stock</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className={`text-xs uppercase bg-muted/40 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">FBA Stock</th>
                    <th className="px-6 py-4 font-semibold">Velocity Config</th>
                    <th className="px-6 py-4 font-semibold">Lead Time</th>
                    <th className="px-6 py-4 font-semibold">Days Left</th>
                    <th className="px-6 py-4 font-semibold text-right">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.map((item) => (
                    <tr key={item.asin} className={`hover:bg-muted/30 transition-colors ${item.total_stock === 0 ? (isDark ? 'bg-red-950/10' : 'bg-red-50/50') : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{item.asin}</div>
                        <div className="text-xs text-muted-foreground w-48 truncate" title={item.product_title}>
                          {item.product_title || "Unknown Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg">{item.total_stock}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.sellable_quantity} sellable • {item.inbound_quantity} inbound
                        </div>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <select
                          value={item.velocity_calculation_method}
                          onChange={(e) => updateAsinSettings(item.asin, { velocity_calculation_method: e.target.value })}
                          disabled={isUpdating === item.asin}
                          className={`w-full p-1.5 text-xs rounded border mb-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                          <option value="30D">30-Day Avg ({Math.round(item.units_sold_30d/30)}/day)</option>
                          <option value="7D">7-Day Avg ({Math.round(item.units_sold_7d/7)}/day)</option>
                          <option value="MANUAL">Manual Override</option>
                        </select>
                        {item.velocity_calculation_method === "MANUAL" && (
                          <Input
                            type="number"
                            placeholder="Daily qty"
                            defaultValue={item.manual_daily_velocity}
                            onBlur={(e) => updateAsinSettings(item.asin, { manual_daily_velocity: parseFloat(e.target.value) || 0 })}
                            className={`h-7 text-xs ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 w-40">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Supply:</span>
                            <Input
                              type="number"
                              defaultValue={item.supplier_lead_time_days}
                              onBlur={(e) => updateAsinSettings(item.asin, { supplier_lead_time_days: parseInt(e.target.value) || 0 })}
                              className={`h-7 w-16 text-xs ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                            />
                            <span className="text-xs text-muted-foreground">d</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Transit:</span>
                            <Input
                              type="number"
                              defaultValue={item.transit_time_days}
                              onBlur={(e) => updateAsinSettings(item.asin, { transit_time_days: parseInt(e.target.value) || 0 })}
                              className={`h-7 w-16 text-xs ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                            />
                            <span className="text-xs text-muted-foreground">d</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-lg font-bold ${
                          item.total_stock === 0 ? 'text-red-500' : 
                          item.days_remaining < 15 ? 'text-red-500' : 
                          item.days_remaining <= 30 ? 'text-amber-500' : 
                          'text-emerald-500'
                        }`}>
                          {item.total_stock === 0 ? '0 Days' : `${item.days_remaining} Days`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.total_stock === 0 ? (
                          <div>
                            <div className="text-red-500 font-bold mb-1">🚨 URGENT: Order NOW</div>
                            <div className="text-xs text-muted-foreground mb-3">Rec Qty: {item.recommended_order_quantity}</div>
                          </div>
                        ) : item.is_critical ? (
                          <div>
                            <div className="text-amber-500 font-bold mb-1">⚠️ Order by {new Date(item.reorder_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                            <div className="text-xs text-muted-foreground mb-3">Rec Qty: {item.recommended_order_quantity}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-emerald-500 font-medium mb-1">✅ Order by {new Date(item.reorder_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                            <div className="text-xs text-muted-foreground mb-3">Rec Qty: {item.recommended_order_quantity}</div>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs rounded-full gap-1.5 w-full flex justify-center border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          onClick={() => openStateSales(item.asin)}
                        >
                          <MapPin className="w-3 h-3" />
                          Where customers are
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No products found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
