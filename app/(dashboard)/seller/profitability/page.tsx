"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Menu, TrendingUp, AlertTriangle, Loader2, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function ProfitabilityDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, resolvedTheme } = useTheme();
  const { toggle } = useSidebar();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [maxAccounts, setMaxAccounts] = useState(1);
  const [selectedSpId, setSelectedSpId] = useState<string>("");

  const [summary, setSummary] = useState<any>(null);
  const [asins, setAsins] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
    fetchStatus();
  }, []);

  useEffect(() => {
    if (selectedSpId) {
      fetchProfitabilityData(selectedSpId);
    }
  }, [selectedSpId]);

  // Derive premium status from user tier
  useEffect(() => {
    const tier = user?.subscriptionTier || "free";
    setIsPremium(tier === "premium" || tier === "enterprise");
  }, [user]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        setMaxAccounts(data.max_accounts || 1);
        if (data.accounts && data.accounts.length > 0) {
          setSelectedSpId(data.accounts[0].selling_partner_id);
        }
      } else if (res.status !== 401) {
        // 401 means not logged in — handled by auth context, don't show extra error
        setFetchError("Could not load account status. Please refresh the page.");
      }
    } catch (e) {
      setFetchError("Network error. Please check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitabilityData = async (spId: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      // Summary (KPI cards) — available to ALL tiers
      const summaryRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/profitability/${spId}/summary`, { credentials: "include" });
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      } else if (summaryRes.status === 403) {
        // Store not owned by this user — clear and show not-connected state
        setAccounts([]);
      } else if (summaryRes.status !== 401) {
        setFetchError("Failed to load financial data. Please try again in a moment.");
      }

      // ASINs table — Premium & Enterprise only. 403 here is expected for Free/Basic — do NOT show an error.
      const tier = user?.subscriptionTier || "free";
      if (tier === "premium" || tier === "enterprise") {
        const asinsRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/profitability/${spId}/asins`, { credentials: "include" });
        if (asinsRes.ok) {
          const asinsData = await asinsRes.json();
          setAsins(asinsData.asins || []);
        } else if (asinsRes.status !== 403 && asinsRes.status !== 401) {
          // Only surface unexpected errors — not the expected 403 tier block
          toast({ title: "Partial load", description: "ASIN breakdown could not be loaded. KPI cards are still accurate.", variant: "default" });
        }
      }
    } catch (e) {
      setFetchError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCogsUpdate = async (asin: string, cogs: number, shipping: number, target: number) => {
    if (!isPremium) return; // extra guard — not reachable from UI for free/basic
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/profitability/${selectedSpId}/cogs/${asin}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cogs, inbound_shipping: shipping, target_margin_override: target })
      });
      if (res.status === 403) {
        toast({ title: "Upgrade required", description: "Editing COGS requires a Premium or Enterprise plan.", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail || "Failed to save changes. Please try again.");
      }
      toast({ title: "Saved ✓", description: "COGS updated successfully." });
      fetchProfitabilityData(selectedSpId);
    } catch (error: any) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
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

  if (fetchError && !summary && accounts.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center gap-4 max-w-sm">
          <WifiOff className="w-12 h-12 text-slate-400" />
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">{fetchError}</p>
          <Button variant="outline" onClick={() => { setFetchError(null); fetchStatus(); }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const pieData = summary ? [
    { name: 'Net Profit', value: summary.net_profit, color: '#10b981' },
    { name: 'Amazon Fees', value: summary.amazon_fees, color: '#ef4444' },
    { name: 'Total COGS', value: summary.total_cogs, color: '#f59e0b' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12">
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50' : 'bg-gradient-to-br from-emerald-100 to-teal-100'}`}>
            <TrendingUp className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Financial Command Center</h1>
            <p className="page-subtitle">Track your True Net Profit accurately down to the rupee.</p>
          </div>
        </div>

        {maxAccounts > 1 && accounts.length > 1 && (
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
              <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your Amazon Seller account to track inventory, orders, and calculate your true net profitability down to the rupee.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full">
              Connect Seller Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Gross Revenue (INR)</p>
                  <h3 className="text-3xl font-bold">₹{summary.revenue.toLocaleString()}</h3>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amazon Fees</p>
                  <h3 className="text-3xl font-bold text-red-500">-₹{summary.amazon_fees.toLocaleString()}</h3>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total COGS</p>
                  <h3 className="text-3xl font-bold text-amber-500">-₹{summary.total_cogs.toLocaleString()}</h3>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">True Net Profit</p>
                  <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">₹{summary.net_profit.toLocaleString()}</h3>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {isPremium ? (
              <>
                {/* Fee Eater Pie Chart — Premium+ only */}
                <Card className={`lg:col-span-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <CardHeader>
                    <CardTitle>Fee Eater Analysis</CardTitle>
                    <CardDescription>Where your revenue goes</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">Not enough data.</p>
                    )}
                  </CardContent>
                </Card>

                {/* ASIN Profitability Table — Premium+ only */}
                <Card className={`lg:col-span-2 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <CardHeader>
                    <CardTitle>ASIN Profitability Breakdown</CardTitle>
                    <CardDescription>Update your manufacturing and shipping costs to see accurate margins.</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className={`text-xs uppercase bg-muted/50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">ASIN</th>
                          <th className="px-4 py-3">Units Sold</th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">Unit COGS (₹)</th>
                          <th className="px-4 py-3">Target Margin %</th>
                          <th className="px-4 py-3">Net Profit</th>
                          <th className="px-4 py-3 rounded-tr-lg">Actual Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asins.map((asin) => (
                          <tr key={asin.asin} className={`border-b border-muted/50 last:border-0 ${asin.is_bleeding ? (isDark ? 'bg-red-950/20' : 'bg-red-50') : ''}`}>
                            <td className="px-4 py-3 font-medium">{asin.asin}</td>
                            <td className="px-4 py-3">{asin.units_sold}</td>
                            <td className="px-4 py-3">₹{asin.revenue.toLocaleString()}</td>
                            <td className="px-4 py-3 w-32">
                              <Input
                                type="number"
                                defaultValue={asin.cogs}
                                className={`h-8 text-xs ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (val !== asin.cogs) handleCogsUpdate(asin.asin, val, asin.shipping, asin.target_margin);
                                }}
                                disabled={isUpdating}
                              />
                            </td>
                            <td className="px-4 py-3 w-32">
                              <Input
                                type="number"
                                step="0.1"
                                defaultValue={asin.target_margin}
                                className={`h-8 text-xs ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (val !== asin.target_margin) handleCogsUpdate(asin.asin, asin.cogs, asin.shipping, val);
                                }}
                                disabled={isUpdating}
                              />
                            </td>
                            <td className={`px-4 py-3 font-bold ${asin.net_profit < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              ₹{asin.net_profit.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${asin.is_bleeding ? 'text-red-500' : 'text-emerald-500'}`}>
                                  {asin.margin_pct.toFixed(1)}%
                                </span>
                                {asin.is_bleeding && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {asins.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                              No ASIN data found for the last 30 days. Sync may still be in progress.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Upgrade teaser for Free & Basic users */
              <div className="lg:col-span-3">
                <Card className={`rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-900/50' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100'}`}>
                  <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
                      <TrendingUp className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                      Unlock Deep Profitability Insights
                    </h2>
                    <p className="text-muted-foreground max-w-lg mb-2 text-base">
                      Upgrade to <b>Premium</b> to access:
                    </p>
                    <ul className={`text-sm mb-8 space-y-1.5 text-left ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Fee Eater Pie Chart — see where your revenue leaks</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> ASIN Profitability Breakdown Table</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Edit COGS &amp; Inbound Shipping per product</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Set custom Target Margin per ASIN</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Bleeding product alerts (products losing money)</li>
                      <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> 12-hour data refresh (vs 24h on Basic)</li>
                    </ul>
                    <Button
                      onClick={() => window.location.href = '/subscription'}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-base px-8 py-5 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      Upgrade to Premium — ₹2,999/mo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
