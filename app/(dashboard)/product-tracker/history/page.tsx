"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { History, Loader2, Trash2, Eye, Calendar, DollarSign, TrendingUp, AlertCircle, Menu, X, ChevronLeft, Package, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/layout/sidebar-context";


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
  const { toggle } = useSidebar();
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
      const response = await fetch(`${API_BASE_URL}/product-tracker/history?user_email=${email}&limit=50`);
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
      const response = await fetch(`${API_BASE_URL}/product-tracker/analysis/${id}`);
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
        `${API_BASE_URL}/product-tracker/analysis/${deleteDialog.itemId}?user_email=${userEmail}`,
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
      ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/80"
      : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/80";

  const getDemandColor = (demand: string) => {
    switch (demand?.toLowerCase()) {
      case "high": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400";
      default: return "bg-slate-105 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600 dark:text-green-400";
    if (margin >= 15) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#ECF5FF] to-[#E0F2FE] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-950/80 z-50 backdrop-blur-none" onClick={closeDeleteDialog} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-950/40 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 text-slate-900 dark:text-slate-100">Delete Analysis?</CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                      Are you sure you want to delete the analysis for{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{deleteDialog.itemName}</span>?
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
                    className="min-w-24 border-slate-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="min-w-24 bg-red-600 hover:bg-red-705 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 border-none"
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

      {/* MAIN CONTENT handled by layout */}

      {/* MAIN CONTENT */}
      <div className="transition-all min-h-screen">
        {/* Compact Header Consolidated */}
        <header className="bg-background dark:bg-slate-900 opacity-100 backdrop-blur-none border border-sky-100 dark:border-slate-800 shadow-xl rounded-2xl px-6 py-4 mb-6 flex flex-col md:flex-row items-center justify-between sticky top-0 sm:top-4 z-20 mx-0 sm:mx-6 transition-all duration-300">
          <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950 transition-colors">
              <Menu className="w-5 h-5 text-purple-900 dark:text-purple-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 rounded-xl shadow-inner border border-purple-50 dark:border-purple-900/60">
                <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 dark:from-purple-300 dark:to-pink-400 bg-clip-text text-transparent tracking-tight">Analysis History</h2>
                <p className="text-slate-505 dark:text-slate-400 text-xs sm:text-sm font-medium">Your past product analyses</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push("/product-tracker")}
              className="w-full sm:w-auto flex items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-600 dark:text-slate-350 font-bold text-xs px-4 py-2 rounded-xl transition-all"
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
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/80">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Showing analysis history for: <span className="font-semibold text-blue-900 dark:text-blue-200">{userEmail}</span>
                </AlertDescription>
              </Alert>
            )}

            {authLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : !userEmail ? (
              <Card className="text-center p-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-500 dark:text-orange-400" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Please Login</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">You need to login to view your analysis history</p>
                <Button onClick={() => router.push("/login")}>Go to Login</Button>
              </Card>
            ) : history.length === 0 ? (
              <Card className="text-center p-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <Package className="h-16 w-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">No Analysis Yet</h3>
                <p className="text-slate-650 dark:text-slate-400 mb-6">You haven't analyzed any products yet. Start your first analysis!</p>
                <Button onClick={() => router.push("/product-tracker")}>Analyze Product</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* History List */}
                <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-lg dark:bg-slate-900 ${
                        selectedAnalysis?.id === item.id 
                          ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-slate-202 dark:border-slate-800 bg-white'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-1 line-clamp-1">
                              {item.product_name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={getSourceColor(item.source)}>
                                {item.source}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
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
                            <p className="text-slate-505 dark:text-slate-400 text-xs">Recommended Price</p>
                            <p className="font-semibold text-blue-600 dark:text-blue-400">₹{item.recommended_price?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-505 dark:text-slate-400 text-xs">Profit Margin</p>
                            <p className={`font-semibold ${getMarginColor(item.profit_margin || 0)}`}>
                              {item.profit_margin?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-sky-600 hover:bg-sky-505 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-bold border-none"
                            onClick={() => fetchAnalysisDetails(item.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-400 border-none"
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
                <div className="lg:col-span-7 lg:sticky lg:top-24 max-h-[calc(100vh-100px)] overflow-y-auto">
                  {detailsLoading ? (
                    <Card className="p-12 flex items-center justify-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                    </Card>
                  ) : !selectedAnalysis ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 p-8 text-center transition-all">
                      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner">
                        <Eye className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Analysis Details</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Select an item from your history list on the left to view its comprehensive pricing strategy, profit margins, and competitor insights.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Product Info */}
                      <Card className="bg-white dark:bg-slate-900 border-slate-202 dark:border-slate-800">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl mb-2 text-slate-900 dark:text-slate-100">{selectedAnalysis.product_name}</CardTitle>
                              <div className="flex gap-2">
                                <Badge className={getSourceColor(selectedAnalysis.source)}>
                                  {selectedAnalysis.source}
                                </Badge>
                                <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">{selectedAnalysis.category}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(selectedAnalysis.created_at)}
                            </p>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Pricing */}
                      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Pricing Strategy
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Your Cost</p>
                              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{selectedAnalysis.base_cost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Recommended Price</p>
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-450">₹{selectedAnalysis.pricing.recommended_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Price Range</p>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{selectedAnalysis.pricing.min_price.toLocaleString()} - ₹{selectedAnalysis.pricing.max_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Profit Margin</p>
                              <p className={`text-xl font-bold ${getMarginColor(selectedAnalysis.pricing.profit_margin)}`}>
                                {selectedAnalysis.pricing.profit_margin.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sales & Competition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              Sales Forecast
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm text-slate-605 dark:text-slate-400">Monthly Sales</p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedAnalysis.sales.estimated_monthly_sales} units</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-605 dark:text-slate-400">Daily Average</p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedAnalysis.sales.estimated_daily_sales.toFixed(0)} units/day</p>
                            </div>
                            <Badge className={getDemandColor(selectedAnalysis.sales.market_demand)}>
                              {selectedAnalysis.sales.market_demand} Demand
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <CardHeader>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Competition</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Total Competitors</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedAnalysis.competition.total_competitors}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Price</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">₹{selectedAnalysis.competition.avg_competitor_price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedAnalysis.competition.avg_competitor_rating.toFixed(1)}★</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Strategy */}
                      {selectedAnalysis.ai_strategy && (
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-slate-200 dark:border-purple-900/30">
                          <CardHeader>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">AI Strategy</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                              {selectedAnalysis.ai_strategy}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Warnings */}
                      {selectedAnalysis.warnings && selectedAnalysis.warnings.length > 0 && (
                        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/15 dark:border-yellow-900/60 text-slate-800 dark:text-slate-300">
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-450" />
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