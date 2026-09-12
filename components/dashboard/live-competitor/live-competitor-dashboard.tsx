"use client";

import React, { useState, useEffect } from "react";
import { ComparisonRow, CompetitorInput, ProductData } from "@/app/(dashboard)/live-competitor/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertCircle, Tag, CreditCard, Store, Truck, Package, XCircle, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

const BASE_URL = API_BASE_URL;

interface LiveCompetitorDashboardProps {
  initialInputs: CompetitorInput[];
  onSaveList?: () => void;
  isSaving?: boolean;
}

export function LiveCompetitorDashboard({ initialInputs, onSaveList, isSaving }: LiveCompetitorDashboardProps) {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Initialize empty rows based on input
  useEffect(() => {
    // Map initial inputs to comparison rows
    const initialRows: ComparisonRow[] = initialInputs.map(input => {
      return {
        ownProduct: { asin: input.ownAsin, mrp: null, price: null, buyBoxWinner: null, sellerName: null, isFba: null, delivery110011: null, coupons: null, bankOffers: null, status: 'idle' },
        competitors: input.competitorAsins.map(asin => ({ asin, mrp: null, price: null, buyBoxWinner: null, sellerName: null, isFba: null, delivery110011: null, coupons: null, bankOffers: null, status: 'idle' }))
      };
    });
    setRows(initialRows);
  }, [initialInputs]);

  const processBatch = async () => {
    if (rows.length === 0) return;
    setIsProcessing(true);

    // Immediately set all rows to pending visually
    setRows(prevRows => prevRows.map(row => ({
      ownProduct: { ...row.ownProduct, status: 'pending' },
      competitors: row.competitors.map(comp => ({ ...comp, status: 'pending' }))
    })));

    // Deep copy and set all pending/idle to loading
    let updatedRows = rows.map(row => ({
      ownProduct: { ...row.ownProduct, status: row.ownProduct.status === 'idle' || row.ownProduct.status === 'pending' ? 'loading' : row.ownProduct.status } as ProductData,
      competitors: row.competitors.map(c => ({ ...c, status: c.status === 'idle' || c.status === 'pending' ? 'loading' : c.status } as ProductData))
    }));
    setRows(updatedRows);

    // Flatten all ASINs to process
    const allAsins: { rowIdx: number; isOwn: boolean; compIdx?: number; asin: string; ownAsin: string }[] = [];
    updatedRows.forEach((row, rowIdx) => {
      allAsins.push({ rowIdx, isOwn: true, asin: row.ownProduct.asin, ownAsin: row.ownProduct.asin });
      row.competitors.forEach((comp, compIdx) => {
        allAsins.push({ rowIdx, isOwn: false, compIdx, asin: comp.asin, ownAsin: row.ownProduct.asin });
      });
    });

    // Collect unique ASINs to poll
    const uniqueAsins = Array.from(new Set(allAsins.map(a => a.asin).filter(a => a.trim() !== '')));
    
    // Set initial progress immediately so it doesn't show 0/0
    setFetchProgress({ current: 0, total: uniqueAsins.length });

    try {
      // 1. Queue all ASINs
      const res = await fetch(`${BASE_URL}/api/live-competitor/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ asin_data: initialInputs })
      });
      if (!res.ok) throw new Error('Failed to queue');

      // 2. Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`${BASE_URL}/api/live-competitor/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ asins: uniqueAsins })
          });
          
          if (!pollRes.ok) return;
          const pollData = await pollRes.json();
          const results: any[] = pollData.results || [];
          
          let pendingCount = 0;
          let completedCount = 0;
          
          setRows(prevRows => {
            const newRows = [...prevRows];
            
            // Re-map results to our rows structure
            results.forEach(record => {
              if (record.status === 'pending') {
                pendingCount++;
              } else {
                completedCount++;
              }
              
              // Find where this ASIN belongs
              allAsins.forEach(item => {
                if (item.asin === record.asin && item.ownAsin === record.own_asin) {
                  const updatedProduct = {
                    asin: record.asin,
                    mrp: record.mrp,
                    price: record.price,
                    buyBoxWinner: record.buyBoxWinner,
                    sellerName: record.sellerName,
                    isFba: record.isFba,
                    delivery110011: record.delivery110011,
                    coupons: record.coupons,
                    bankOffers: record.bankOffers,
                    status: record.status,
                    errorMsg: record.errorMsg
                  };
                  
                  if (item.isOwn) {
                    newRows[item.rowIdx] = { ...newRows[item.rowIdx], ownProduct: updatedProduct };
                  } else {
                    newRows[item.rowIdx] = { ...newRows[item.rowIdx], competitors: [...newRows[item.rowIdx].competitors] };
                    newRows[item.rowIdx].competitors[item.compIdx!] = updatedProduct;
                  }
                }
              });
            });
            
            return newRows;
          });
          
          setFetchProgress({ current: completedCount, total: uniqueAsins.length });
          
          // Stop polling when done
          if (pendingCount === 0 && results.length > 0) {
            clearInterval(pollInterval);
            setIsProcessing(false);
          }
          
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);
      
    } catch (e) {
      console.error("Queue error", e);
      setIsProcessing(false);
    }
  };

  const renderProductCell = (product: ProductData, isOwn: boolean) => {
    if (product.status === "idle") return <div className="text-slate-400 text-sm italic p-4">- Ready to scan -</div>;
    if (product.status === "pending") return <div className="text-slate-400 text-sm italic p-4">In Queue...</div>;
    if (product.status === "loading") return <div className="flex items-center gap-2 text-slate-500 p-4"><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</div>;
    if (product.status === "error") return (
      <div className="text-red-500 p-4 text-xs flex items-center gap-1">
        <AlertCircle className="w-4 h-4" /> Data unavailable
      </div>
    );

    // No buy box winner — product is unavailable / suppressed at this pincode
    if (!product.price) {
      return (
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800 p-4 text-center space-y-3 mt-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 mb-1">
            <XCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-2">
              No Buy Box
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Out of stock or suppressed at pincode 110011
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full space-y-3 mt-2">
        {/* Price Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-xl text-slate-900 dark:text-slate-50">
                {product.price ? `₹${product.price.toLocaleString()}` : 'N/A'}
              </span>
              {product.mrp && (
                <div className="text-slate-400 dark:text-slate-500 text-[11px] line-through mt-0.5">
                  MRP: ₹{product.mrp.toLocaleString()}
                </div>
              )}
            </div>
            {product.mrp && product.price && (
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 font-bold px-1.5 py-0.5 text-[10px]">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Fulfillment & Seller Section */}
        <div className="bg-slate-50/70 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm space-y-3">
          
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              <Package className="w-3.5 h-3.5" /> Buy Box Winner
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">{product.buyBoxWinner || 'No Winner'}</span>
              <div className="shrink-0">
                {product.isFba === true && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-1.5 py-0 text-[10px]">FBA</Badge>}
                {product.isFba === false && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-1.5 py-0 text-[10px]">FBM</Badge>}
              </div>
            </div>
          </div>

          {product.sellerName && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <Store className="w-3.5 h-3.5" /> Seller
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate block text-sm">{product.sellerName}</span>
            </div>
          )}

          {product.delivery110011 && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <Truck className="w-3.5 h-3.5" /> Delivery (110011)
              </div>
              <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed block">{product.delivery110011}</span>
            </div>
          )}
        </div>

        {/* Offers Section */}
        {(product.coupons || (product.bankOffers && product.bankOffers.length > 0)) && (
          <div className="space-y-2 pt-1">
            {product.coupons && (
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-2.5 rounded-lg">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-snug">{product.coupons}</span>
              </div>
            )}
            {product.bankOffers && product.bankOffers.map((offer, i) => (
              <div key={i} className="flex items-start gap-2 bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-2.5 rounded-lg">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-xs text-indigo-700 dark:text-indigo-300 leading-snug">{offer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (initialInputs.length === 0) {
    return (
      <div className="w-full h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400">
        <p className="mb-2">No market data uploaded yet.</p>
        <p className="text-sm">Please upload your product list to begin the analysis.</p>
      </div>
    );
  }

  const maxCompetitors = Math.max(...rows.map((r) => r.competitors.length), 0);
  const competitorCols = Array.from({ length: Math.max(1, maxCompetitors) }, (_, i) => i);
  
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentTableRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span>Analyzing Market Data...</span>
            <span className="text-indigo-600 dark:text-indigo-400">{Math.round((fetchProgress.current / fetchProgress.total) * 100) || 0}% ({fetchProgress.current} / {fetchProgress.total} Products)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${Math.max(5, (fetchProgress.current / fetchProgress.total) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Market Intelligence Grid</h2>
        <div className="flex items-center gap-3">
          {onSaveList && (
            <button 
              onClick={onSaveList} 
              disabled={isSaving || isProcessing}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Tracking List"}
            </button>
          )}
          
          <button
            onClick={processBatch}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isProcessing ? `Scanning (${fetchProgress.current}/${fetchProgress.total})...` : 'Analyze Market Data'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-semibold text-sm text-slate-700 dark:text-slate-300 min-w-[220px]">
                Your Product
              </th>
              {competitorCols.map((idx) => (
                <th key={idx} className="p-4 font-semibold text-sm text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 min-w-[200px]">
                  Competitor {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTableRows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">{row.ownProduct.asin}</span>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-2 text-[10px] uppercase tracking-wider">Ours</Badge>
                  </div>
                  {renderProductCell(row.ownProduct, true)}
                </td>

                {competitorCols.map((compIdx) => {
                  const comp = row.competitors[compIdx];
                  if (!comp) {
                    return <td key={compIdx} className="p-4 align-top border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30"></td>;
                  }
                  return (
                    <td key={compIdx} className="p-4 align-top border-l border-slate-100 dark:border-slate-800 relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">{comp.asin}</span>
                      </div>
                      {renderProductCell(comp, false)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * PAGE_SIZE, rows.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{rows.length}</span> Products
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
