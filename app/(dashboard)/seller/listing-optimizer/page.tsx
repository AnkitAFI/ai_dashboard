"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Menu,
  Sparkles,
  Crown,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Loader2,
  ShieldAlert,
  ArrowRight,
  History,
  RotateCcw,
  Zap,
  Info,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  ImageIcon,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import SyncPendingBanner from "@/components/seller/sync-pending-banner";

interface ListingItem {
  id: number;
  sku: string;
  asin: string;
  product_type: string;
  title: string;
  title_length: number;
  bullets: string[];
  bullets_count: number;
  description: string;
  backend_search_terms: string;
  main_image_url: string | null;
  health_score: number;
  is_suppressed: boolean;
  suppression_reasons: string[];
  search_term_bytes: number;
  has_title_keyword_overlap: boolean;
  wasted_overlap_words: string[];
  last_synced_at: string | null;
}

interface HistoryRecord {
  id: number;
  sku: string;
  asin: string;
  snapshot_data: {
    title?: string;
    bullets?: string[];
    description?: string;
    backend_search_terms?: string;
  };
  changed_by: string;
  reason: string;
  client_ip: string;
  created_at: string;
}

export default function ListingOptimizerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const { toggle } = useSidebar();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedSpId, setSelectedSpId] = useState<string>("");
  const [accountStatus, setAccountStatus] = useState<string>("");
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  const [summary, setSummary] = useState<any>(null);
  const [items, setItems] = useState<ListingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Drawer / Editor state
  const [activeItem, setActiveItem] = useState<ListingItem | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"copy" | "keywords" | "defects" | "history">("copy");
  const [editTitle, setEditTitle] = useState("");
  const [editBullets, setEditBullets] = useState<string[]>(["", "", "", "", ""]);
  const [editDescription, setEditDescription] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [isPatching, setIsPatching] = useState(false);

  // History & Rollback
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Non-repudiation confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingPatchPayload, setPendingPatchPayload] = useState<any>(null);

  // New Listing Creator Studio Modal
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [creatorStep, setCreatorStep] = useState(1);
  const [creatorCategory, setCreatorCategory] = useState("SHIRT");
  const [creatorSku, setCreatorSku] = useState("");
  const [creatorBrand, setCreatorBrand] = useState("");
  const [creatorBarcodeType, setCreatorBarcodeType] = useState("ean");
  const [creatorBarcodeValue, setCreatorBarcodeValue] = useState("");
  const [creatorTitle, setCreatorTitle] = useState("");
  const [creatorBullets, setCreatorBullets] = useState<string[]>(["", "", "", "", ""]);
  const [creatorDesc, setCreatorDesc] = useState("");
  const [creatorKeywords, setCreatorKeywords] = useState("");
  const [creatorPrice, setCreatorPrice] = useState(799);
  const [creatorQty, setCreatorQty] = useState(50);
  const [creatorImageUrl, setCreatorImageUrl] = useState("");
  const [creatorImageFile, setCreatorImageFile] = useState<File | null>(null);
  const [creatorImagePreview, setCreatorImagePreview] = useState<string>("");
  const [creatorImageMeta, setCreatorImageMeta] = useState<{ width?: number; height?: number; filename?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
    fetchAccounts();
  }, []);

  useEffect(() => {
    const tier = user?.subscriptionTier || "free";
    setIsPremium(tier === "premium" || tier === "enterprise" || tier === "trial");
  }, [user]);

  useEffect(() => {
    if (selectedSpId) {
      fetchCatalogData(selectedSpId);
    }
  }, [selectedSpId]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts && data.accounts.length > 0) {
          setAccountStatus(data.accounts[0].sync_status || "");
          setConnectedAt(data.accounts[0].connected_at || null);
          setSelectedSpId(data.accounts[0].selling_partner_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogData = async (spId: string) => {
    setLoading(true);
    try {
      const [sumRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${spId}/summary`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${spId}/items`, { credentials: "include" })
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (itemsRes.ok) {
        const d = await itemsRes.json();
        setItems(d.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (item: ListingItem) => {
    setActiveItem(item);
    setEditTitle(item.title || "");
    const existingB = item.bullets || [];
    setEditBullets([
      existingB[0] || "",
      existingB[1] || "",
      existingB[2] || "",
      existingB[3] || "",
      existingB[4] || ""
    ]);
    setEditDescription(item.description || "");
    setEditKeywords(item.backend_search_terms || "");
    setActiveDrawerTab("copy");
    loadHistory(item.sku);
  };

  const loadHistory = async (sku: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${selectedSpId}/items/${sku}/history`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Strip duplicate words that are already in the Title
  const stripDuplicateKeywords = () => {
    if (!editTitle || !editKeywords) return;
    const titleWords = new Set(
      editTitle.toLowerCase().match(/\b[a-zA-Z0-9]{3,}\b/g) || []
    );
    const searchWords = editKeywords.match(/\b[a-zA-Z0-9]{3,}\b/g) || [];
    const filtered = searchWords.filter(w => !titleWords.has(w.toLowerCase()));
    const newKeywords = Array.from(new Set(filtered)).join(" ");
    setEditKeywords(newKeywords);
    toast({
      title: "Keywords Cleaned",
      description: "Removed words already present in your Product Title. Reclaimed valuable keyword space!"
    });
  };

  const initiatePatch = () => {
    // Search terms character limit validation
    const byteLen = new TextEncoder().encode(editKeywords).length;
    if (byteLen > 250) {
      toast({
        title: "Keyword Limit Exceeded",
        description: `Search keywords must stay within the 250-character limit. Currently: ${byteLen}.`,
        variant: "destructive"
      });
      return;
    }

    setPendingPatchPayload({
      title: editTitle,
      bullets: editBullets,
      description: editDescription,
      backend_search_terms: editKeywords,
      user_confirmed: true
    });
    setIsConfirmModalOpen(true);
  };

  const executeLivePatch = async () => {
    if (!activeItem || !pendingPatchPayload) return;
    setIsPatching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${selectedSpId}/items/${activeItem.sku}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(pendingPatchPayload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Amazon rejected the listing update.");
      }

      toast({
        title: "✓ Listing Updated",
        description: `Successfully saved changes for SKU: ${activeItem.sku} to your Amazon store.`
      });

      setIsConfirmModalOpen(false);
      setActiveItem(null);
      fetchCatalogData(selectedSpId);
    } catch (e: any) {
      toast({
        title: "Update Failed",
        description: e.message || "Failed to update listing on Amazon.",
        variant: "destructive"
      });
    } finally {
      setIsPatching(false);
    }
  };

  const executeRollback = async (historyId: number) => {
    if (!activeItem) return;
    setIsPatching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/amazon-sp-api/listings/${selectedSpId}/items/${activeItem.sku}/rollback/${historyId}`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to restore previous version.");
      }

      toast({
        title: "⏪ Version Restored",
        description: `Successfully restored version #${historyId} to your Amazon store.`
      });

      setActiveItem(null);
      fetchCatalogData(selectedSpId);
    } catch (e: any) {
      toast({
        title: "Restore Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setIsPatching(false);
    }
  };

  const handlePublishNewProduct = async () => {
    if (!creatorSku || !creatorTitle || !creatorBrand) {
      toast({ title: "Missing Required Fields", description: "SKU, Title, and Brand Name are mandatory.", variant: "destructive" });
      return;
    }

    const byteLen = new TextEncoder().encode(creatorKeywords).length;
    if (byteLen > 250) {
      toast({ title: "Keyword Limit Exceeded", description: `Search keywords exceed the 250-character limit (Current: ${byteLen}).`, variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${selectedSpId}/publish/${creatorSku}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sku: creatorSku,
          product_type: creatorCategory,
          brand: creatorBrand,
          title: creatorTitle,
          bullets: creatorBullets.filter(b => b.trim()),
          description: creatorDesc,
          backend_search_terms: creatorKeywords,
          price: creatorPrice,
          initial_quantity: creatorQty,
          barcode_type: creatorBarcodeType,
          barcode_value: creatorBarcodeValue || null,
          main_image_url: creatorImageUrl || null,
          user_confirmed: true
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Amazon rejected new listing creation.");
      }

      toast({
        title: "🎉 Listing Published!",
        description: `Successfully submitted SKU ${creatorSku} to Amazon! Your product is being added to your catalog.`
      });

      setIsCreatorOpen(false);
      setCreatorStep(1);
      fetchCatalogData(selectedSpId);
    } catch (e: any) {
      toast({ title: "Creation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, PNG, or WEBP product photo.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Product image must be less than 10 MB.",
        variant: "destructive"
      });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setCreatorImagePreview(localUrl);
    setCreatorImageFile(file);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (creatorSku) formData.append("sku", creatorSku);

      const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/listings/${selectedSpId}/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to upload image from device.");
      }

      const data = await res.json();
      setCreatorImageUrl(data.public_url);
      setCreatorImageMeta({
        width: data.width,
        height: data.height,
        filename: data.filename
      });

      toast({
        title: "✓ Photo Uploaded",
        description: `Successfully uploaded ${data.filename} (${data.width} × ${data.height} pixels).`
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Could not upload image from your device.",
        variant: "destructive"
      });
      setCreatorImageUrl("");
      setCreatorImagePreview("");
      setCreatorImageFile(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveUploadedImage = () => {
    setCreatorImageUrl("");
    setCreatorImagePreview("");
    setCreatorImageFile(null);
    setCreatorImageMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!mounted) return null;

  // Filter items
  const filteredItems = items.filter(item => {
    const qMatch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!qMatch) return false;
    if (filterType === "SUPPRESSED") return item.is_suppressed;
    if (filterType === "KEYWORD_WASTE") return item.has_title_keyword_overlap;
    if (filterType === "LOW_SCORE") return item.health_score < 70;
    return true;
  });

  const keywordByteLength = new TextEncoder().encode(editKeywords).length;
  const titleWordsInEdit = new Set((editTitle.toLowerCase().match(/\b[a-zA-Z0-9]{3,}\b/g) || []));
  const editKeywordWords = editKeywords.match(/\b[a-zA-Z0-9]{3,}\b/g) || [];
  const activeOverlaps = Array.from(new Set(editKeywordWords.filter(w => titleWordsInEdit.has(w.toLowerCase()))));

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12">
      {/* Header */}
      <header className={`bg-transparent border-b pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-violet-900/50' : 'bg-gradient-to-br from-indigo-100 to-violet-100'}`}>
            <Sparkles className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h1 className="page-title">Listing Optimizer & Studio</h1>
            <p className="page-subtitle">Fix hidden products, improve search keywords, and publish new items directly to Amazon.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accounts.length > 1 ? (
            <select
              value={selectedSpId}
              onChange={(e) => setSelectedSpId(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              {accounts.map(acc => (
                <option key={acc.selling_partner_id} value={acc.selling_partner_id}>
                  Store: {acc.selling_partner_id.substring(0, 8)}... ({acc.region})
                </option>
              ))}
            </select>
          ) : accounts.length === 1 ? (
            <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
              Store: {accounts[0].selling_partner_id.substring(0, 8)}...
            </div>
          ) : null}

          {isPremium && (
            <Button
              onClick={() => {
                setCreatorStep(1);
                handleRemoveUploadedImage();
                setIsCreatorOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create New Listing
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      {accounts.length === 0 ? (
        <Card className={`mt-8 rounded-2xl border border-dashed relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <AlertTriangle className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Store Not Connected</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your Amazon Seller account to start optimizing product copy, detecting search suppressions, and publishing new listings.
            </p>
            <Button onClick={() => window.location.href = '/seller/store'} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-full">
              Connect Seller Account
            </Button>
          </CardContent>
        </Card>
      ) : !isPremium ? (
        /* STRICT TIER GATING: Full Page Premium Lock Card */
        <Card className={`mt-8 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-900/50' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100'}`}>
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-100'}`}>
              <Crown className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
              Listing Optimizer & Studio Locked
            </h2>
            <p className="text-muted-foreground max-w-lg mb-2 text-base">
              Upgrade to <b>Premium</b> or <b>Enterprise</b> to unlock the complete Amazon Listing Optimizer:
            </p>
            <ul className={`text-sm mb-8 space-y-2 text-left max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Automatic Search Suppression Alerts</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Search Keywords Capacity Tracker &amp; Duplicate Word Cleaner</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> 1-Click Version History &amp; Instant Undo</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Step-by-Step New Product Creator with Direct Amazon Publishing</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Complete Safe Activity History &amp; Change Tracking</li>
            </ul>
            <Button
              onClick={() => window.location.href = '/subscription'}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-base px-8 py-5 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Upgrade to Premium — ₹2,999/mo
            </Button>
          </CardContent>
        </Card>
      ) : accountStatus === "PENDING" ? (
        <SyncPendingBanner
          connectedAt={connectedAt}
          syncStatus={accountStatus}
          featureName="catalog listing data"
          pollFn={async () => {
            const res = await fetch(`${API_BASE_URL}/api/amazon-sp-api/status`, { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              return data.accounts?.[0]?.sync_status || "PENDING";
            }
            return "PENDING";
          }}
          onSyncComplete={() => fetchAccounts()}
        />
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Listing Quality Score</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`text-3xl font-bold ${(summary?.average_health_score || 0) >= 80 ? 'text-emerald-500' : (summary?.average_health_score || 0) >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                    {summary?.average_health_score || 0}
                  </h3>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Hidden from Search</p>
                <h3 className="text-3xl font-bold text-red-500">
                  {summary?.suppressed_count || 0} <span className="text-sm font-normal text-muted-foreground">Products</span>
                </h3>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Wasted Search Keywords</p>
                <h3 className="text-3xl font-bold text-amber-500">
                  {summary?.keyword_waste_count || 0} <span className="text-sm font-normal text-muted-foreground">Products</span>
                </h3>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl border-none shadow-sm ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Fully Optimized Products</p>
                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary?.optimized_count || 0} <span className="text-sm font-normal text-muted-foreground">/ {summary?.total_listings || 0}</span>
                </h3>
              </CardContent>
            </Card>
          </div>

          {/* Product Quality Table */}
          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Product Listing Quality</CardTitle>
                  <CardDescription>All your active Amazon products analyzed against Amazon search visibility and quality standards.</CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search product name, ASIN or SKU..."
                      className="pl-9 rounded-full h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className={`h-9 px-3 rounded-full border text-sm font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="ALL">All Listings</option>
                    <option value="SUPPRESSED">Hidden from Search</option>
                    <option value="KEYWORD_WASTE">Repeated Keywords</option>
                    <option value="LOW_SCORE">Needs Improvement (&lt;70)</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={`text-xs uppercase bg-muted/40 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Quality Score</th>
                    <th className="px-6 py-4">Title Length</th>
                    <th className="px-6 py-4">Key Features</th>
                    <th className="px-6 py-4">Search Keywords</th>
                    <th className="px-6 py-4">Amazon Visibility</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map(item => (
                    <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${item.is_suppressed ? (isDark ? 'bg-red-950/20' : 'bg-red-50/50') : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.main_image_url ? (
                            <img src={item.main_image_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              No Photo
                            </div>
                          )}
                          <div className="max-w-xs">
                            <div className="font-bold text-xs text-blue-600 dark:text-blue-400">{item.asin} • SKU: {item.sku}</div>
                            <div className="text-xs text-foreground truncate font-medium mt-0.5" title={item.title}>
                              {item.title || "No Title Provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${item.health_score >= 80 ? 'text-emerald-500' : item.health_score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {item.health_score} / 100
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.title_length >= 100 && item.title_length <= 200 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                          {item.title_length} characters
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.bullets_count >= 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                          {item.bullets_count} / 5 Points
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-xs font-semibold ${item.search_term_bytes > 250 ? 'text-red-500' : 'text-foreground'}`}>
                            {item.search_term_bytes} / 250
                          </span>
                          {item.has_title_keyword_overlap && (
                            <div className="text-[11px] text-amber-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{item.wasted_overlap_words.length} repeated words</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.is_suppressed ? (
                          <Badge variant="destructive" className="gap-1 font-bold">
                            <ShieldAlert className="w-3 h-3" /> HIDDEN ON AMAZON
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300">
                            Active &amp; Visible
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => openEditor(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold"
                        >
                          Improve Listing
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /> : "No listings found matching your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Optimization Slide-Out Drawer Dialog */}
      {activeItem && (
        <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
          <DialogContent className={`max-w-4xl p-6 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> Improve Listing: {activeItem.sku}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    ASIN: {activeItem.asin} • Listing Quality Score: <span className="font-bold text-foreground">{activeItem.health_score}/100</span>
                  </DialogDescription>
                </div>
              </div>
              {/* Tab Selector */}
              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant={activeDrawerTab === "copy" ? "default" : "outline"}
                  onClick={() => setActiveDrawerTab("copy")}
                  className="rounded-full text-xs"
                >
                  Title &amp; Features
                </Button>
                <Button
                  size="sm"
                  variant={activeDrawerTab === "keywords" ? "default" : "outline"}
                  onClick={() => setActiveDrawerTab("keywords")}
                  className="rounded-full text-xs"
                >
                  🔑 Search Keywords
                </Button>
                <Button
                  size="sm"
                  variant={activeDrawerTab === "defects" ? "default" : "outline"}
                  onClick={() => setActiveDrawerTab("defects")}
                  className="rounded-full text-xs"
                >
                  Listing Issues ({activeItem.suppression_reasons.length})
                </Button>
                <Button
                  size="sm"
                  variant={activeDrawerTab === "history" ? "default" : "outline"}
                  onClick={() => setActiveDrawerTab("history")}
                  className="rounded-full text-xs"
                >
                  <History className="w-3.5 h-3.5 mr-1" /> Version History ({historyList.length})
                </Button>
              </div>
            </DialogHeader>

            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-5">
              {activeDrawerTab === "copy" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold">Product Title</label>
                      <span className={editTitle.length >= 100 && editTitle.length <= 200 ? 'text-emerald-500 font-semibold' : 'text-amber-500'}>
                        {editTitle.length} / 200 characters (Ideal: 150 to 200)
                      </span>
                    </div>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Brand + Material + Defining Feature + Color/Size"
                      className="text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="font-bold text-xs">5 Key Product Feature Points</label>
                    {editBullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                        <Input
                          value={bullet}
                          onChange={(e) => {
                            const updated = [...editBullets];
                            updated[idx] = e.target.value;
                            setEditBullets(updated);
                          }}
                          placeholder={`Feature Point #${idx + 1}: Key benefit & specification`}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-xs">Product Description</label>
                    <Textarea
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Detailed product story, specifications, and warranty information..."
                      className="text-xs"
                    />
                  </div>
                </>
              )}

              {activeDrawerTab === "keywords" && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${keywordByteLength > 250 ? 'border-red-500 bg-red-500/10' : 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">Amazon Search Keywords Capacity</span>
                      <span className={`font-bold text-xs ${keywordByteLength > 250 ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {keywordByteLength} / 250 characters used
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${keywordByteLength > 250 ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(100, (keywordByteLength / 250) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {activeOverlaps.length > 0 && (
                    <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 text-xs space-y-2">
                      <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Detected {activeOverlaps.length} Repeated Words from Title
                      </div>
                      <p className="text-muted-foreground">
                        Amazon already matches customer searches with words in your product title! The words <b>[{activeOverlaps.join(", ")}]</b> are repeating title words and taking up valuable keyword space.
                      </p>
                      <Button size="sm" onClick={stripDuplicateKeywords} className="rounded-full text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">
                        ⚡ Remove Repeated Words
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="font-bold text-xs">Search Keywords (Space-separated)</label>
                    <Textarea
                      rows={4}
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      placeholder="casual formal office travel breathable comfortable..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {activeDrawerTab === "defects" && (
                <div className="space-y-3">
                  {activeItem.suppression_reasons.length > 0 ? (
                    activeItem.suppression_reasons.map((reason, i) => (
                      <div key={i} className="p-4 rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-red-700 dark:text-red-400">{reason}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Amazon has hidden this product from customer searches because of this issue. Update the details and save changes to make your product visible to buyers again.
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold">No active issues found on Amazon. Your product is visible and buyable.</p>
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === "history" && (
                <div className="space-y-3">
                  {loadingHistory ? (
                    <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></div>
                  ) : historyList.length > 0 ? (
                    historyList.map(h => (
                      <div key={h.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">Saved Version from {new Date(h.created_at).toLocaleString()}</span>
                          <Button size="sm" variant="outline" onClick={() => executeRollback(h.id)} disabled={isPatching} className="rounded-full text-xs gap-1">
                            <RotateCcw className="w-3 h-3" /> Restore this version
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <b>Title:</b> {h.snapshot_data?.title || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <b>Saved by:</b> {h.changed_by || "Store Owner"} • <b>Note:</b> {h.reason}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm py-8 text-muted-foreground">No previous revisions recorded yet for this product.</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-4 flex justify-between items-center">
              <Button variant="ghost" onClick={() => setActiveItem(null)}>Cancel</Button>
              <Button onClick={initiatePatch} disabled={isPatching} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold">
                {isPatching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Save &amp; Update Amazon Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className={isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Confirm Update to Amazon Store
            </DialogTitle>
            <DialogDescription className="text-xs pt-2 leading-relaxed">
              You are about to save changes directly to your active Amazon product listing for <b>SKU: {activeItem?.sku}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold">Summary of changes:</div>
            <div>• Title updated ({editTitle.length} characters)</div>
            <div>• Search Keywords: {new TextEncoder().encode(editKeywords).length} / 250 characters</div>
            <div className="text-muted-foreground pt-2">
              By confirming, you verify that this product information meets Amazon's listing and selling guidelines. Insydz automatically keeps a backup of this update so you can review or undo changes at any time.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
            <Button onClick={executeLivePatch} disabled={isPatching} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {isPatching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm &amp; Save to Amazon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Product Creation Studio Modal (5-Step Stepper) */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent className={`max-w-3xl p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Create New Amazon Listing
            </DialogTitle>
            <DialogDescription>
              Step {creatorStep} of 5: {creatorStep === 1 ? "Product Category & Code" : creatorStep === 2 ? "Brand & Barcode" : creatorStep === 3 ? "Title, Features & Search Keywords" : creatorStep === 4 ? "Price, Stock & Photo" : "Review & Publish"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {creatorStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold">Amazon Product Category</label>
                  <select
                    value={creatorCategory}
                    onChange={(e) => setCreatorCategory(e.target.value)}
                    className={`w-full mt-1 p-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    <option value="SHIRT">Clothing &amp; Apparel (Shirts/Tops)</option>
                    <option value="SHOES">Footwear (Shoes/Sandals)</option>
                    <option value="HEADPHONES">Electronics (Headphones/Audio)</option>
                    <option value="HOME_BED_AND_BATH">Home, Bed &amp; Bath</option>
                    <option value="KITCHEN">Kitchen &amp; Dining</option>
                    <option value="BEAUTY">Beauty &amp; Personal Care</option>
                    <option value="HEALTH_PERSONAL_CARE">Health &amp; Nutrition</option>
                    <option value="BAG">Luggage, Bags &amp; Backpacks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold">Product Code (SKU - Your internal item code)</label>
                  <Input value={creatorSku} onChange={(e) => setCreatorSku(e.target.value)} placeholder="e.g. MENS-SHIRT-COTTON-BLK-L" className="mt-1" />
                </div>
              </div>
            )}

            {creatorStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold">Brand Name</label>
                  <Input value={creatorBrand} onChange={(e) => setCreatorBrand(e.target.value)} placeholder="e.g. YourBrand" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold">Barcode Type</label>
                    <select
                      value={creatorBarcodeType}
                      onChange={(e) => setCreatorBarcodeType(e.target.value)}
                      className={`w-full mt-1 p-2 rounded-lg border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                      <option value="ean">EAN (13 digits)</option>
                      <option value="upc">UPC (12 digits)</option>
                      <option value="gtin">GTIN (14 digits)</option>
                      <option value="exemption">No Barcode (Brand Exemption Approved)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold">Barcode Number</label>
                    <Input
                      disabled={creatorBarcodeType === "exemption"}
                      value={creatorBarcodeValue}
                      onChange={(e) => setCreatorBarcodeValue(e.target.value)}
                      placeholder={creatorBarcodeType === "exemption" ? "Not required (Brand Approved)" : "8901234567890"}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {creatorStep === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label className="font-bold">Product Title</label>
                    <span>{creatorTitle.length} / 200 characters</span>
                  </div>
                  <Input value={creatorTitle} onChange={(e) => setCreatorTitle(e.target.value)} placeholder="Brand + Material + Defining Feature + Color/Size" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold">5 Key Product Feature Points</label>
                  {creatorBullets.map((b, i) => (
                    <Input
                      key={i}
                      value={b}
                      onChange={(e) => {
                        const copy = [...creatorBullets];
                        copy[i] = e.target.value;
                        setCreatorBullets(copy);
                      }}
                      placeholder={`Feature Point #${i + 1}: Key benefit & specification`}
                      className="text-xs"
                    />
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label className="font-bold">Search Keywords (Customer Search Terms)</label>
                    <span className="font-semibold text-indigo-500">{new TextEncoder().encode(creatorKeywords).length} / 250 characters</span>
                  </div>
                  <Textarea
                    rows={3}
                    value={creatorKeywords}
                    onChange={(e) => setCreatorKeywords(e.target.value)}
                    placeholder="Enter keywords separated by space (avoid repeating words from title)..."
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {creatorStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold">Your Price (₹)</label>
                    <Input type="number" value={creatorPrice} onChange={(e) => setCreatorPrice(parseFloat(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Available Stock (Units)</label>
                    <Input type="number" value={creatorQty} onChange={(e) => setCreatorQty(parseInt(e.target.value) || 0)} className="mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5">
                    Main Product Photo (Upload from Device)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />

                  {creatorImageUrl || creatorImagePreview ? (
                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={creatorImagePreview || creatorImageUrl}
                          alt="Product preview"
                          className="w-16 h-16 rounded-lg object-contain bg-white border p-1 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {creatorImageMeta?.filename || "Product Photo Uploaded"}
                          </div>
                          {creatorImageMeta?.width && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Photo Size: {creatorImageMeta.width} × {creatorImageMeta.height} pixels
                              {creatorImageMeta.width >= 1000 ? (
                                <span className="text-emerald-500 font-semibold ml-1.5">✓ Zoom enabled</span>
                              ) : (
                                <span className="text-amber-500 ml-1.5">ℹ️ 1,000 pixels or larger recommended for Amazon zoom</span>
                              )}
                            </div>
                          )}
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Tip: Pure white background recommended for Amazon listings.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="rounded-full text-xs h-8"
                        >
                          Change Photo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveUploadedImage}
                          disabled={isUploadingImage}
                          className="rounded-full text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                        isDark ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50'
                      }`}
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                          <p className="text-xs font-bold">Uploading photo from your device...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-foreground">Click to upload photo from your computer or phone</p>
                          <p className="text-[11px] text-muted-foreground mt-1">Supports JPG, PNG, or WEBP photos (under 10 MB)</p>
                          <p className="text-[11px] text-indigo-500 font-medium mt-1">Clean white background recommended</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold">Product Description &amp; Details</label>
                  <Textarea rows={3} value={creatorDesc} onChange={(e) => setCreatorDesc(e.target.value)} placeholder="Care instructions, package contents, warranty details..." className="mt-1 text-xs" />
                </div>
              </div>
            )}

            {creatorStep === 5 && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-sm text-foreground">Listing Summary &amp; Final Check:</div>
                <div className="flex items-center gap-3 py-1">
                  {creatorImageUrl || creatorImagePreview ? (
                    <img src={creatorImagePreview || creatorImageUrl} alt="Product" className="w-12 h-12 rounded-lg object-contain bg-white border p-1 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">No Photo</div>
                  )}
                  <div>
                    <div className="font-bold text-foreground">{creatorTitle || "Untitled Product"}</div>
                    <div className="text-muted-foreground">{creatorBrand} • {creatorCategory} • SKU: {creatorSku}</div>
                  </div>
                </div>
                <div><b>Barcode:</b> {creatorBarcodeValue || (creatorBarcodeType === "exemption" ? "Brand Exemption Approved" : "None")}</div>
                <div><b>Price:</b> ₹{creatorPrice} • <b>Available Stock:</b> {creatorQty} units</div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">
                  ✓ Ready to Publish: All required Amazon product details and device photo are complete.
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center border-t pt-4">
            {creatorStep > 1 ? (
              <Button variant="outline" onClick={() => setCreatorStep(s => s - 1)}>Back</Button>
            ) : <div />}
            {creatorStep < 5 ? (
              <Button onClick={() => setCreatorStep(s => s + 1)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handlePublishNewProduct} disabled={isPublishing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Publish Listing to Amazon
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

