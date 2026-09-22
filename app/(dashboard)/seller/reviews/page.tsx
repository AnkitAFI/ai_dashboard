"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/config"
import { useTheme } from "next-themes"
import { useSidebar } from "@/components/layout/sidebar-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Clock, ShieldAlert, Crown, Search, Settings2, Trash2, Plus, Star, Menu, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SyncPendingBanner from "@/components/seller/sync-pending-banner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReviewAutomatorPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { theme, resolvedTheme } = useTheme()
  const { toggle } = useSidebar()
  
  const [mounted, setMounted] = useState(false)
  const [isPremiumRequired, setIsPremiumRequired] = useState(false)
  
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  
  const [stats, setStats] = useState({ requests_sent: 0, pending_queue: 0, orders_excluded: 0 })
  const [globalRule, setGlobalRule] = useState<any>({ delay_days_after_shipment: 7, exclude_refunded: true, is_active: false })
  const [customRules, setCustomRules] = useState<any[]>([])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const isDark = resolvedTheme === "dark"

  // Mount check
  useEffect(() => {
    setMounted(true)
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      fetchData(selectedAccount)
    }
  }, [selectedAccount])

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts || [])
        if (data.accounts && data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0].selling_partner_id)
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const fetchData = async (spId: string) => {
    setLoading(true)
    setIsPremiumRequired(false)
    try {
      const rulesRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reviews/${spId}/rules`, {
        credentials: "include"
      })
      
      if (rulesRes.status === 403) {
        setIsPremiumRequired(true)
        return
      }

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json()
        setGlobalRule(rulesData.global_rule || { delay_days_after_shipment: 7, exclude_refunded: true, is_active: false })
        setCustomRules(rulesData.custom_rules || [])

        const statsRes = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reviews/${spId}/stats`, {
          credentials: "include"
        })
        if (statsRes.ok) {
           const statsData = await statsRes.json()
           setStats(statsData)
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const saveGlobalRule = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reviews/${selectedAccount}/rules/global`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          delay_days_after_shipment: globalRule.delay_days_after_shipment,
          exclude_refunded: globalRule.exclude_refunded,
          is_active: globalRule.is_active
        })
      })
      if (res.ok) {
        toast({ title: "Settings Saved Successfully" })
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error saving settings", variant: "destructive" })
    }
  }

  const addOverride = async (asin: string, days: number) => {
     try {
        const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reviews/${selectedAccount}/rules/asin/${asin}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            delay_days_after_shipment: days,
            exclude_refunded: globalRule.exclude_refunded
          })
        })
        if (res.ok) {
          const newRule = await res.json()
          setCustomRules(prev => [...prev.filter(r => r.asin !== asin), newRule])
          toast({ title: `Custom rule applied to ${asin}` })
        }
     } catch (e) {
       toast({ title: "Error adding override", variant: "destructive" })
     }
  }
  
  const removeOverride = async (asin: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/reviews/${selectedAccount}/rules/asin/${asin}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setCustomRules(prev => prev.filter(r => r.asin !== asin))
        toast({ title: `Custom rule removed for ${asin}` })
      }
    } catch (e) {
      toast({ title: "Error removing override", variant: "destructive" })
    }
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    )
  }

  const activeAccountObj = accounts.find(a => a.selling_partner_id === selectedAccount)

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12">
      
      {/* Header Area */}
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-amber-900/50' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
            <Star className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Review Automator</h1>
            <p className="page-subtitle">Securely automate Amazon's official review requests. Set your rules once, and let the system handle the rest.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {accounts.length > 1 ? (
            <select 
              value={selectedAccount} 
              onChange={(e) => setSelectedAccount(e.target.value)}
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
        </div>
      </header>

      {/* Main Content Areas */}
      {accounts.length === 0 ? (
        <Card className={`mt-8 rounded-2xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your Amazon Seller account to start automating reviews securely.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-full">
              Connect Seller Account
            </Button>
          </CardContent>
        </Card>
      ) : activeAccountObj && (activeAccountObj.sync_status === "PENDING" || activeAccountObj.sync_status === "SYNCING") ? (
        <SyncPendingBanner
          connectedAt={activeAccountObj.connected_at}
          syncStatus={activeAccountObj.sync_status}
          onSyncComplete={() => {
            fetchAccounts()
            if (selectedAccount) fetchData(selectedAccount)
          }}
          pollFn={async () => {
            const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" })
            const data = await res.json()
            const acc = (data.accounts || []).find((a: any) => a.selling_partner_id === selectedAccount)
            return acc ? acc.sync_status : ""
          }}
          featureName="Review Automator"
        />
      ) : activeAccountObj && activeAccountObj.sync_status === "FAILED" ? (
        <Card className={`mt-8 rounded-2xl border ${isDark ? "bg-red-950/20 border-red-900/50" : "bg-red-50/50 border-red-100"}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
              <AlertTriangle className={`w-8 h-8 ${isDark ? "text-red-400" : "text-red-600"}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sync Failed</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              We encountered an error connecting to your Amazon account. Your seller token may have expired or been revoked.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full">
              Reconnect Account
            </Button>
          </CardContent>
        </Card>
      ) : isPremiumRequired ? (
        <Card className={`mt-8 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-900/50' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100'}`}>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
              <Crown className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Enterprise Review Automator</h2>
            <p className="text-muted-foreground max-w-lg mb-8 text-lg">
              The <b>Review Automator</b> tool is an exclusive feature for our Premium and Enterprise members. 
              Upgrade your plan to automatically and securely request reviews from eligible orders.
            </p>
            <Button onClick={() => window.location.href = '/subscription'} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Requests Sent (30d)</p>
                  <h3 className="text-3xl font-bold text-blue-500">{stats.requests_sent.toLocaleString()}</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Automation Queue</p>
                  <h3 className="text-3xl font-bold text-amber-500">{stats.pending_queue.toLocaleString()}</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Orders Excluded</p>
                  <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.orders_excluded.toLocaleString()}</h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <ShieldAlert className="w-6 h-6 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Global Settings Panel */}
            <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="h-5 w-5 text-indigo-500" /> Global Settings
                </CardTitle>
                <CardDescription>Define the default rules for your entire catalog.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className={`flex items-center justify-between p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <div className="font-bold text-lg">Master Automation Toggle</div>
                    <div className="text-sm text-muted-foreground mt-1">When enabled, the system will send requests automatically.</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${globalRule.is_active ? 'text-emerald-500' : 'text-muted-foreground'}`}>{globalRule.is_active ? "ON" : "OFF"}</span>
                    <Switch 
                      checked={globalRule.is_active} 
                      onCheckedChange={(c) => setGlobalRule({...globalRule, is_active: c})} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-foreground">Default Timing Rule</label>
                  <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <span className="text-sm text-muted-foreground">Wait exactly</span>
                    <Input 
                      type="number" 
                      min={5} max={28}
                      className={`w-24 text-center font-semibold rounded-lg ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                      value={globalRule.delay_days_after_shipment}
                      onChange={(e) => setGlobalRule({...globalRule, delay_days_after_shipment: parseInt(e.target.value) || 7})}
                    />
                    <span className="text-sm text-muted-foreground">days after shipment.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-foreground">Safety Shield</label>
                  <div className={`flex items-start gap-4 p-5 rounded-xl border ${isDark ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <Checkbox 
                      checked={globalRule.exclude_refunded}
                      onCheckedChange={(c) => setGlobalRule({...globalRule, exclude_refunded: c as boolean})}
                      className="mt-1 border-emerald-500/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                    />
                    <div>
                      <div className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Skip orders that are no longer eligible due to return, refund, or cancellation status.</div>
                      <div className={`text-xs mt-1.5 ${isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>(Highly Recommended: Automatically protects your metrics).</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={saveGlobalRule} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-5 shadow-md">
                    Save Global Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ASIN Rules Table */}
            <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col`}>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" /> ASIN Overrides
                </CardTitle>
                <CardDescription>Set custom wait times for specific products.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by ASIN to add or edit..." 
                      className={`pl-10 rounded-full h-10 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-[300px]">
                  <table className="w-full text-sm text-left">
                    <thead className={`text-xs uppercase sticky top-0 z-10 ${isDark ? 'bg-slate-900 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}`}>
                      <tr>
                        <th className="px-6 py-3 font-semibold">ASIN</th>
                        <th className="px-6 py-3 font-semibold">Rule Type</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* Search helper row for adding new overrides */}
                      {searchQuery.length >= 8 && !customRules.find(r => r.asin.toLowerCase() === searchQuery.toLowerCase()) && (
                         <tr className={isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/50'}>
                           <td className="px-6 py-4 font-bold">{searchQuery.toUpperCase()}</td>
                           <td className="px-6 py-4">
                             <span className="text-sm text-muted-foreground">Global Rule</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                             <Button variant="outline" size="sm" className="rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/50" onClick={() => {
                                const days = prompt("Enter wait time (5-28 days):", "14")
                                if (days && parseInt(days) >= 5 && parseInt(days) <= 28) {
                                  addOverride(searchQuery.toUpperCase(), parseInt(days))
                                  setSearchQuery("")
                                } else if (days) {
                                  toast({ title: "Days must be between 5 and 28", variant: "destructive" })
                                }
                             }}>
                               <Plus className="h-4 w-4 mr-1" /> Add
                             </Button>
                           </td>
                         </tr>
                      )}
                      
                      {customRules.filter(r => r.asin.toLowerCase().includes(searchQuery.toLowerCase())).map(rule => (
                        <tr key={rule.asin} className={`hover:bg-muted/30 transition-colors ${isDark ? 'bg-slate-800/20' : 'bg-slate-50/50'}`}>
                          <td className="px-6 py-4 font-bold">{rule.asin}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Wait {rule.delay_days_after_shipment} days
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeOverride(rule.asin)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-8 px-3">
                              <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      
                      {customRules.length === 0 && searchQuery.length < 8 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center">
                              <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                              <p>No custom rules active.</p>
                              <p className="text-xs mt-1">Search an ASIN to add one.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
