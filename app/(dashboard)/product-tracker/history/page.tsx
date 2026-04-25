"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { History, Loader2, Trash2, Eye, Calendar, DollarSign, TrendingUp, AlertCircle, Menu, X, ChevronLeft, Package, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import { usePathname, useRouter } from "next/navigation";


interface HistoryItem {
  id: number;
  product_name: string;
  category: string;
  source: string;
  base_cost: number;
  recommended_price: number;
  profit_margin: number;
  market_demand: string;
  created_at: string;
}

interface DetailedAnalysis {
  id: number;
  product_name: string;
  category: string;
  source: string;
  base_cost: number;
  pricing: {
    recommended_price: number;
    min_price: number;
    max_price: number;
    profit_margin: number;
    confidence: string;
  };
  sales: {
    estimated_monthly_sales: string;
    estimated_daily_sales: number;
    market_demand: string;
  };
  competition: {
    total_competitors: number;
    avg_competitor_price: number;
    avg_competitor_rating: number;
    top_competitor: {
      name: string;
      price: number;
    } | null;
  };
  location_insights: any[];
  ai_strategy: string;
  warnings: string[];
  created_at: string;
}

interface DeleteConfirmDialog {
  isOpen: boolean;
  itemId: number | null;
  itemName: string;
}

export default function ProductTrackerHistory() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userEmail = user?.email || "";
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    isOpen: false,
    itemId: null,
    itemName: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchHistory(userEmail);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [userEmail, authLoading]);

  const fetchHistory = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")}/product-tracker/history?user_email=${email}&limit=50`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.data?.items || []);
      }
    } catch (error) {
      console.error("❌ Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisDetails = async (id: number) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")}/product-tracker/analysis/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedAnalysis(data.data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDeleteDialog = (id: number, name: string) => {
    setDeleteDialog({
      isOpen: true,
      itemId: id,
      itemName: name
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemName: ""
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.itemId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")}/product-tracker/analysis/${deleteDialog.itemId}?user_email=${userEmail}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== deleteDialog.itemId));
        if (selectedAnalysis?.id === deleteDialog.itemId) {
          setSelectedAnalysis(null);
        }
      }
    } catch (error) {
      console.error("❌ Delete failed:", error);
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceColor = (src: string) =>
    src.toLowerCase() === "amazon"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : "bg-yellow-100 text-yellow-800 border-yellow-300";

  const getDemandColor = (demand: string) => {
    switch (demand?.toLowerCase()) {
      case "high": return "bg-emerald-100 text-emerald-800";
      case "medium": return "bg-blue-100 text-blue-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] overflow-x-hidden">
      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/80 z-50 backdrop-blur-none" onClick={closeDeleteDialog} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Delete Analysis?</CardTitle>
                    <CardDescription className="text-base">
                      Are you sure you want to delete the analysis for{" "}
                      <span className="font-semibold text-slate-900">{deleteDialog.itemName}</span>?
                      This action cannot be undone.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeDeleteDialog}
                    disabled={isDeleting}
                    className="min-w-24"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="min-w-24"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-xl shadow-md"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/80 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64 transition-all min-h-screen">
        {/* Compact Header Consolidated */}
        <header className="bg-background opacity-100 backdrop-blur-none border border-sky-100 shadow-xl rounded-2xl px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6 transition-all duration-300">
          <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-inner border border-purple-50">
                <History className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent tracking-tight">Analysis History</h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Your past product analyses</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push("/product-tracker")}
              className="w-full sm:w-auto flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Tracker
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* User Info */}
            {userEmail && (
              <Alert className="bg-blue-50 border-blue-300">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Showing analysis history for: <span className="font-semibold">{userEmail}</span>
                </AlertDescription>
              </Alert>
            )}

            {authLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : !userEmail ? (
              <Card className="text-center p-12">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                <h3 className="text-xl font-semibold mb-2">Please Login</h3>
                <p className="text-slate-600 mb-6">You need to login to view your analysis history</p>
                <Button onClick={() => router.push("/login")}>Go to Login</Button>
              </Card>
            ) : history.length === 0 ? (
              <Card className="text-center p-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-slate-600 mb-6">You haven't analyzed any products yet. Start your first analysis!</p>
                <Button onClick={() => router.push("/product-tracker")}>Analyze Product</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* History List */}
                <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnalysis?.id === item.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                        }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                              {item.product_name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={getSourceColor(item.source)}>
                                {item.source}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              <Badge className={getDemandColor(item.market_demand)}>
                                {item.market_demand}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Recommended Price</p>
                            <p className="font-semibold text-blue-600">₹{item.recommended_price?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Profit Margin</p>
                            <p className={`font-semibold ${getMarginColor(item.profit_margin || 0)}`}>
                              {item.profit_margin?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => fetchAnalysisDetails(item.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(item.id, item.product_name);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-7">
                  {detailsLoading ? (
                    <Card className="p-12 flex items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </Card>
                  ) : !selectedAnalysis ? (
                    <Card className="p-12 text-center">
                      <Eye className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-600">Select an analysis to view details</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {/* Product Info */}
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl mb-2">{selectedAnalysis.product_name}</CardTitle>
                              <div className="flex gap-2">
                                <Badge className={getSourceColor(selectedAnalysis.source)}>
                                  {selectedAnalysis.source}
                                </Badge>
                                <Badge variant="outline">{selectedAnalysis.category}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">
                              {formatDate(selectedAnalysis.created_at)}
                            </p>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Pricing */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Pricing Strategy
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600">Your Cost</p>
                              <p className="text-xl font-bold">₹{selectedAnalysis.base_cost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Recommended Price</p>
                              <p className="text-xl font-bold text-blue-600">₹{selectedAnalysis.pricing.recommended_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Price Range</p>
                              <p className="text-sm font-semibold">₹{selectedAnalysis.pricing.min_price.toLocaleString()} - ₹{selectedAnalysis.pricing.max_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Profit Margin</p>
                              <p className={`text-xl font-bold ${getMarginColor(selectedAnalysis.pricing.profit_margin)}`}>
                                {selectedAnalysis.pricing.profit_margin.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sales & Competition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <TrendingUp className="h-5 w-5 text-purple-600" />
                              Sales Forecast
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm text-slate-600">Monthly Sales</p>
                              <p className="text-lg font-semibold">{selectedAnalysis.sales.estimated_monthly_sales} units</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Daily Average</p>
                              <p className="text-lg font-semibold">{selectedAnalysis.sales.estimated_daily_sales.toFixed(0)} units/day</p>
                            </div>
                            <Badge className={getDemandColor(selectedAnalysis.sales.market_demand)}>
                              {selectedAnalysis.sales.market_demand} Demand
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Competition</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Total Competitors</span>
                              <span className="font-semibold">{selectedAnalysis.competition.total_competitors}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Avg Price</span>
                              <span className="font-semibold">₹{selectedAnalysis.competition.avg_competitor_price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600">Avg Rating</span>
                              <span className="font-semibold">{selectedAnalysis.competition.avg_competitor_rating.toFixed(1)}★</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Strategy */}
                      {selectedAnalysis.ai_strategy && (
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                          <CardHeader>
                            <CardTitle className="text-lg">AI Strategy</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                              {selectedAnalysis.ai_strategy}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Warnings */}
                      {selectedAnalysis.warnings && selectedAnalysis.warnings.length > 0 && (
                        <Alert className="border-yellow-300 bg-yellow-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="space-y-1">
                              {selectedAnalysis.warnings.map((warning, idx) => (
                                <li key={idx} className="text-sm">{warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}