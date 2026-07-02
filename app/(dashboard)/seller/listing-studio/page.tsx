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
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Image as ImageIcon, Send, AlertCircle, ShoppingCart } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function ListingStudioPage() {
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
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
          image_base64: imageBase64 || undefined
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate");
      
      setGeneratedListing(data.data);
      toast({
        title: "Success!",
        description: "Your optimized listings have been generated.",
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive"
      });
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

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-500 w-8 h-8" /> 
            AI Listing Studio
          </h1>
          <p className="text-slate-500 mt-2">Generate perfect Amazon and Flipkart listings in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Raw Product Data</CardTitle>
              <CardDescription>Tell us what you are selling in plain English.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Image (Required for Verification)</Label>
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden"
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
                    <>
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm text-center">Click to upload image<br/>(AI will automatically analyze it)</span>
                    </>
                  )}
                </div>
                {imagePreview && (
                  <Button variant="ghost" size="sm" onClick={() => { setImagePreview(""); setImageBase64(""); }} className="w-full text-red-500 hover:text-red-600">
                    Remove Image
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>What is the product?</Label>
                <Textarea 
                  placeholder="e.g. A blue stainless steel water bottle, 1 liter, keeps water cold for 24 hours, has a bamboo lid."
                  className="min-h-[150px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Generating Magic..." : "Generate Listings"}
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-8">
          {!generatedListing ? (
            <Card className="h-full flex items-center justify-center min-h-[400px] border-dashed bg-slate-50/50">
              <div className="text-center text-slate-500 flex flex-col items-center">
                <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg text-slate-700">Awaiting your product</h3>
                <p className="max-w-xs text-sm mt-2">Enter your product details on the left to see the AI magic.</p>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="amazon" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="amazon">Amazon Preview</TabsTrigger>
                  <TabsTrigger value="flipkart">Flipkart Preview</TabsTrigger>
                </TabsList>
                <Button 
                  onClick={() => handlePublishClick('both')} 
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold hover:shadow-lg transition-all"
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
    </div>
  );
}
