"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  RefreshCw, Search, ArrowUpRight, ArrowDownRight,
  Users, ShieldCheck, ShieldOff, Crown, TrendingUp,
  Wallet, IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "syatharthdelhi@gmail.com";
const TIER_PRICE: Record<string, number> = { free: 0, basic: 1999, premium: 2999 };

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

interface Stats {
  total_users: number; verified_users: number;
  unverified_users: number; recent_signups_7days: number;
  by_tier: { free: number; basic: number; premium: number };
}

interface UserRow {
  id: number; first_name: string; last_name: string;
  email: string; subscription_tier: "free" | "basic" | "premium";
  is_verified: boolean; ai_chat_used: number; created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [lastUpd, setLastUpd] = useState(new Date());

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stats`, { credentials: "include" });
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
      setLastUpd(new Date());
    } catch (err) {
      console.error("Admin stats fetch failed:", err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }
    fetchStats();
  }, [user]);

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const basicCount = stats?.by_tier?.basic ?? 0;
  const premiumCount = stats?.by_tier?.premium ?? 0;
  const freeCount = stats?.by_tier?.free ?? 0;
  const tierTotal = freeCount + basicCount + premiumCount;
  const basicMRR = basicCount * TIER_PRICE.basic;
  const premiumMRR = premiumCount * TIER_PRICE.premium;
  const totalMRR = basicMRR + premiumMRR;
  const paidUsers = basicCount + premiumCount;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (!q || u.email.toLowerCase().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)) &&
      (filterTier === "all" || u.subscription_tier === filterTier)
    );
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Command Center</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              System health and user intelligence overview
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase py-0 px-1.5">Live</Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
            Last Updated: {lastUpd.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <Button variant="outline" onClick={fetchStats} disabled={isLoading} className="rounded-xl border-slate-200 shadow-sm font-bold">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: stats?.total_users ?? 0, sub: `+${stats?.recent_signups_7days ?? 0} signups`, icon: <Users className="w-5 h-5" />, color: "indigo" },
          { label: "Verified", value: stats?.verified_users ?? 0, sub: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}% rate`, icon: <ShieldCheck className="w-5 h-5" />, color: "emerald" },
          { label: "Pending", value: stats?.unverified_users ?? 0, sub: "Action required", icon: <ShieldOff className="w-5 h-5" />, color: "amber" },
          { label: "Paid Users", value: paidUsers, sub: `${pct(paidUsers, tierTotal)}% conversion`, icon: <Wallet className="w-5 h-5" />, color: "sky" },
          { label: "Monthly Rev", value: inr(totalMRR), sub: "Gross MRR", icon: <IndianRupee className="w-5 h-5" />, color: "emerald" },
          { label: "7D Growth", value: stats?.recent_signups_7days ?? 0, sub: "New accounts", icon: <TrendingUp className="w-5 h-5" />, color: "violet" },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-md rounded-2xl bg-white overflow-hidden group hover:shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                <div className={`p-2 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                  {kpi.icon}
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" /> {kpi.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">User Intelligence Directory</CardTitle>
              <CardDescription className="text-xs font-medium">Manage and monitor all platform members</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search by name or email..." 
                  className="pl-9 w-64 h-10 rounded-xl bg-slate-50 border-none shadow-inner"
                />
              </div>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-32 h-10 rounded-xl bg-slate-50 border-none shadow-inner font-bold text-xs uppercase tracking-wider">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 font-bold">
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Identity</th>
                      <th className="px-6 py-4">Access Level</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Contribution</th>
                      <th className="px-8 py-4 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600">
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{u.first_name} {u.last_name}</p>
                              <p className="text-[10px] font-medium text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.subscription_tier === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                            u.subscription_tier === 'basic' ? 'bg-sky-50 text-sky-700 border-sky-100' : 
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {u.subscription_tier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className={`text-[11px] font-bold ${u.is_verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {u.is_verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">{inr(TIER_PRICE[u.subscription_tier] || 0)}</p>
                          <p className="text-[10px] font-medium text-slate-400">AI Used: {u.ai_chat_used || 0}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <p className="text-xs font-bold text-slate-600">{new Date(u.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Revenue Distribution Panel */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden h-full">
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-xl font-black text-slate-900">Revenue Metrics</CardTitle>
              <CardDescription className="text-xs font-medium">Detailed financial breakdown</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Monthly Revenue</p>
                <p className="text-3xl font-black">{inr(totalMRR)}</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">ARR Projection</span>
                  <span className="text-sm font-black">{inr(totalMRR * 12)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Premium Tier", count: premiumCount, rev: premiumMRR, color: "bg-amber-500" },
                  { label: "Basic Tier", count: basicCount, rev: basicMRR, color: "bg-sky-500" },
                  { label: "Free Tier", count: freeCount, rev: 0, color: "bg-slate-300" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${row.color}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{row.label}</p>
                        <p className="text-[10px] font-medium text-slate-400">{row.count} Active Users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{inr(row.rev)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pct(row.rev, totalMRR)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
