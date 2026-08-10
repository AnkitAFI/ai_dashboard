"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { LOCATIONS } from "@/lib/locations";
import { BUSINESS_INTERESTS } from "@/lib/business-interests";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Building2, MapPin, Layers, X } from "lucide-react";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ isOpen, onClose }: CompleteProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      if (user.businessName) setBusinessName(user.businessName);
      if (user.location) setLocation(user.location);
      if (user.businessInterests && user.businessInterests.length > 0) {
        setSelectedInterests(user.businessInterests);
      }
    }
  }, [user]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast({
        title: "Location required",
        description: "Please select your location to continue.",
        variant: "destructive",
      });
      return;
    }

    if (selectedInterests.length === 0) {
      toast({
        title: "Business interests required",
        description: "Please select at least one business category.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          business_name: businessName.trim() || null,
          location: location,
          business_interests: selectedInterests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Update failed",
          description: sanitizeApiError(
            errorData.detail,
            "Could not update profile details. Please try again."
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Completed! 🎉",
        description: "Your personalized settings have been saved.",
      });

      await refreshUser().catch((err) => {
        console.warn("User refresh after profile update non-critical warning:", err);
      });

      onClose();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: sanitizeApiError(
          err.message,
          "An error occurred while updating your profile."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-100">
              Welcome to Insydz
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-100/90 mt-1">
            Tell us about your business so we can tailor market intelligence and insights for you.
          </DialogDescription>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Business Name (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Business Name{" "}
                <span className="text-gray-400 dark:text-slate-500 font-normal">
                  (Optional)
                </span>
              </Label>
            </div>
            <Input
              placeholder="e.g. Apex Retail Technologies"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isLoading}
              className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
            />
          </div>

          {/* Location * */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Location <span className="text-red-500">*</span>
              </Label>
            </div>
            <Select value={location} onValueChange={setLocation} disabled={isLoading}>
              <SelectTrigger className="h-11 text-sm bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="Select state or major city" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white max-h-60">
                {LOCATIONS.map((loc) => (
                  <SelectItem
                    key={loc.value}
                    value={loc.value}
                    className="text-gray-700 dark:text-slate-300 focus:bg-blue-50 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-white"
                  >
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Interests * */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Business Interests <span className="text-red-500">*</span>
                </Label>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                Select at least 1 category
              </span>
            </div>

            <div className="rounded-xl p-3 max-h-[170px] overflow-y-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BUSINESS_INTERESTS.map((interest) => (
                  <div key={interest.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`modal-${interest.id}`}
                      checked={selectedInterests.includes(interest.id)}
                      onCheckedChange={() => handleInterestToggle(interest.id)}
                      disabled={isLoading}
                      className="border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`modal-${interest.id}`}
                      className="text-xs text-gray-600 dark:text-slate-400 font-normal cursor-pointer select-none"
                    >
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {selectedInterests.length > 0 && (
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                ✓ {selectedInterests.length} category selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 h-11 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 h-11 rounded-xl font-bold text-white text-xs transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
