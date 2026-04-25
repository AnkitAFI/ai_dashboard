"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Loader2, Bell, MessageSquare, ShieldCheck, Zap, Sparkles, Activity,
  Phone, Smartphone, CheckCircle2, AlertCircle, RefreshCw, Send,
  ArrowRight, Settings, Lock, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function WhatsappAlertsContent() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>({
    price_drops: true,
    out_of_stock: true,
    negative_review: false,
    competitor_spike: true,
  });

  const tier = user?.subscriptionTier || "free";
  const isPremium = tier === "premium";

  const handleToggle = (key: string) => {
    setActiveAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    // Simulating API save
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Sync <span className="text-emerald-600">Alerts</span></h1>
          <p className="text-base text-slate-500 font-medium mt-2">Real-time market signals delivered directly to your WhatsApp</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Link</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-0">
             <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800"><Smartphone className="h-6 w-6 text-emerald-600" /> WhatsApp Integration</CardTitle>
             <CardDescription className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Deploy mobile market intelligence</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
             <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified WhatsApp Number</Label>
                <div className="flex flex-col md:flex-row gap-4">
                   <div className="relative flex-1">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 font-bold border-r border-slate-200 pr-3">
                         <img src="https://flagcdn.com/in.svg" alt="IN" className="w-4 h-3 rounded-sm" />
                         <span>+91</span>
                      </div>
                      <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="98765 43210" className="h-16 pl-24 pr-6 rounded-2xl bg-slate-50 border-none text-base font-black focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                   </div>
                   <Button onClick={handleSave} disabled={loading} className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-xl transition-all">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Connect"}</Button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium px-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end encrypted notification delivery</p>
             </div>

             <div className="pt-10 border-t border-slate-100 space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-lg font-black text-slate-800">Alert Triggers</h4>
                   <Badge variant="outline" className="rounded-full border-slate-100 text-slate-400 font-bold">Active Configuration</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { key: "price_drops", label: "Market Price Drops", desc: "Notify when competitors lower prices by >5%" },
                     { key: "out_of_stock", label: "Stock Alerts", desc: "Critical alerts when inventory hits <10 units" },
                     { key: "negative_review", label: "Sentiment Spikes", desc: "Detect surges in negative customer feedback" },
                     { key: "competitor_spike", label: "Sales Spikes", desc: "Monitor rapid rank changes of rivals" },
                   ].map((item) => (
                     <div key={item.key} className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-emerald-50/30 hover:border-emerald-100 transition-all">
                        <div className="space-y-1">
                           <p className="text-sm font-black text-slate-800">{item.label}</p>
                           <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                        </div>
                        <Switch checked={activeAlerts[item.key]} onCheckedChange={() => handleToggle(item.key)} className="data-[state=checked]:bg-emerald-500" />
                     </div>
                   ))}
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-emerald-950 p-10 relative overflow-hidden text-white">
              {!isPremium && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6 gap-4">
                   <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20"><Lock className="w-6 h-6 text-emerald-950" /></div>
                   <div><p className="text-sm font-black uppercase tracking-widest text-amber-500">Premium Required</p><p className="text-xs text-emerald-200/60 mt-1">Unlock AI-driven predictive alerting</p></div>
                   <Button className="rounded-xl bg-white text-emerald-950 font-black px-6 py-2">Upgrade Now</Button>
                </div>
              )}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-900 rounded-full -mr-24 -mt-24 opacity-30 blur-2xl" />
              <h3 className="text-xl font-black mb-8 relative flex items-center gap-3"><Zap className="h-6 w-6 text-amber-400" /> Smart Prediction</h3>
              <div className="space-y-8 relative">
                 <div className="p-6 bg-emerald-900/50 rounded-3xl border border-emerald-800/50 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Predictive Alert</p>
                    <p className="text-sm font-medium leading-relaxed italic text-emerald-100">"Expect a price war on 'Gaming Mice' in the next 48 hours. Rivals are dumping stock. We will alert you the moment first drop hits."</p>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Sync Frequency: REAL-TIME</span>
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/30 rounded-[2.5rem] bg-white p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Settings className="h-5 w-5 text-slate-400" /> Alert Preferences</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-black uppercase text-slate-500">Daily Digest</span>
                    <Switch />
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-black uppercase text-slate-500">Quiet Hours (10PM-8AM)</span>
                    <Switch checked />
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("block text-sm font-medium text-slate-700", className)}>{children}</label>;
}

export default function WhatsappAlertsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" /><p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Configuring Secure Notification Channels...</p></div>}>
      <WhatsappAlertsContent />
    </Suspense>
  );
}
