"use client";

import { useState, useEffect } from "react";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Image as ImageIcon, Send, AlertCircle, ShoppingCart, ArrowRight, FileText, Type, List, FileSearch, Hash, LineChart, Clock, Check, Lock, Wallet, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import PaymentModal, { type PaymentPlan } from "@/components/payment/payment-modal";
import ReactDiffViewer from 'react-diff-viewer-continued';

const CREDIT_PACKS: Record<string, PaymentPlan[]> = {
  enterprise: [
    { id: "ai_credits_100", name: "100 SKU Credits", price: 4000, description: "Generate & Publish 100 SKUs (₹40/SKU)" },
    { id: "ai_credits_500", name: "500 SKU Credits", price: 20000, description: "Generate & Publish 500 SKUs (₹40/SKU)" },
    { id: "ai_credits_1000", name: "1,000 SKU Credits", price: 40000, description: "High-volume cataloging (₹40/SKU)" },
    { id: "ai_credits_5000", name: "5,000 SKU Credits", price: 200000, description: "Maximum enterprise volume (₹40/SKU)" },
  ]
};

export default function ListingStudioPage() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100 dark:border-blue-900">
        <span className="text-4xl">✨</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
        Coming Soon
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mb-8">
        We are actively working on this feature. Stay tuned for an incredible experience!
      </p>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-5 py-2.5 rounded-full shadow-sm">
        <span>🚀</span> Launching very soon
      </div>
    </div>
  );
}

