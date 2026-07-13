"use client";

import { useState } from "react";
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
import { Sparkles, Image as ImageIcon, Send, AlertCircle, ShoppingCart, ArrowRight, FileText, Type, List, FileSearch, Hash, LineChart, Clock, Check, Lock, Wallet } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import PaymentModal, { type PaymentPlan } from "@/components/payment/payment-modal";

const CREDIT_PACKS: Record<string, PaymentPlan[]> = {
  enterprise: [
    { id: "ai_credits_100", name: "100 SKU Credits", price: 4000, description: "Generate & Publish 100 SKUs (₹40/SKU)" },
    { id: "ai_credits_500", name: "500 SKU Credits", price: 20000, description: "Generate & Publish 500 SKUs (₹40/SKU)" },
    { id: "ai_credits_1000", name: "1,000 SKU Credits", price: 40000, description: "High-volume cataloging (₹40/SKU)" },
    { id: "ai_credits_5000", name: "5,000 SKU Credits", price: 200000, description: "Maximum enterprise volume (₹40/SKU)" },
  ]
};

export default function ListingStudioPage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useHinglish, setUseHinglish] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCreditPack, setSelectedCreditPack] = useState<PaymentPlan | null>(null);
  
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
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
  const { toast } = useToast();

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
    
    if (!imageBase64) {
      toast({
        title: "Image Required",
        description: "Please upload a product image. Our AI requires visual verification.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listing-agent/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          raw_description: description,
          image_base64: imageBase64 || undefined,
          use_hinglish: useHinglish
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate");
      
      setGeneratedListing({ ...data.data, id: data.listing_id });
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
          description: err.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    setImagePreview(URL.createObjectURL(file));

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      // Result is something like "data:image/jpeg;base64,/9j/4AAQSkZJR..."
      // We will send the full string so the backend can extract the base64 part
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!imageBase64) return;
    setIsRemovingBg(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/listing-agent/remove-background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image_base64: imageBase64 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to remove background");
      
      setImageBase64(data.image_base64);
      setImagePreview(data.image_base64);
      toast({ title: "Success", description: "Background removed for Amazon compliance." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
          product_id_type: data.product_id_type
        })
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(`${platform.toUpperCase()}: ${responseData.detail || "Failed"}`);
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
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center text-slate-500 flex justify-center items-center h-[50vh]"><Clock className="animate-spin w-8 h-8 text-blue-500" /></div>;

  const isNonEnterprise = user?.subscriptionTier !== "enterprise";
  // === SANDBOX TESTING ===
  // Forcing 999 credits for testing UI
  const credits = 999; // user?.aiCreditsBalance || 0;
  
  if (isNonEnterprise) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
          <Lock className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
          Enterprise Exclusive Feature
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mb-8">
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900 flex items-center gap-3">
            <Sparkles className="text-blue-600 w-10 h-10 drop-shadow-sm" /> 
            One-Click Cataloger
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">Upload a single product photo and instantly auto-generate your complete Amazon & Flipkart catalog.</p>
        </div>
        
        {/* Wallet Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">SKU Credits</p>
            <p className="text-xl font-bold text-slate-900">{credits} Remaining</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsTopUpOpen(true)} className="ml-2 font-semibold">
            Top-up
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Raw Product Data</CardTitle>
              <CardDescription className="text-[15px] text-slate-500 mt-1">Tell us what you are selling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="font-semibold text-slate-700">Product Image (Required for Verification)</Label>
                <div 
                  className="border-2 border-dashed border-indigo-100 rounded-xl p-8 flex flex-col items-center justify-center bg-white hover:bg-indigo-50/30 transition-colors cursor-pointer relative overflow-hidden group"
                  onClick={() => document.getElementById("imageUpload")?.click()}
                >
                  <input 
                    id="imageUpload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-slate-50" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Click to upload image</span>
                      <span className="text-xs text-slate-400 mt-1">(AI will automatically analyze it)</span>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <div className="flex flex-col gap-1 w-full mt-2">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveBackground} 
                        disabled={isRemovingBg} 
                        className="flex-1 text-slate-700 hover:text-slate-900 border-slate-300"
                      >
                        {isRemovingBg ? "Cleaning Image..." : "✨ Auto-Remove Background"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setImagePreview(""); setImageBase64(""); }} 
                        className="text-red-500 hover:text-red-600 px-3"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center px-2 leading-tight">
                      *Note: If your product photo already has a pure white background, do not click this button.
                    </p>
                  </div>
                )}
              </div>
                           <div className="space-y-3">
                <Label className="font-semibold text-slate-700">What is the product?</Label>
                <Textarea 
                  placeholder="e.g. A blue stainless steel water bottle, 1 liter, keeps water cold for 24 hours, has a bamboo lid."
                  className="min-h-[140px] resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <Label htmlFor="hinglish-mode" className="text-sm font-medium text-slate-700 leading-tight">
                  Optimize for Tier-2/3 Indian<br/>Cities (Hinglish Keywords)
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
                disabled={isGenerating || (!description && !imageBase64)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-xl shadow-sm transition-all"
              >
                {isGenerating ? "Generating..." : "Generate Listings"}
                {!isGenerating && <Sparkles className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          {!generatedListing ? (
            <div className="flex flex-col gap-6 bg-slate-50/50 rounded-3xl border border-slate-100 p-8 h-full">
              {/* Header */}
              <div className="text-center mb-6 mt-4">
                <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
                  Let our Smart Engine build your Amazon & Flipkart catalog <Sparkles className="w-7 h-7 text-blue-600 drop-shadow-sm" />
                </h2>
                <p className="text-slate-500 font-medium mt-3">Just 3 simple steps to fully optimize your catalog</p>
              </div>

              {/* 3 Steps */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 mb-4">
                {/* Step 1 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 bg-white relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">1</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 mt-2">
                      <ImageIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px]">Upload Product Image</h4>
                    <p className="text-xs text-slate-500 mt-2.5 max-w-[180px] leading-relaxed">Upload a clear image of your product so our Smart Engine can understand it better.</p>
                  </CardContent>
                </Card>

                <ArrowRight className="w-6 h-6 text-indigo-300 mx-2 flex-shrink-0 rotate-90 md:rotate-0" />

                {/* Step 2 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 bg-white relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">2</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 mt-2">
                      <Sparkles className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px]">Describe Your Product</h4>
                    <p className="text-xs text-slate-500 mt-2.5 max-w-[180px] leading-relaxed">Tell us key details about your product like features, material, benefits, etc.</p>
                  </CardContent>
                </Card>

                <ArrowRight className="w-6 h-6 text-emerald-300 mx-2 flex-shrink-0 rotate-90 md:rotate-0" />

                {/* Step 3 */}
                <Card className="flex-1 w-full md:w-auto rounded-2xl shadow-sm border-slate-100 bg-white relative overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs absolute top-4 left-4">3</div>
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 mt-2">
                      <FileText className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px]">Auto-Generate Your Listing</h4>
                    <p className="text-xs text-slate-500 mt-2.5 max-w-[180px] leading-relaxed">Our Smart Engine will instantly generate a high-converting catalog for you.</p>
                  </CardContent>
                </Card>
              </div>

              {/* What AI Generates */}
              <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
                <div className="bg-slate-50/50 py-3 text-center border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800">What our Smart Engine generates for you</h4>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-between items-center max-w-3xl mx-auto px-4 gap-6 lg:gap-2">
                    {[
                      { icon: Type, label: "SEO Optimized\nTitle" },
                      { icon: List, label: "Key Feature\nBullets" },
                      { icon: FileSearch, label: "HTML\nDescription" },
                      { icon: Hash, label: "Hidden\nSearch Terms" },
                      { icon: Sparkles, label: "Premium A+\nContent", color: "text-amber-500", bg: "bg-amber-50" },
                      { icon: ShoppingCart, label: "Amazon & Flipkart\nReady", color: "text-blue-500", bg: "bg-blue-50" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full ${item.bg || 'bg-blue-50'} flex items-center justify-center mb-3 shadow-sm border border-slate-50`}>
                          <item.icon className={`w-6 h-6 ${item.color || 'text-blue-600'}`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 whitespace-pre-line leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Footer Cards */}
              <div className="flex flex-col md:flex-row gap-6 mt-2">
                <Card className="flex-1 border-slate-100 shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-7">
                    <h4 className="font-bold text-sm text-slate-800 mb-5">Why sellers love it</h4>
                    <ul className="space-y-3.5">
                      {[
                        "Save ₹450+ per SKU vs. traditional cataloging agencies",
                        "Go live in 20 seconds instead of waiting 3-5 days",
                        "Zero back-and-forth emails or manual data entry",
                        "Maximize organic visibility with perfectly tuned SEO"
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" strokeWidth={3} />
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex-1 border-slate-100 shadow-sm bg-white rounded-2xl flex items-center">
                  <CardContent className="p-7 flex items-start gap-5 w-full">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100/50 mt-1">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-800 uppercase tracking-wide">Estimated generation time</h4>
                      <div className="text-3xl font-black text-slate-800 my-2">10-20 seconds</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed pr-4">It usually takes less than 20 seconds to generate your complete listing.</p>
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
                  <TabsTrigger value="aplus" className="bg-gradient-to-r from-amber-200 to-orange-300 text-amber-900 font-semibold data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white w-full">✨ A+ Content</TabsTrigger>
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
                <Card className="border-orange-200 shadow-sm">
                  <CardHeader className="bg-orange-50/50 pb-4 border-b border-orange-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-orange-900">Amazon Listing</CardTitle>
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
                      <Label className="text-xs font-bold text-slate-400 uppercase">Title</Label>
                      <Textarea 
                        className="text-lg font-medium text-slate-900 resize-none min-h-[60px]" 
                        value={generatedListing.amazon_title} 
                        onChange={(e) => setGeneratedListing({...generatedListing, amazon_title: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase">About this item</Label>
                      <div className="space-y-2">
                        {(generatedListing.amazon_bullets || []).map((bullet: string, i: number) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="mt-2 text-slate-400">•</span>
                            <Textarea 
                              className="text-slate-700 text-sm resize-none min-h-[60px]" 
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...generatedListing.amazon_bullets];
                                newBullets[i] = e.target.value;
                                setGeneratedListing({...generatedListing, amazon_bullets: newBullets});
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-xs font-bold text-slate-400 uppercase">Product Description (HTML)</Label>
                      <Textarea 
                        className="font-mono text-xs text-slate-600 min-h-[150px]"
                        value={generatedListing.amazon_description || ""}
                        onChange={(e) => setGeneratedListing({...generatedListing, amazon_description: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <Label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Backend Search Terms (Hidden)
                      </Label>
                      <Textarea 
                        className="text-sm font-mono text-slate-600 min-h-[60px]"
                        value={generatedListing.amazon_search_terms}
                        onChange={(e) => setGeneratedListing({...generatedListing, amazon_search_terms: e.target.value})} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Flipkart Tab */}
              <TabsContent value="flipkart">
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-blue-900">Flipkart Listing</CardTitle>
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
                      <Label className="text-xs font-bold text-slate-400 uppercase">Title</Label>
                      <Textarea 
                        className="text-xl font-medium text-slate-900 resize-none min-h-[60px]"
                        value={generatedListing.flipkart_title}
                        onChange={(e) => setGeneratedListing({...generatedListing, flipkart_title: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-xs font-bold text-slate-400 uppercase">Product Details</Label>
                      <Textarea 
                        className="text-slate-600 text-sm min-h-[100px]"
                        value={generatedListing.flipkart_description}
                        onChange={(e) => setGeneratedListing({...generatedListing, flipkart_description: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* A+ Content Tab */}
              <TabsContent value="aplus">
                <Card className="border-amber-200 shadow-sm">
                  <CardHeader className="bg-amber-50/50 pb-4 border-b border-amber-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-amber-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          Premium A+ Content & Rich Description
                        </CardTitle>
                        <CardDescription>Visually engaging modules for Amazon & Flipkart</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="bg-amber-100/50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold mb-1">💡 How to use this:</p>
                        <p>A+ Content (Amazon) and Rich Catalog (Flipkart) are visual upgrades added AFTER your standard product is published. Once you hit <b>Publish to Both</b> above, wait for the listing to go live. Then, copy and paste this text into the respective A+ Builders alongside your lifestyle photos.</p>
                      </div>
                    </div>
                    
                    {generatedListing?.a_plus_content ? (
                      <div className="space-y-6">
                        {/* Brand Story */}
                        <div className="space-y-2 border-b pb-4">
                          <Label className="text-xs font-bold text-slate-400 uppercase">Brand Story Hook</Label>
                          <div className="flex gap-2">
                            <Textarea 
                              readOnly
                              className="text-slate-700 min-h-[60px]"
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
                          <Label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                            <span>Feature Module 1</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_1_headline} className="font-semibold text-slate-900" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_1_headline);
                                toast({ title: "Copied!", description: "Headline copied." });
                              }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_1_body} className="text-slate-600 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_1_body);
                                toast({ title: "Copied!", description: "Body text copied." });
                              }}>Copy</Button>
                          </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-2 border-b pb-4">
                          <Label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                            <span>Feature Module 2</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_2_headline} className="font-semibold text-slate-900" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_2_headline);
                                toast({ title: "Copied!", description: "Headline copied." });
                              }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_2_body} className="text-slate-600 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_2_body);
                                toast({ title: "Copied!", description: "Body text copied." });
                              }}>Copy</Button>
                          </div>
                        </div>
                        
                        {/* Feature 3 */}
                        <div className="space-y-2 pb-2">
                          <Label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                            <span>Feature Module 3</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input readOnly value={generatedListing.a_plus_content.feature_3_headline} className="font-semibold text-slate-900" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_3_headline);
                                toast({ title: "Copied!", description: "Headline copied." });
                              }}>Copy</Button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Textarea readOnly value={generatedListing.a_plus_content.feature_3_body} className="text-slate-600 min-h-[80px]" />
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(generatedListing.a_plus_content.feature_3_body);
                                toast({ title: "Copied!", description: "Body text copied." });
                              }}>Copy</Button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        A+ Content is generating... please wait a moment.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
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
                {targetPlatform === 'both' && <h3 className="font-semibold text-orange-600 border-b pb-2">Amazon</h3>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input value={amazonCommerceData.sku} onChange={(e) => setAmazonCommerceData({...amazonCommerceData, sku: e.target.value})} placeholder="e.g. BOTTLE-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={amazonCommerceData.quantity} onChange={(e) => setAmazonCommerceData({...amazonCommerceData, quantity: e.target.value})} placeholder="100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input type="number" value={amazonCommerceData.selling_price} onChange={(e) => setAmazonCommerceData({...amazonCommerceData, selling_price: e.target.value})} placeholder="999" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹)</Label>
                    <Input type="number" value={amazonCommerceData.mrp} onChange={(e) => setAmazonCommerceData({...amazonCommerceData, mrp: e.target.value})} placeholder="1499" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Barcode Type</Label>
                    <Select value={amazonCommerceData.product_id_type} onValueChange={(val) => setAmazonCommerceData({...amazonCommerceData, product_id_type: val})}>
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
                    <Input value={amazonCommerceData.product_id} onChange={(e) => setAmazonCommerceData({...amazonCommerceData, product_id: e.target.value})} placeholder={amazonCommerceData.product_id_type === 'GCID' ? 'Optional' : '890123...'} />
                  </div>
                </div>
              </div>
            )}

            {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
              <div className="space-y-4">
                {targetPlatform === 'both' && <h3 className="font-semibold text-blue-600 border-b pb-2">Flipkart</h3>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input value={flipkartCommerceData.sku} onChange={(e) => setFlipkartCommerceData({...flipkartCommerceData, sku: e.target.value})} placeholder="e.g. BOTTLE-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={flipkartCommerceData.quantity} onChange={(e) => setFlipkartCommerceData({...flipkartCommerceData, quantity: e.target.value})} placeholder="100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selling Price (₹)</Label>
                    <Input type="number" value={flipkartCommerceData.selling_price} onChange={(e) => setFlipkartCommerceData({...flipkartCommerceData, selling_price: e.target.value})} placeholder="999" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹)</Label>
                    <Input type="number" value={flipkartCommerceData.mrp} onChange={(e) => setFlipkartCommerceData({...flipkartCommerceData, mrp: e.target.value})} placeholder="1499" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Barcode Type</Label>
                    <Select value={flipkartCommerceData.product_id_type} onValueChange={(val) => setFlipkartCommerceData({...flipkartCommerceData, product_id_type: val})}>
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
                    <Input value={flipkartCommerceData.product_id} onChange={(e) => setFlipkartCommerceData({...flipkartCommerceData, product_id: e.target.value})} placeholder={flipkartCommerceData.product_id_type === 'GCID' ? 'Optional' : '890123...'} />
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
                targetPlatform === 'amazon' ? 'bg-amazon text-black hover:bg-amazon/90' : 
                targetPlatform === 'flipkart' ? 'bg-flipkart text-white hover:bg-flipkart/90' :
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
              <Sparkles className="text-blue-500 w-6 h-6" /> 
              Final Review
            </DialogTitle>
            <DialogDescription>
              Please verify your listing details before we push this live to the marketplace catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 grid gap-6 py-4">
            <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
              {imageBase64 && <img src={imageBase64} className="w-32 h-32 object-contain rounded-md bg-white border shrink-0" />}
              <div className="space-y-4 w-full">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Target Platform</p>
                  <p className="font-bold uppercase text-blue-600">{targetPlatform}</p>
                </div>
                
                {(targetPlatform === 'amazon' || targetPlatform === 'both') && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-orange-500 uppercase border-b pb-1">Amazon Listing Data</p>
                    <h3 className="font-semibold text-slate-800 text-lg">{generatedListing?.amazon_title}</h3>
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                      {(generatedListing?.amazon_bullets || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                    <div className="text-xs text-slate-500 bg-slate-100 p-2 rounded prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: generatedListing?.amazon_description || ""}} />
                    <p className="text-xs font-mono text-slate-400">Search Terms: {generatedListing?.amazon_search_terms}</p>
                  </div>
                )}
                
                {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-blue-500 uppercase border-b pb-1">Flipkart Listing Data</p>
                    <h3 className="font-semibold text-slate-800 text-lg">{generatedListing?.flipkart_title}</h3>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{generatedListing?.flipkart_description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(targetPlatform === 'amazon' || targetPlatform === 'both') && (
                <div className="border rounded-md p-4 bg-orange-50/30">
                  <h4 className="font-bold text-orange-700 mb-2 border-b border-orange-100 pb-2">Amazon Pricing</h4>
                  <ul className="text-sm space-y-1 text-slate-700">
                    <li><span className="font-medium">SKU:</span> {amazonCommerceData.sku}</li>
                    <li><span className="font-medium">Price:</span> ₹{amazonCommerceData.selling_price}</li>
                    <li><span className="font-medium">Quantity:</span> {amazonCommerceData.quantity}</li>
                    <li><span className="font-medium">Barcode:</span> {amazonCommerceData.product_id_type} {amazonCommerceData.product_id || '(Exempt)'}</li>
                  </ul>
                </div>
              )}
              
              {(targetPlatform === 'flipkart' || targetPlatform === 'both') && (
                <div className="border rounded-md p-4 bg-blue-50/30">
                  <h4 className="font-bold text-blue-700 mb-2 border-b border-blue-100 pb-2">Flipkart Pricing</h4>
                  <ul className="text-sm space-y-1 text-slate-700">
                    <li><span className="font-medium">SKU:</span> {flipkartCommerceData.sku}</li>
                    <li><span className="font-medium">Price:</span> ₹{flipkartCommerceData.selling_price}</li>
                    <li><span className="font-medium">Quantity:</span> {flipkartCommerceData.quantity}</li>
                    <li><span className="font-medium">Barcode:</span> {flipkartCommerceData.product_id_type} {flipkartCommerceData.product_id || '(Exempt)'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>Back to Edit</Button>
            <Button onClick={submitPublish} disabled={isPublishing} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all">
              {isPublishing ? "Publishing..." : "🚀 Confirm & Push Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Top-up Dialog */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-indigo-600 w-6 h-6" /> 
              Top-up SKU Credits
            </DialogTitle>
            <DialogDescription>
              Purchase SKU credits to instantly generate and publish SEO-optimized product listings. 1 Credit = 1 SKU generated & published.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2">
            {(CREDIT_PACKS[user?.subscriptionTier || "basic"] || CREDIT_PACKS["basic"]).map((pack) => (
              <div 
                key={pack.id} 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-center ${
                  selectedCreditPack?.id === pack.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedCreditPack(pack)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-base text-slate-800 leading-tight">{pack.name}</h4>
                  <span className="font-bold text-indigo-700 text-base ml-2 shrink-0">₹{pack.price.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-500 text-xs leading-tight mt-1">{pack.description}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTopUpOpen(false)}>Cancel</Button>
            <Button 
              disabled={!selectedCreditPack}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
              onClick={() => {
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
