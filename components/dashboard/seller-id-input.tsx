import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save, ShoppingBag, Globe } from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SellerIdInput({ onSaved }: { onSaved: (id: string) => void }) {
  const { user } = useAuth();
  const [sellerId, setSellerId] = useState("");
  const [country, setCountry] = useState("IN"); // Defaulting to India as requested
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!sellerId.trim()) {
      setError("Please enter a valid Seller ID");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/update-seller-id`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seller_id: sellerId, country: country }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Seller ID");
      }

      const data = await response.json();
      onSaved(data.seller_id);

      // Backend now automatically handles background ingestion based on updated profile

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <div className="bg-[#0f2a43] p-8 text-white text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-3">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Connect Your Store</CardTitle>
          <CardDescription className="text-slate-300 mt-2">
            Enter your Amazon Merchant ID to initialize your seller dashboard.
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Seller / Merchant ID</label>
            <Input
              placeholder="e.g. A2P3M1XXXXXXX"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0f2a43]"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Marketplace</label>
            <Select value={country} onValueChange={setCountry} disabled={isSaving}>
              <SelectTrigger
                className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0f2a43]"
                data-track-id="seller_connect_country_select"
                data-filter-value={country}
              >
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="rounded-xl overflow-hidden bg-white shadow-xl">
                <SelectItem value="IN" data-track-id="seller_connect_country_option" data-filter-value="IN">India 🇮🇳</SelectItem>
                <SelectItem value="US" data-track-id="seller_connect_country_option" data-filter-value="US">United States 🇺🇸</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400 font-medium">
              Data will be fetched specifically for this region.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-[#0f2a43] hover:bg-[#1a3d5c] text-white font-bold transition-all"
            data-track-id="seller_connect_store_btn"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up your dashboard...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Connect Store
              </>
            )}
          </Button>

          <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
            🔒 Secure Read-Only Access
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
