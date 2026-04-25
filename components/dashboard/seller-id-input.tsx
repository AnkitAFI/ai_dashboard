"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save, ShoppingBag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";

export default function SellerIdInput({ onSaved }: { onSaved: (id: string) => void }) {
  const { user } = useAuth();
  const [sellerId, setSellerId] = useState("");
  const [country, setCountry] = useState("IN");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSave = async () => {
    if (!sellerId.trim()) { setError("Please enter a valid Seller ID"); return; }
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/seller/update-seller-id`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId, country: country }),
      });
      if (!response.ok) throw new Error("Failed to save Seller ID");
      const data = await response.json();
      onSaved(data.seller_id);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <div className="bg-sky-950 p-8 text-white text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-3"><ShoppingBag className="w-8 h-8 text-white" /></div>
          <CardTitle className="text-2xl font-bold">Connect Your Store</CardTitle>
          <CardDescription className="text-sky-100 mt-2">Enter your Amazon Merchant ID to begin.</CardDescription>
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Seller / Merchant ID</label><Input placeholder="e.g. A2P3M1XXXXXXX" value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500" disabled={isSaving} /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Select Marketplace</label><Select value={country} onValueChange={setCountry} disabled={isSaving}><SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="IN">India 🇮🇳</SelectItem><SelectItem value="US">United States 🇺🇸</SelectItem></SelectContent></Select></div>
          {error && <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-medium"><AlertCircle className="w-4 h-4" />{error}</div>}
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 rounded-xl bg-sky-900 hover:bg-sky-950 text-white font-bold transition-all shadow-lg shadow-sky-100">{isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting...</> : <><Save className="w-4 h-4 mr-2" />Connect Store</>}</Button>
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">🔒 Secure Read-Only Access</p>
        </CardContent>
      </Card>
    </div>
  );
}
