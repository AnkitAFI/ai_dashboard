"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Menu, DollarSign, AlertCircle, CheckCircle2, XCircle, Clock, Loader2, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SyncPendingBanner from "@/components/seller/sync-pending-banner";

export default function ReimbursementDashboard() {
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

  const [summary, setSummary] = useState<any>(null);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);

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
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (spId: string) => {
    setLoading(true);
    setIsPremiumRequired(false);
    try {
      const [summaryRes, discRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/amazon-sp-api/reimbursements/${spId}/summary`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/amazon-sp-api/reimbursements/${spId}/discrepancies`, { credentials: "include" })
      ]);

      if (summaryRes.status === 403 || discRes.status === 403) {
        // 403 can mean tier restriction OR pending sync.
        // Only show premium lock if user tier is actually insufficient.
        const tier = user?.subscriptionTier || "free";
        const isPremium = tier === "premium" || tier === "enterprise";
        if (!isPremium) {
          setIsPremiumRequired(true);
        }
        // If premium but 403, account is pending sync — leave isPremiumRequired false
        return;
      }

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (discRes.ok) {
        const data = await discRes.json();
        setDiscrepancies(data.discrepancies || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reimbursements/${selectedSpId}/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Upgrade to Premium required to use this feature.");
        throw new Error("Failed to update status");
      }
      toast({ title: "Updated", description: "Status updated successfully." });

      // Update local state to avoid full refetch
      setDiscrepancies(prev => prev.map(d =>
        d.amazon_order_id === orderId ? { ...d, status: newStatus } : d
      ));

      // Optionally refresh summary if needed
      const summaryRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reimbursements/${selectedSpId}/summary`, { credentials: "include" });
      if (summaryRes.ok) setSummary(await summaryRes.json());

    } catch (error: any) {
      // Safe, non-technical error message for the seller
      const safeMessage = error.message.includes("Premium")
        ? error.message
        : "Oops! Something went wrong while saving. Please try again in a few minutes.";
      toast({ title: "Update Failed", description: safeMessage, variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  };

  if (!mounted) return null;

  if (loading && !summary) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12">
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-rose-900/50 to-orange-900/50' : 'bg-gradient-to-br from-rose-100 to-orange-100'}`}>
            <DollarSign className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Lost Money Recovery</h1>
            <p className="page-subtitle">Find orders where the buyer got a refund, but the item never returned to the warehouse. Claim your money back!</p>
          </div>
        </div>

        {accounts.length > 0 && (
          <select
            value={selectedSpId}
            onChange={(e) => setSelectedSpId(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            {accounts.map(acc => (
              <option key={acc.selling_partner_id} value={acc.selling_partner_id}>
                Account: {acc.selling_partner_id.substring(0, 8)}... ({acc.region})
              </option>
            ))}
          </select>
        )}
      </header>

      {accounts.length === 0 ? (
        <Card className={`mt-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <AlertCircle className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your Amazon Seller account to start scanning for lost inventory and missed reimbursements.
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
              The <b>Lost Money Recovery</b> tool is an exclusive feature for our Premium and Enterprise members.
              Upgrade your plan to automatically scan for missing FBA returns and recover thousands of rupees!
            </p>
            <Button onClick={() => window.location.href = '/subscription'} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      ) : (accountStatus === "PENDING" || accountStatus === "SYNCING") && !summary ? (
        <SyncPendingBanner
          connectedAt={connectedAt}
          syncStatus={accountStatus}
          featureName="order history"
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
      ) : accountStatus === "COMPLETED" && !summary ? (
        <Card className={`mt-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
              <CheckCircle2 className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Missing Returns Found</h2>
            <p className="text-muted-foreground max-w-md mb-3">
              Your store is synced and we scanned your last 90 days of orders — no missing FBA returns were detected.
            </p>
            <p className={`text-sm max-w-md mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              This is actually great news! Amazon has returned all refunded items. If you have no refunds or returns in this period, nothing will appear here.
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
              <AlertCircle className="w-8 h-8 text-red-500" />
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
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Money Stuck</p>
                  <h3 className="text-3xl font-bold text-red-500">₹{summary.total_potential_lost.toLocaleString()}</h3>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Money Recovered</p>
                  <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">₹{summary.total_successfully_reimbursed.toLocaleString()}</h3>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Claims</p>
                  <h3 className="text-3xl font-bold text-amber-500">{summary.actionable_cases_count}</h3>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Missing Returns List</CardTitle>
                    <CardDescription>Items refunded to the buyer but not found in the Amazon warehouse after 45 days.</CardDescription>
                  </div>
                  <div className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Last 90 Days Only
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`text-xs uppercase bg-muted/50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                      <th className="px-4 py-3">ASIN</th>
                      <th className="px-4 py-3">Refund Date</th>
                      <th className="px-4 py-3">Money Stuck</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discrepancies.map((disc) => (
                      <tr key={disc.id} className={`border-b border-muted/50 last:border-0`}>
                        <td className="px-4 py-3 font-medium">
                          <span className="cursor-pointer hover:underline" onClick={() => {
                            navigator.clipboard.writeText(disc.amazon_order_id);
                            toast({title: "Copied!", description: "Order ID copied to clipboard for Seller Central."});
                          }}>
                            {disc.amazon_order_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{disc.asin}</td>
                        <td className="px-4 py-3">{new Date(disc.refund_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-bold text-red-500">
                          ₹{disc.refunded_amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {disc.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Action Required</span>}
                          {disc.status === 'CLAIM_FILED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Claim Filed</span>}
                          {disc.status === 'REIMBURSED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Reimbursed</span>}
                          {disc.status === 'IGNORED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Ignored</span>}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={disc.status}
                            onChange={(e) => handleStatusUpdate(disc.amazon_order_id, e.target.value)}
                            disabled={isUpdating === disc.amazon_order_id}
                            className={`px-2 py-1.5 rounded border text-xs font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                          >
                            <option value="PENDING">Pending (Action Needed)</option>
                            <option value="CLAIM_FILED">Claim Filed with Amazon</option>
                            <option value="REIMBURSED">Money Recovered</option>
                            <option value="IGNORED">Ignore this item</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {discrepancies.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium text-foreground">No Missing Items Found!</p>
                          <p>Great news! Amazon has successfully returned all your refunded items, or you just need to wait a few more days.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