export function OldListingStudioPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [description, setDescription] = useState("");
  const [imageBase64List, setImageBase64List] = useState<string[]>([]);
  const [imagePreviewList, setImagePreviewList] = useState<string[]>([]);
  const [useHinglish, setUseHinglish] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [missingAttributes, setMissingAttributes] = useState<string[]>([]);
  const [attributeFormValues, setAttributeFormValues] = useState<Record<string, string>>({});
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [extractedImageDetails, setExtractedImageDetails] = useState<any>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [topUpCredits, setTopUpCredits] = useState(50);
  const [selectedCreditPack, setSelectedCreditPack] = useState<PaymentPlan | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);
  const [agreedToLegalResponsibility, setAgreedToLegalResponsibility] = useState(false);

  const [targetPlatform, setTargetPlatform] = useState("");
  const [amazonCommerceData, setAmazonCommerceData] = useState({
    sku: "",
    mrp: "",
    selling_price: "",
    quantity: "",
    product_id: "",
    product_id_type: "UPC"
  });
  const [flipkartCommerceData, setFlipkartCommerceData] = useState({
    sku: "",
    mrp: "",
    selling_price: "",
    quantity: "",
    product_id: "",
    product_id_type: "UPC"
  });

  const [generatedListing, setGeneratedListing] = useState<any>(null);
  const [originalListing, setOriginalListing] = useState<any>(null);
  const [editableListing, setEditableListing] = useState<any>(null); // To store current user edits
  const { toast } = useToast();

  // Auto-Save Debounce
  useEffect(() => {
    if (!generatedListing || !generatedListing.id) return;

    // Check if it's identical to original to prevent unnecessary saves
    if (JSON.stringify(generatedListing) === JSON.stringify(originalListing)) return;

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listing-agent/save-edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            listing_id: generatedListing.id,
            edited_amazon_title: generatedListing.amazon_title,
            edited_amazon_bullets: generatedListing.amazon_bullets,
            edited_amazon_description: generatedListing.amazon_description,
            edited_amazon_search_terms: generatedListing.amazon_search_terms,
            edited_flipkart_title: generatedListing.flipkart_title,
            edited_flipkart_description: generatedListing.flipkart_description
          })
        });

        const data = await res.json();
        if (!res.ok && data.detail === "ABUSE_DETECTED") {
          toast({
            title: "Policy Violation ⚠️",
            description: "Your recent edit contained abusive language. The save was rejected.",
            variant: "destructive"
          });
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      }
    }, 1500); // Debounce 1.5s

    return () => clearTimeout(timeoutId);
  }, [generatedListing, originalListing]);

  const handleGenerate = async () => {
    if (!user) return;

    if (user.subscriptionTier !== "enterprise") {
      toast({
        title: "Enterprise Exclusive",
        description: "AI Listing Studio is an exclusive feature for Enterprise users. Please upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    // === SANDBOX TESTING === 
    // Bypassing credit check for testing
    // if ((user.aiCreditsBalance || 0) <= 0) {
    if (false) {
      setIsTopUpOpen(true);
      return;
    }

    if (imageBase64List.length === 0) {
      toast({
        title: "Image Required",
        description: "Please upload at least one product image. Our AI requires visual verification.",
        variant: "destructive"
      });
      return;
    }

    // STEP 1: Vision AI Analysis
    setIsAnalyzing(true);
    try {
      const analyzeRes = await fetch(`${API_BASE_URL}/api/listing-agent/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image_base64_list: imageBase64List })
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(sanitizeApiError(analyzeData.detail, "Vision AI failed. Please try again."));

      const details = analyzeData.data;
      setExtractedImageDetails(details);

      let rawMissing = details.missing_critical_attributes;
      let missing: string[] = [];
      if (Array.isArray(rawMissing)) {
        missing = rawMissing.filter(m => typeof m === 'string' && m.trim() !== "");
      }

      if (missing.length > 0) {
        setMissingAttributes(missing);
        const initialForm: Record<string, string> = {};
        missing.forEach(m => initialForm[m] = "");
        setAttributeFormValues(initialForm);
        setIsVerificationModalOpen(true);
        setIsAnalyzing(false);
        return; // Pause generation to wait for human verification
      }

      // If nothing is missing, proceed immediately to text generation
      await executeGeneration(details);

    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
      setIsAnalyzing(false);
    }
  };

  const executeGeneration = async (verifiedDetails: any) => {
    setIsGenerating(true);
    setIsAnalyzing(false);
    setIsVerificationModalOpen(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/listing-agent/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          raw_description: description,
          image_base64_list: imageBase64List,
          use_hinglish: useHinglish,
          verified_image_details: verifiedDetails
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(sanitizeApiError(data.detail, "Failed to generate listing. Please try again."));

      setGeneratedListing({ ...data.data, id: data.listing_id });
      setOriginalListing({ ...data.data, id: data.listing_id });
      toast({
        title: "Success!",
        description: "Your optimized listings have been generated.",
      });

      // Silently refresh user to update credit balance locally
      refreshUser();
    } catch (err: any) {
      if (err.message === "INSUFFICIENT_CREDITS") {
        setIsTopUpOpen(true);
        toast({
          title: "Out of SKU Credits ⚠️",
          description: "You have 0 credits remaining. Please top up your Wallet to generate this listing.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: sanitizeApiError(err.message, "Generation failed. Please try again."),
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 9 files
    const validFiles = files.slice(0, 9);

    validFiles.forEach(file => {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewList(prev => [...prev, previewUrl]);

      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64List(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = '';

    // CRITICAL FIX: Reset previously extracted details so the AI actually analyzes the NEW images!
    setExtractedImageDetails(null);
    setMissingAttributes([]);
    setAttributeFormValues({});

    // CRITICAL FIX: Prevent image-swapping exploits by wiping any generated listings when new images are uploaded
    setGeneratedListing(null);
    setEditableListing(null);
  };

  const handleRemoveBackground = async () => {
    if (imageBase64List.length === 0) return;
    setIsRemovingBg(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listing-agent/remove-background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image_base64_list: imageBase64List })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(sanitizeApiError(data.detail, "Failed to remove background. Please try again."));

      // Update all images with their cleaned versions
      setImageBase64List(data.image_base64_list);
      setImagePreviewList(data.image_base64_list);

      const stats = data.stats || { ai_processed: 0, skipped_already_white: 0 };
      toast({ 
        title: "Success", 
        description: `Processed ${stats.total || data.image_base64_list.length} images. (Cleaned: ${stats.ai_processed}, Skipped/Already White: ${stats.skipped_already_white})` 
      });
    } catch (err: any) {
      toast({ title: "Error", description: sanitizeApiError(err.message, "Failed to remove background. Please try again."), variant: "destructive" });
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handlePublishClick = (platform: string) => {
    if (!generatedListing?.id) return;
    setTargetPlatform(platform);
    setIsPublishModalOpen(true);
  };

  const copyAmazonToFlipkart = () => {
    setFlipkartCommerceData({ ...amazonCommerceData });
    toast({ title: "Copied", description: "Amazon details copied to Flipkart.", duration: 2000 });
  };

  const confirmCommerceData = () => {
    // Basic validation depending on platform
    const validate = (data: any) => data.sku && data.selling_price && data.quantity;

    if (targetPlatform === 'both' && (!validate(amazonCommerceData) || !validate(flipkartCommerceData))) {
      toast({ title: "Validation Error", description: "SKU, Price, and Quantity are required for both platforms.", variant: "destructive" });
      return;
    } else if (targetPlatform === 'amazon' && !validate(amazonCommerceData)) {
      toast({ title: "Validation Error", description: "SKU, Price, and Quantity are required.", variant: "destructive" });
      return;
    } else if (targetPlatform === 'flipkart' && !validate(flipkartCommerceData)) {
      toast({ title: "Validation Error", description: "SKU, Price, and Quantity are required.", variant: "destructive" });
      return;
    }

    setIsPublishModalOpen(false);
    setIsReviewModalOpen(true);
  };

  const submitPublish = async () => {
    if (!agreedToAccuracy || !agreedToLegalResponsibility) {
      toast({
        title: "Compliance Required",
        description: "You must check the legal accuracy and responsibility boxes before publishing.",
        variant: "destructive"
      });
      return;
    }

    setIsReviewModalOpen(false);
    setIsPublishing(true);

    const publishToPlatform = async (platform: string, data: any) => {
      const res = await fetch(`${API_BASE_URL}/api/listing-agent/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listing_id: generatedListing.id,
          platform: platform,
          sku: data.sku,
          mrp: parseFloat(data.mrp) || parseFloat(data.selling_price),
          selling_price: parseFloat(data.selling_price),
          quantity: parseInt(data.quantity),
          product_id: data.product_id,
          product_id_type: data.product_id_type,
          agreed_to_accuracy: agreedToAccuracy,
          agreed_to_legal_responsibility: agreedToLegalResponsibility,
          images: imageBase64List,
          data_snapshot: generatedListing
        })
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(`${platform.toUpperCase()}: ${sanitizeApiError(responseData.detail, "Publish failed. Please try again.")}`);
      return responseData;
    };

    try {
      if (targetPlatform === 'both') {
        await Promise.all([
          publishToPlatform('amazon', amazonCommerceData),
          publishToPlatform('flipkart', flipkartCommerceData)
        ]);
        toast({ title: "Published Successfully!", description: "Your product is now live on BOTH platforms!" });
      } else {
        const data = targetPlatform === 'amazon' ? amazonCommerceData : flipkartCommerceData;
        await publishToPlatform(targetPlatform, data);
        toast({ title: "Published Successfully!", description: `Your product is now live on ${targetPlatform.toUpperCase()}` });
      }
    } catch (err: any) {
      toast({
        title: "Publish Failed",
        description: sanitizeApiError(err.message, "Publish failed. Please try again."),
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex justify-center items-center h-[50vh]"><Clock className="animate-spin w-8 h-8 text-blue-500 dark:text-blue-400" /></div>;

  const isNonEnterprise = user?.subscriptionTier !== "enterprise";
  // === SANDBOX TESTING ===
  // Forcing 999 credits for testing UI
  const credits = 999; // user?.aiCreditsBalance || 0;

  if (isNonEnterprise) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <Lock className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
          Enterprise Exclusive Feature
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mb-8">
          Stop struggling with manual cataloging. Instantly generate and publish optimized Amazon and Flipkart listings that maximize your search visibility. Upgrade to the Enterprise plan to access our automated One-Click Cataloger.
        </p>
        <Button size="lg" className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" onClick={() => window.location.href = '/subscription'}>
          View Upgrade Plans <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <Sparkles className="text-blue-600 dark:text-blue-400 w-10 h-10 drop-shadow-sm" />
            One-Click Cataloger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">Upload a single product photo and instantly auto-generate your complete Amazon & Flipkart catalog.</p>
        </div>

        {/* Wallet Banner */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU Credits</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{credits} Remaining</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsTopUpOpen(true)} className="ml-2 font-semibold">
            Top-up
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">Raw Product Data</CardTitle>
              <CardDescription className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">Tell us what you are selling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">Product Image (Required for Verification)</Label>
                <div
                  className={imagePreviewList.length > 0 
                    ? "relative group w-full" 
                    : "border-2 border-dashed border-indigo-100 dark:border-indigo-900 rounded-xl p-8 flex flex-col items-center justify-center bg-white dark:bg-slate-950 hover:bg-indigo-50/30 transition-colors cursor-pointer relative overflow-hidden group"
                  }
                  onClick={() => {
                    if (imagePreviewList.length === 0) {
                      document.getElementById("imageUpload")?.click();
                    }
                  }}
                >
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    max="9"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {imagePreviewList.length > 0 ? (
                    <div className="w-full bg-slate-900 rounded-xl p-4 flex gap-4 overflow-x-auto custom-scrollbar items-center border border-slate-800" onClick={(e) => e.stopPropagation()}>
                      {imagePreviewList.map((previewUrl, i) => (
                        <div key={i} className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-md group">
                          <img 
                            src={previewUrl} 
                            alt={`Preview ${i}`} 
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImage(previewUrl);
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPreviews = [...imagePreviewList];
                              newPreviews.splice(i, 1);
                              setImagePreviewList(newPreviews);
                              const newBase64 = [...imageBase64List];
                              newBase64.splice(i, 1);
                              setImageBase64List(newBase64);
                            }}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-900 rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[11px] font-bold px-2 py-1 text-center truncate pointer-events-none">
                            {i === 0 ? "Main Image" : `Image ${i + 1}`}
                          </div>
                        </div>
                      ))}
                      {imagePreviewList.length < 9 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("imageUpload")?.click();
                          }}
                          className="w-28 h-28 shrink-0 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
                        >
                          <span className="text-3xl mb-1">+</span>
                          <span className="text-[11px] font-semibold">Add More</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload images (Max 9)</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-2">(AI will analyze all angles)</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/50 text-center mx-4">
                        ⚠️ Please upload clear, high-resolution images so the Vision AI can read all text, specs, and details accurately.
                      </span>
                    </div>
                  )}
                </div>
                {imagePreviewList.length > 0 && (
                  <div className="flex flex-col gap-1 w-full mt-2">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBg}
                        className="flex-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50 border-slate-300 dark:border-slate-600"
                      >
                        {isRemovingBg ? "Cleaning All Images..." : "✨ Auto-Remove Background (All)"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImagePreviewList([]);
                          setImageBase64List([]);
                          setExtractedImageDetails(null);
                          setMissingAttributes([]);
                          setAttributeFormValues({});
                          setGeneratedListing(null);
                          setEditableListing(null);
                        }}
                        className="text-red-500 hover:text-red-600 px-3"
                      >
                        Clear All
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center px-2 leading-tight">
                      *Note: We will intelligently skip any images that already have a white background.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">What is the product?</Label>
                <Textarea
                  placeholder="e.g. A blue stainless steel water bottle, 1 liter, keeps water cold for 24 hours, has a bamboo lid."
                  className="min-h-[140px] resize-none bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Label htmlFor="hinglish-mode" className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  Optimize for Tier-2/3 Indian<br />Cities (Hinglish Keywords)
                </Label>
                <Switch
                  id="hinglish-mode"
                  checked={useHinglish}
                  onCheckedChange={setUseHinglish}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isAnalyzing || (!description && imageBase64List.length === 0)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-xl shadow-sm transition-all"
              >
                {isAnalyzing ? "Vision AI Scanning..." : isGenerating ? "Generating..." : "Generate Listings"}
                {!isGenerating && !isAnalyzing && <Sparkles className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>

          {/* Verification Modal */}
          <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
            <DialogContent className="sm:max-w-[450px]" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-amber-500">⚠️</span> Missing Information
                </DialogTitle>
                <DialogDescription>
                  Our Vision AI could not detect some details from the images. Please fill them in manually so we can accurately generate your listing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {missingAttributes.map((attr) => (
                  <div key={attr} className="flex flex-col gap-2">
                    <Label htmlFor={attr} className="capitalize font-bold text-slate-700 dark:text-slate-300">
                      {String(attr).replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={attr}
                      value={attributeFormValues[attr] || ""}
                      onChange={(e) => setAttributeFormValues({ ...attributeFormValues, [attr]: e.target.value })}
                      placeholder={`Enter ${String(attr).replace(/_/g, " ")}...`}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const mergedDetails = {
                      ...extractedImageDetails,
                      human_verified_attributes: attributeFormValues
                    };
                    executeGeneration(mergedDetails);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save & Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Lightbox Modal */}
          <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
            <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex justify-center items-center overflow-visible">
              <DialogTitle className="sr-only">Image Preview</DialogTitle>
              <button 
                onClick={() => setLightboxImage(null)} 
                className="absolute -top-12 right-0 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>
              {lightboxImage && (
                <img src={lightboxImage} alt="Expanded Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-32 text-center h-[90%] bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-24 h-24 mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                <Sparkles className="w-10 h-10 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
                Crafting Your Listing...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-8">
                Our Smart Engine is deeply analyzing your inputs to write high-converting, SEO-optimized copy for both Amazon and Flipkart.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-5 py-2.5 rounded-full shadow-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                Please wait... this usually takes 10-20 seconds.
              </div>
            </div>
          ) : !generatedListing ? (
            <div className="flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 h-full">
              {/* Header */}
              <div className="text-center mb-6 mt-4">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                  Let our Smart Engine build your Amazon & Flipkart catalog <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">Just 3 simple steps to fully optimize your catalog</p>
              </div>

              {/* 3 Steps */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 mb-4">
                {/* Step 1 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">1</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-5 mt-2">
                      <ImageIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">Upload Product Image</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 max-w-[180px] leading-relaxed">Upload a clear image of your product so our Smart Engine can understand it better.</p>
                  </CardContent>
                </Card>

                <ArrowRight className="w-6 h-6 text-indigo-300 mx-2 flex-shrink-0 rotate-90 md:rotate-0" />

                {/* Step 2 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">2</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-5 mt-2">
                      <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">Describe Your Product</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 max-w-[180px] leading-relaxed">Tell us key details about your product like features, material, benefits, etc.</p>
                  </CardContent>
                </Card>

                <ArrowRight className="w-6 h-6 text-emerald-300 mx-2 flex-shrink-0 rotate-90 md:rotate-0" />

                {/* Step 3 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">3</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-5 mt-2">
                      <FileText className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">Auto-Generate Your Listing</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 max-w-[180px] leading-relaxed">Our Smart Engine will instantly generate a high-converting catalog for you.</p>
                  </CardContent>
                </Card>
              </div>

              {/* What AI Generates */}
              <Card className="border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden rounded-2xl">
                <div className="bg-slate-50/50 dark:bg-slate-900/50 py-3 text-center border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">What our Smart Engine generates for you</h4>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-between items-center max-w-3xl mx-auto px-4 gap-6 lg:gap-2">
                    {[
                      { icon: Type, label: "SEO Optimized\nTitle" },
                      { icon: List, label: "Key Feature\nBullets" },
                      { icon: FileSearch, label: "HTML\nDescription" },
                      { icon: Hash, label: "Hidden\nSearch Terms" },
                      { icon: Sparkles, label: "Premium A+\nContent", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
                      { icon: ShoppingCart, label: "Amazon & Flipkart\nReady", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full ${item.bg || 'bg-blue-50 dark:bg-blue-950/50'} flex items-center justify-center mb-3 shadow-sm border border-slate-50`}>
                          <item.icon className={`w-6 h-6 ${item.color || 'text-blue-600 dark:text-blue-400'}`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-pre-line leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Footer Cards */}
              <div className="flex flex-col md:flex-row gap-6 mt-2">
                <Card className="flex-1 border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
                  <CardContent className="p-7">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-5">Why sellers love it</h4>
                    <ul className="space-y-3.5">
                      {[
                        "Save ₹450+ per SKU vs. traditional cataloging agencies",
                        "Go live in 20 seconds instead of waiting 3-5 days",
                        "Zero back-and-forth emails or manual data entry",
                        "Maximize organic visibility with perfectly tuned SEO"
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" strokeWidth={3} />
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex-1 border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-2xl flex items-center">
                  <CardContent className="p-7 flex items-start gap-5 w-full">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0 border border-emerald-100/50 dark:border-emerald-900/50 mt-1">
                      <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wide">Estimated generation time</h4>
                      <div className="text-3xl font-black text-slate-800 dark:text-slate-200 my-2">10-20 seconds</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-4">It usually takes less than 20 seconds to generate your complete listing.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="amazon" className="w-full">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <TabsList className="grid w-full lg:w-[600px] grid-cols-1 sm:grid-cols-3 h-auto sm:h-10 gap-2 sm:gap-0 p-1">
                  <TabsTrigger className="w-full" value="amazon">Amazon Preview</TabsTrigger>
                  <TabsTrigger className="w-full" value="flipkart">Flipkart Preview</TabsTrigger>
                  <TabsTrigger value="aplus" className="bg-gradient-to-r from-amber-200 to-orange-300 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-900 dark:text-amber-400 font-semibold data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 dark:data-[state=active]:from-amber-600 dark:data-[state=active]:to-orange-600 data-[state=active]:text-white w-full">✨ A+ Content</TabsTrigger>
                </TabsList>
                <Button
                  onClick={() => handlePublishClick('both')}
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold hover:shadow-lg transition-all w-full lg:w-auto"
                >
                  🚀 Publish to Both Platforms
                </Button>
              </div>

              {/* Amazon Tab */}
              <TabsContent value="amazon">
                <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
                  <CardHeader className="bg-orange-50/50 dark:bg-orange-950/50 pb-4 border-b border-orange-100 dark:border-orange-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-orange-900 dark:text-orange-300">Amazon Listing</CardTitle>
                        <CardDescription>Optimized for A9 Search Algorithm</CardDescription>
                      </div>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handlePublishClick('amazon')}
                        disabled={isPublishing}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Publish to Amazon
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Title</Label>
                      <Textarea
                        className="text-lg font-medium text-slate-900 dark:text-slate-50 resize-none min-h-[60px]"
                        value={generatedListing.amazon_title}
                        onChange={(e) => setGeneratedListing({ ...generatedListing, amazon_title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">About this item</Label>
                      <div className="space-y-2">
                        {(generatedListing.amazon_bullets || []).map((bullet: string, i: number) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="mt-2 text-slate-400 dark:text-slate-500">•</span>
                            <Textarea
                              className="text-slate-700 dark:text-slate-300 text-sm resize-none min-h-[60px]"
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...generatedListing.amazon_bullets];
                                newBullets[i] = e.target.value;
                                setGeneratedListing({ ...generatedListing, amazon_bullets: newBullets });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Product Description (HTML)</Label>
                      <Textarea
                        className="font-mono text-xs text-slate-600 dark:text-slate-400 min-h-[150px]"
                        value={generatedListing.amazon_description || ""}
                        onChange={(e) => setGeneratedListing({ ...generatedListing, amazon_description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-100 dark:border-slate-800">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Backend Search Terms (Hidden)
                      </Label>
                      <Textarea
                        className="text-sm font-mono text-slate-600 dark:text-slate-400 min-h-[60px]"
                        value={generatedListing.amazon_search_terms}
                        onChange={(e) => setGeneratedListing({ ...generatedListing, amazon_search_terms: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Flipkart Tab */}
              <TabsContent value="flipkart">
                <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-950/50 pb-4 border-b border-blue-100 dark:border-blue-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-blue-900 dark:text-blue-300">Flipkart Listing</CardTitle>
                        <CardDescription>Optimized for Flipkart Catalog</CardDescription>
                      </div>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handlePublishClick('flipkart')}
                        disabled={isPublishing}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Publish to Flipkart
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Title</Label>
                      <Textarea
                        className="text-xl font-medium text-slate-900 dark:text-slate-50 resize-none min-h-[60px]"
                        value={generatedListing.flipkart_title}
                        onChange={(e) => setGeneratedListing({ ...generatedListing, flipkart_title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Product Details</Label>
                      <Textarea
                        className="text-slate-600 dark:text-slate-400 text-sm min-h-[100px]"
                        value={generatedListing.flipkart_description}
                        onChange={(e) => setGeneratedListing({ ...generatedListing, flipkart_description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* A+ Content Tab */}
              <TabsContent value="aplus">
                <Card className="border-amber-200 dark:border-amber-800 shadow-sm">
                  <CardHeader className="bg-amber-50/50 dark:bg-amber-950/50 pb-4 border-b border-amber-100 dark:border-amber-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-amber-900 dark:text-amber-300 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                          Premium A+ Content & Rich Description
                        </CardTitle>
                        <CardDescription>Visually engaging modules for Amazon & Flipkart</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="bg-amber-100/50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-md text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="font-semibold mb-1">💡 How to use this:</p>
                        <p>A+ Content (Amazon) and Rich Catalog (Flipkart) are visual upgrades added AFTER your standard product is published. Once you hit <b>Publish to Both</b> above, wait for the listing to go live. Then, copy and paste this text into the respective A+ Builders alongside your lifestyle photos.</p>
                      </div>
                    </div>

                    {generatedListing?.a_plus_content ? (
                      <div className="space-y-6">
                        {/* Brand Story */}
                        <div className="space-y-2 border-b pb-4">
                          <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Brand Story Hook</Label>
                          <div className="flex gap-2">
                            <Textarea
                              readOnly
                              className="text-slate-700 dark:text-slate-300 min-h-[60px]"
                              value={generatedListing.a_plus_content.brand_story_hook}
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.brand_story_hook);
                                toast({ title: "Copied!", description: "Brand Story copied to clipboard." });
                              }}
                            >Copy</Button>
                          </div>
                        </div>

                        {/* Feature 1 */}
                        <div className="space-y-2 border-b pb-4">
                          <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex justify-between">
                            <span>Feature Module 1</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_1_headline} className="font-semibold text-slate-900 dark:text-slate-50" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_1_headline);
                              toast({ title: "Copied!", description: "Headline copied." });
                            }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_1_body} className="text-slate-600 dark:text-slate-400 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_1_body);
                              toast({ title: "Copied!", description: "Body text copied." });
                            }}>Copy</Button>
                          </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-2 border-b pb-4">
                          <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex justify-between">
                            <span>Feature Module 2</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_2_headline} className="font-semibold text-slate-900 dark:text-slate-50" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_2_headline);
                              toast({ title: "Copied!", description: "Headline copied." });
                            }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_2_body} className="text-slate-600 dark:text-slate-400 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_2_body);
                              toast({ title: "Copied!", description: "Body text copied." });
                            }}>Copy</Button>
                          </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="space-y-2 pb-2">
                          <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex justify-between">
                            <span>Feature Module 3</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_3_headline} className="font-semibold text-slate-900 dark:text-slate-50" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_3_headline);
                              toast({ title: "Copied!", description: "Headline copied." });
                            }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_3_body} className="text-slate-600 dark:text-slate-400 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(generatedListing.a_plus_content.feature_3_body);
                              toast({ title: "Copied!", description: "Body text copied." });
                            }}>Copy</Button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        A+ Content is generating... please wait a moment.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          )}

          {generatedListing && (
            <div className="mt-6 text-center text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 py-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
              ⚠️ Note: Please verify the generated content by yourself before publishing to ensure strict compliance.
            </div>
          )}
        </div>
      </div>

      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className={targetPlatform === 'both' ? "sm:max-w-[850px]" : "sm:max-w-[425px]"}>
          <DialogHeader>
            <DialogTitle>Commerce Details</DialogTitle>
            <DialogDescription>
              {targetPlatform === 'both' ? "Enter product details for both Amazon and Flipkart." : `Enter final product details to push live to ${targetPlatform.toUpperCase()}.`}
            </DialogDescription>
            {targetPlatform === 'both' && (
              <Button variant="outline" size="sm" onClick={copyAmazonToFlipkart} className="mt-2 w-fit">
                📋 Copy Amazon Data to Flipkart
              </Button>
            )}
          </DialogHeader>

          <div className={targetPlatform === 'both' ? "grid grid-cols-2 gap-8 py-4" : "py-4"}>
            {(targetPlatform === 'amazon' || targetPlatform === 'both') && (
              <div className="space-y-4">
                {targetPlatform === 'both' && <h3 className="font-semibold text-orange-600 dark:text-orange-400 border-b pb-2">Amazon</h3>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input value={amazonCommerceData.sku} onChange={(e) => setAmazonCommerceData({ ...amazonCommerceData, sku: e.target.value })} placeholder="e.g. BOTTLE-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={amazonCommerceData.quantity} onChange={(e) => setAmazonCommerceData({ ...amazonCommerceData, quantity: e.target.value })} placeholder="100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input type="number" value={amazonCommerceData.selling_price} onChange={(e) => setAmazonCommerceData({ ...amazonCommerceData, selling_price: e.target.value })} placeholder="999" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹)</Label>
                    <Input type="number" value={amazonCommerceData.mrp} onChange={(e) => setAmazonCommerceData({ ...amazonCommerceData, mrp: e.target.value })} placeholder="1499" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Barcode Type</Label>
                    <Select value={amazonCommerceData.product_id_type} onValueChange={(val) => setAmazonCommerceData({ ...amazonCommerceData, product_id_type: val })}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="EAN">EAN</SelectItem>
                        <SelectItem value="ASIN">ASIN</SelectItem>
                        <SelectItem value="GCID">GCID (Exempt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode ID</Label>
                    <Input value={amazonCommerceData.product_id} onChange={(e) => setAmazonCommerceData({ ...amazonCommerceData, product_id: e.target.value })} placeholder={amazonCommerceData.product_id_type === 'GCID' ? 'Optional' : '890123...'} />
                  </div>
                </div>
              </div>
            )}

            {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
              <div className="space-y-4">
                {targetPlatform === 'both' && <h3 className="font-semibold text-blue-600 dark:text-blue-400 border-b pb-2">Flipkart</h3>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input value={flipkartCommerceData.sku} onChange={(e) => setFlipkartCommerceData({ ...flipkartCommerceData, sku: e.target.value })} placeholder="e.g. BOTTLE-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={flipkartCommerceData.quantity} onChange={(e) => setFlipkartCommerceData({ ...flipkartCommerceData, quantity: e.target.value })} placeholder="100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input type="number" value={flipkartCommerceData.selling_price} onChange={(e) => setFlipkartCommerceData({ ...flipkartCommerceData, selling_price: e.target.value })} placeholder="999" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹)</Label>
                    <Input type="number" value={flipkartCommerceData.mrp} onChange={(e) => setFlipkartCommerceData({ ...flipkartCommerceData, mrp: e.target.value })} placeholder="1499" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Barcode Type</Label>
                    <Select value={flipkartCommerceData.product_id_type} onValueChange={(val) => setFlipkartCommerceData({ ...flipkartCommerceData, product_id_type: val })}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="EAN">EAN</SelectItem>
                        <SelectItem value="ASIN">ASIN</SelectItem>
                        <SelectItem value="GCID">GCID (Exempt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode ID</Label>
                    <Input value={flipkartCommerceData.product_id} onChange={(e) => setFlipkartCommerceData({ ...flipkartCommerceData, product_id: e.target.value })} placeholder={flipkartCommerceData.product_id_type === 'GCID' ? 'Optional' : '890123...'} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishModalOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmCommerceData}
              className={
                targetPlatform === 'amazon' ? 'bg-[#FF9900] text-black hover:bg-[#FF9900]/90' :
                  targetPlatform === 'flipkart' ? 'bg-[#2874F0] text-white hover:bg-[#2874F0]/90' :
                    'bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold'
              }
            >
              Review Final Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-blue-500 dark:text-blue-400 w-6 h-6" />
              Final Review
            </DialogTitle>
            <DialogDescription>
              Please verify your listing details before we push this live to the marketplace catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 grid gap-6 py-4">
            <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
              {imageBase64List.length > 0 && (
                <div className="flex flex-col gap-2 shrink-0 w-32 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {imageBase64List.map((img, i) => (
                    <img key={i} src={img} className="w-32 h-32 object-contain rounded-md bg-white dark:bg-slate-950 border shrink-0" alt={`Review image ${i+1}`} />
                  ))}
                </div>
              )}
              <div className="space-y-4 w-full">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Target Platform</p>
                  <p className="font-bold uppercase text-blue-600 dark:text-blue-400">{targetPlatform}</p>
                </div>

                {(targetPlatform === 'amazon' || targetPlatform === 'both') && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase border-b pb-1">Amazon Listing Data</p>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{generatedListing?.amazon_title}</h3>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {(generatedListing?.amazon_bullets || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: generatedListing?.amazon_description || "" }} />
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500">Search Terms: {generatedListing?.amazon_search_terms}</p>
                  </div>
                )}

                {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase border-b pb-1">Flipkart Listing Data</p>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{generatedListing?.flipkart_title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">{generatedListing?.flipkart_description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(targetPlatform === 'amazon' || targetPlatform === 'both') && (
                <div className="border rounded-md p-4 bg-orange-50/30 dark:bg-orange-950/30">
                  <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-2 border-b border-orange-100 dark:border-orange-900 pb-2">Amazon Pricing</h4>
                  <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                    <li><span className="font-medium">SKU:</span> {amazonCommerceData.sku}</li>
                    <li><span className="font-medium">Price:</span> ₹{amazonCommerceData.selling_price}</li>
                    <li><span className="font-medium">Quantity:</span> {amazonCommerceData.quantity}</li>
                    <li><span className="font-medium">Barcode:</span> {amazonCommerceData.product_id_type} {amazonCommerceData.product_id || '(Exempt)'}</li>
                  </ul>
                </div>
              )}

              {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
                <div className="border rounded-md p-4 bg-blue-50/30 dark:bg-blue-950/30">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 border-b border-blue-100 dark:border-blue-900 pb-2">Flipkart Pricing</h4>
                  <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                    <li><span className="font-medium">SKU:</span> {flipkartCommerceData.sku}</li>
                    <li><span className="font-medium">Price:</span> ₹{flipkartCommerceData.selling_price}</li>
                    <li><span className="font-medium">Quantity:</span> {flipkartCommerceData.quantity}</li>
                    <li><span className="font-medium">Barcode:</span> {flipkartCommerceData.product_id_type} {flipkartCommerceData.product_id || '(Exempt)'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-t space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="accuracyCheck" checked={agreedToAccuracy} onChange={(e) => setAgreedToAccuracy(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              <label htmlFor="accuracyCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">I confirm that this listing is accurate and faithfully reflects the actual product.</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="legalCheck" checked={agreedToLegalResponsibility} onChange={(e) => setAgreedToLegalResponsibility(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              <label htmlFor="legalCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">I take full legal responsibility for the contents of this listing and any claims made.</label>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setIsCompareModalOpen(true)}>Compare Revisions</Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>Back to Edit</Button>
                <Button onClick={submitPublish} disabled={isPublishing || !agreedToAccuracy || !agreedToLegalResponsibility} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50">
                  {isPublishing ? "Publishing..." : "🚀 Confirm & Push Live"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Revisions Dialog */}
      <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileSearch className="text-blue-500 w-6 h-6" />
              Revision Comparison
            </DialogTitle>
            <DialogDescription>
              Side-by-side comparison of the original AI generation vs. your edited draft.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 border rounded-md m-4 bg-white dark:bg-slate-900">
            <ReactDiffViewer
              oldValue={`--- AMAZON TITLE ---
${originalListing?.amazon_title || ""}

--- AMAZON BULLETS ---
${(originalListing?.amazon_bullets || []).join('\n')}

--- AMAZON DESCRIPTION ---
${originalListing?.amazon_description || ""}

--- FLIPKART TITLE ---
${originalListing?.flipkart_title || ""}

--- FLIPKART DESCRIPTION ---
${originalListing?.flipkart_description || ""}
`}
              newValue={`--- AMAZON TITLE ---
${generatedListing?.amazon_title || ""}

--- AMAZON BULLETS ---
${(generatedListing?.amazon_bullets || []).join('\n')}

--- AMAZON DESCRIPTION ---
${generatedListing?.amazon_description || ""}

--- FLIPKART TITLE ---
${generatedListing?.flipkart_title || ""}

--- FLIPKART DESCRIPTION ---
${generatedListing?.flipkart_description || ""}
`}
              splitView={true}
              useDarkTheme={false}
              leftTitle="Original AI Output"
              rightTitle="Your Edited Draft"
              hideLineNumbers={true}
              showDiffOnly={false}
              styles={{
                contentText: {
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.5'
                },
                titleBlock: {
                  fontWeight: 'bold',
                  textAlign: 'center'
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setIsCompareModalOpen(false)}>Close Comparison</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-up Dialog */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
              Top-up SKU Credits
            </DialogTitle>
            <DialogDescription>
              Purchase SKU credits to instantly generate and publish SEO-optimized product listings. Slide to adjust volume.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const basePricePerSku = 40;
            const getDiscountInfo = (credits: number) => {
              if (credits >= 500) return { percent: 25, label: "25% OFF", theme: "from-green-500 to-emerald-600", border: "border-emerald-500", text: "text-emerald-600", nextTier: null };
              if (credits >= 200) return { percent: 15, label: "15% OFF", theme: "from-teal-400 to-green-500", border: "border-green-400", text: "text-green-600", nextTier: 500 };
              if (credits >= 50) return { percent: 10, label: "10% OFF", theme: "from-cyan-500 to-teal-500", border: "border-teal-400", text: "text-teal-600", nextTier: 200 };
              return { percent: 0, label: "Base Price", theme: "from-indigo-400 to-cyan-500", border: "border-indigo-300", text: "text-indigo-600", nextTier: 50 };
            };

            const discountInfo = getDiscountInfo(topUpCredits);
            const discountMultiplier = (100 - discountInfo.percent) / 100;
            const finalPrice = Math.round(topUpCredits * basePricePerSku * discountMultiplier);
            const originalPrice = topUpCredits * basePricePerSku;
            const savings = originalPrice - finalPrice;
            const fillPercentage = (topUpCredits / 10000) * 100;

            return (
              <div className="py-4 flex flex-col gap-6">

                {/* Display and Slider */}
                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center mb-6">
                    <span className={`text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${discountInfo.theme}`}>{topUpCredits.toLocaleString()}</span>
                    <span className="text-xl text-slate-500 font-semibold mb-2 ml-2 uppercase">Credits</span>
                  </div>

                  <div className="w-full relative px-2 mt-4 group">
                    {/* Custom slider track background */}
                    <div className="absolute top-1/2 left-2 right-2 h-3 -translate-y-1/2 bg-slate-200 rounded-full overflow-hidden pointer-events-none">
                      <div
                        className={`h-full bg-gradient-to-r transition-all duration-300 ${discountInfo.theme}`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                    {/* The actual slider */}
                    <input
                      type="range"
                      min="10"
                      max="10000"
                      step="10"
                      value={topUpCredits}
                      onChange={(e) => setTopUpCredits(parseInt(e.target.value))}
                      className="w-full relative z-10 appearance-none bg-transparent cursor-pointer h-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300 hover:[&::-webkit-slider-thumb]:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="w-full flex justify-between mt-2 px-2">
                    <span className="text-xs text-slate-400 font-medium">50</span>
                    <span className="text-xs text-slate-400 font-medium">10,000 max</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className={`p-5 border-2 rounded-2xl transition-all duration-300 shadow-sm ${discountInfo.border} bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden`}>
                  {discountInfo.percent > 0 && (
                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold text-white bg-gradient-to-r ${discountInfo.theme}`}>
                      {discountInfo.label} Applied
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold text-lg">Total Cost:</span>
                    <div className="text-right flex items-center gap-3">
                      {discountInfo.percent > 0 && (
                        <span className="line-through text-slate-400 font-medium text-lg">₹{originalPrice.toLocaleString('en-IN')}</span>
                      )}
                      <span className={`text-3xl font-extrabold ${discountInfo.text}`}>₹{finalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                    {discountInfo.nextTier ? (
                      <span className="text-sm text-slate-500 font-medium">
                        Add <strong className="text-slate-700 dark:text-slate-300">{discountInfo.nextTier - topUpCredits}</strong> more for the next discount!
                      </span>
                    ) : (
                      <span className="text-sm text-emerald-600 font-bold flex items-center gap-1"><Sparkles className="w-4 h-4" /> Maximum Discount Unlocked!</span>
                    )}

                    {savings > 0 && (
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                        You save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

          <DialogFooter className="mt-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setIsTopUpOpen(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
              onClick={() => {
                const discountInfo = (() => {
                  if (topUpCredits >= 500) return 25;
                  if (topUpCredits >= 200) return 15;
                  if (topUpCredits >= 50) return 10;
                  return 0;
                })();
                const finalPrice = Math.round(topUpCredits * 40 * ((100 - discountInfo) / 100));

                setSelectedCreditPack({
                  id: `custom_${topUpCredits}`,
                  name: `${topUpCredits.toLocaleString()} SKU Credits`,
                  price: finalPrice,
                  description: `Custom package (${discountInfo}% discount applied)`
                });
                setIsPaymentModalOpen(true);
              }}
            >
              Proceed to Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {selectedCreditPack && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
          }}
          plan={selectedCreditPack}
          userId={user?.id || 0}
          userEmail={user?.email}
          userName={user?.name || user?.firstName}
          onPaymentSuccess={() => {
            setIsPaymentModalOpen(false);
            setIsTopUpOpen(false);
            setSelectedCreditPack(null);
            refreshUser();
            toast({
              title: "SKU Credits Added!",
              description: "Your SKU Credits have been successfully topped up.",
            });
          }}
          isCreditMode={true}
        />
      )}
    </div>
  );
}
