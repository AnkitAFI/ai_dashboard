"use client";

import React, { useState, useEffect } from "react";
import { ComparisonRow, CompetitorInput, ProductData } from "@/app/(dashboard)/live-competitor/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertCircle, Tag, CreditCard, Store, Truck, Package, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

const BASE_URL = API_BASE_URL;

interface LiveCompetitorDashboardProps {
  initialInputs: CompetitorInput[];
}

export function LiveCompetitorDashboard({ initialInputs }: LiveCompetitorDashboardProps) {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize empty rows based on input
  useEffect(() => {
    if (initialInputs.length > 0 && rows.length === 0) {
      const initialRows: ComparisonRow[] = initialInputs.map((input) => ({
        ownProduct: createEmptyProduct(input.ownAsin),
        competitors: input.competitorAsins.map((asin) => createEmptyProduct(asin)),
      }));
      setRows(initialRows);
    }
  }, [initialInputs]);

  const createEmptyProduct = (asin: string): ProductData => ({
    asin,
    mrp: null,
    price: null,
    buyBoxWinner: null,
    sellerName: null,
    isFba: null,
    delivery110011: null,
    coupons: null,
    bankOffers: null,
    status: "pending",
  });

  const processBatch = async () => {
    if (rows.length === 0) return;
    setIsProcessing(true);

    // Deep copy and set all pending to loading
    let updatedRows = rows.map(row => ({
      ownProduct: { ...row.ownProduct, status: row.ownProduct.status === 'pending' ? 'loading' : row.ownProduct.status } as ProductData,
      competitors: row.competitors.map(c => ({ ...c, status: c.status === 'pending' ? 'loading' : c.status } as ProductData))
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

    const finalResults: any[] = [];

    // Process sequentially (1 at a time) to prevent Rainforest API Free Tier concurrency limits (402 errors)
    const BATCH_SIZE = 1;
    for (let i = 0; i < allAsins.length; i += BATCH_SIZE) {
      const batch = allAsins.slice(i, i + BATCH_SIZE);

      const promises = batch.map(async (item) => {
        // Skip if ASIN is empty (can happen with sparse competitor columns)
        if (!item.asin || !item.asin.trim()) return;
        try {
          const res = await fetch(`${BASE_URL}/api/live-competitor/fetch-asin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ asin: item.asin })
          });

          if (!res.ok) throw new Error('API Error');
          const data: ProductData = await res.json();

          finalResults.push({
            ...data,
            own_asin: item.ownAsin,
            asin_role: item.isOwn ? 'own' : 'competitor'
          });

          setRows(prevRows => {
            const newRows = prevRows.map(r => ({ ...r, competitors: [...r.competitors] }));
            if (item.isOwn) {
              newRows[item.rowIdx] = { ...newRows[item.rowIdx], ownProduct: { ...data, status: 'success' } };
            } else {
              newRows[item.rowIdx].competitors[item.compIdx!] = { ...data, status: 'success' };
            }
            return newRows;
          });

        } catch (error) {
          setRows(prevRows => {
            const newRows = prevRows.map(r => ({ ...r, competitors: [...r.competitors] }));
            const errorData: ProductData = {
              asin: item.asin,
              mrp: null, price: null, buyBoxWinner: null, sellerName: null, isFba: null,
              delivery110011: null, coupons: null, bankOffers: null,
              status: 'error', errorMsg: 'Failed to fetch'
            };

            finalResults.push({
              ...errorData,
              own_asin: item.ownAsin,
              asin_role: item.isOwn ? 'own' : 'competitor'
            });
            if (item.isOwn) {
              newRows[item.rowIdx] = { ...newRows[item.rowIdx], ownProduct: errorData };
            } else {
              newRows[item.rowIdx].competitors[item.compIdx!] = errorData;
            }
            return newRows;
          });
        }
      });

      await Promise.all(promises);
      
      // Add a small 1-second delay between requests to be extra safe with the free tier limits
      if (i + BATCH_SIZE < allAsins.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Save to DB silently
    if (finalResults.length > 0) {
      try {
        await fetch(`${BASE_URL}/api/live-competitor/save-run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ results: finalResults })
        });
      } catch (e) {
        console.error("Failed to save run to DB", e);
      }
    }

    setIsProcessing(false);
  };

  const renderProductCell = (product: ProductData, isOwn: boolean) => {
    if (product.status === "pending") return <div className="text-slate-400 text-sm italic p-4">Waiting...</div>;
    if (product.status === "loading") return <div className="flex items-center gap-2 text-slate-500 p-4"><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</div>;
    if (product.status === "error") return <div className="flex items-center gap-2 text-red-500 text-sm p-4"><AlertCircle className="w-4 h-4 shrink-0" /> <span className="truncate">{product.errorMsg}</span></div>;

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

          {isOwn && product.sellerName && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <Store className="w-3.5 h-3.5" /> Seller
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate block text-sm">{product.sellerName}</span>
            </div>
          )}

          {isOwn && product.delivery110011 && (
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
        <p>No ASINs loaded.</p>
        <p className="text-sm">Please import your Excel sheet to begin.</p>
      </div>
    );
  }

  const maxCompetitors = Math.max(...rows.map((r) => r.competitors.length), 0);
  const competitorCols = Array.from({ length: Math.max(1, maxCompetitors) }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Competitor Grid</h2>
        <button
          onClick={processBatch}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isProcessing ? 'Processing...' : 'Fetch Live Data'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-semibold text-sm text-slate-700 dark:text-slate-300 min-w-[220px]">
                Our Product
              </th>
              {competitorCols.map((idx) => (
                <th key={idx} className="p-4 font-semibold text-sm text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 min-w-[200px]">
                  Competitor {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
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
    </div>
  );
}
