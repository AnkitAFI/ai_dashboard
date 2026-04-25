"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, MapPin, Bell, Shield, CreditCard, Save, RefreshCw, Smartphone, Globe, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LOCATIONS = [
  { value: "mumbai", label: "Mumbai, India" },
  { value: "delhi", label: "Delhi, India" },
  { value: "bangalore", label: "Bangalore, India" },
  { value: "chennai", label: "Chennai, India" },
  { value: "kolkata", label: "Kolkata, India" },
  { value: "pune", label: "Pune, India" },
  { value: "hyderabad", label: "Hyderabad, India" },
  { value: "other", label: "Other" },
];

const TARGET_MARKETS = [
  { value: "national", label: "India (National)" },
  { value: "regional", label: "Regional (West India)" },
  { value: "local", label: "Local (Mumbai Metro)" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    location: "mumbai",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    priceAlerts: true,
    trendAlerts: false,
    targetMarket: "national",
    shareUsageData: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        businessName: user.businessName || "",
        location: user.location || "mumbai",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: "Authentication required", description: "Please login again to update your profile", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          business_name: profileData.businessName,
          location: profileData.location,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }
      await refreshUser();
      toast({ title: "Configuration Updated", description: "Your core intelligence parameters have been saved." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Could not synchronize settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePreferenceChange = (field: string) => (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: checked }));
  };

  if (authLoading) return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <Skeleton className="h-10 w-64 rounded-full" />
      <Skeleton className="h-[400px] rounded-[2.5rem]" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Config</h1>
          <p className="text-sm text-slate-500 font-medium">Fine-tune your personal and business intelligence parameters</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 rounded-full bg-sky-50 border-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest">
            {user.subscriptionTier || 'Free'} Intelligence Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation / Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center shadow-inner">
                <User className="w-10 h-10 text-sky-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> Status</span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px]">Verified</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" /> Plan</span>
                  <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-none font-black text-[10px] uppercase">{user.subscriptionTier || 'Free'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {[
              { icon: <User className="w-4 h-4" />, label: "Profile", active: true },
              { icon: <Bell className="w-4 h-4" />, label: "Notifications", active: false },
              { icon: <Shield className="w-4 h-4" />, label: "Security", active: false },
              { icon: <CreditCard className="w-4 h-4" />, label: "Billing", active: false },
            ].map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                item.active ? "bg-white shadow-md text-sky-700" : "text-slate-500 hover:bg-white/50"
              }`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Card */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <User className="w-5 h-5 text-sky-600" /> Identity Intelligence
              </CardTitle>
              <CardDescription className="text-xs font-medium">Core personal and business identifiers</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input value={profileData.firstName} onChange={handleInputChange("firstName")} className="pl-11 h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input value={profileData.lastName} onChange={handleInputChange("lastName")} className="pl-11 h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <Input value={profileData.email} disabled className="pl-11 h-12 rounded-xl bg-slate-100 border-none shadow-inner opacity-60" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Entity</Label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input value={profileData.businessName} onChange={handleInputChange("businessName")} placeholder="Optional" className="pl-11 h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Location</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Select value={profileData.location} onValueChange={(v) => setProfileData(p => ({...p, location: v}))}>
                      <SelectTrigger className="pl-11 h-12 rounded-xl bg-slate-50 border-none shadow-inner font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-medium">
                        {LOCATIONS.map(loc => <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                <Button variant="outline" className="rounded-xl h-12 px-8 font-bold text-slate-500" onClick={() => refreshUser()}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={handleProfileSubmit} disabled={isSaving} className="rounded-xl h-12 px-10 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Identity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-600" /> Signal Preferences
              </CardTitle>
              <CardDescription className="text-xs font-medium">Configure alert sensitivity and delivery nodes</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              {[
                { id: "emailNotifications", label: "Intelligence Reports", desc: "Weekly performance summaries and strategy briefings", icon: <Mail className="w-4 h-4" /> },
                { id: "priceAlerts", label: "Volatility Signals", desc: "Instant triggers for significant rating or price shifts", icon: <Zap className="w-4 h-4" /> },
                { id: "trendAlerts", label: "Emerging Opportunities", desc: "Early detection signals for viral product clusters", icon: <TrendingUp className="w-4 h-4" /> },
              ].map((pref) => (
                <div key={pref.id} className="flex items-start justify-between group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {pref.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{pref.label}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{pref.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={(preferences as any)[pref.id]} 
                    onCheckedChange={handlePreferenceChange(pref.id)} 
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              ))}

              <div className="pt-6 border-t border-slate-50">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Strategic Focus Market</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TARGET_MARKETS.map((market) => (
                    <button 
                      key={market.value}
                      onClick={() => setPreferences(p => ({...p, targetMarket: market.value}))}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-2 ${
                        preferences.targetMarket === market.value 
                          ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100" 
                          : "border-slate-50 bg-slate-50/30 hover:border-slate-200"
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${preferences.targetMarket === market.value ? "text-indigo-600" : "text-slate-300"}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${preferences.targetMarket === market.value ? "text-indigo-900" : "text-slate-400"}`}>
                        {market.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
