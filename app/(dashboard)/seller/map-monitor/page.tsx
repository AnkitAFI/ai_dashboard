"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  Menu,
  Search,
  Package,
  Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/layout/sidebar-context";

interface AsinMopRow {
  asin: string;
  standard_mop: number;
}

interface SellerResult {
  seller_name: string;
  seller_id: string;
  price: number;
  status: "OK" | "VIOLATION" | "ABOVE_MOP";
}

interface MapCheckResult {
  asin: string;
  standard_mop: number;
  product_title: string;
  sellers_found: number;
  sellers: SellerResult[];
}

export default function MapMonitorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, resolvedTheme } = useTheme();
  const { toggle } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<AsinMopRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MapCheckResult[] | null>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enterprise Gate
  const isEnterprise = user?.subscriptionTier === "enterprise";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw JSON
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawJson.length < 2) {
          toast({ title: "Invalid File", description: "The file is empty or lacks data rows.", variant: "destructive" });
          return;
        }

        // Extract header
        const header = rawJson[0] as string[];
        const asinIndex = header.findIndex(h => typeof h === 'string' && h.toLowerCase().includes("asin"));
        const mopIndex = header.findIndex(h => typeof h === 'string' && h.toLowerCase().includes("mop"));

        if (asinIndex === -1 || mopIndex === -1) {
          toast({
            title: "Missing Columns",
            description: "Could not find 'ASIN' and 'Standard MOP' columns. Please check your file headers.",
            variant: "destructive"
          });
          return;
        }

        // Map rows
        const rows: AsinMopRow[] = [];
        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || !row[asinIndex]) continue;
          
          const asin = String(row[asinIndex]).trim();
          const mopStr = String(row[mopIndex] || "0").replace(/[^\d.]/g, "");
          const standard_mop = parseFloat(mopStr) || 0;
          
          if (asin && standard_mop > 0) {
            rows.push({ asin, standard_mop });
          }
        }

        if (rows.length > 10) {
          toast({
            title: "Too Many ASINs",
            description: `You uploaded ${rows.length} ASINs. The maximum allowed per batch is 10.`,
            variant: "destructive"
          });
          return;
        }

        setParsedData(rows);
        setResults(null);
        toast({
          title: "File Processed",
          description: `Successfully loaded ${rows.length} ASINs ready for checking.`
        });
      } catch (err) {
        toast({ title: "Parsing Error", description: "Failed to parse the Excel file.", variant: "destructive" });
      }
      
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,ASIN,Standard MOP\nB08869TSQ4,16490\nB0B6F172KR,3499";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MAP_Monitor_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runCheck = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/map-monitor/check`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ asins: parsedData })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      toast({
        title: "Scan Complete",
        description: `Successfully checked ${parsedData.length} ASINs.`
      });
    } catch (err: any) {
      toast({
        title: "Check Failed",
        description: err.message || "An error occurred while calling the API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isEnterprise) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <Lock className="w-16 h-16 text-slate-400 mb-6" />
        <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Enterprise Feature
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          The MAP Price Monitor is exclusively available for Enterprise customers. 
          Upgrade your plan to automatically track seller pricing and identify MAP violators.
        </p>
        <Button onClick={() => window.location.href = '/subscription'} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          Upgrade to Enterprise
        </Button>
      </div>
    );
  }

  const violationsCount = results 
    ? results.reduce((acc, curr) => acc + curr.sellers.filter(s => s.status === "VIOLATION").length, 0)
    : 0;
  
  const totalSellers = results
    ? results.reduce((acc, curr) => acc + curr.sellers_found, 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-transparent max-w-7xl mx-auto w-full pb-12 px-4 sm:px-6 lg:px-8">
      <header className={`bg-transparent border-b pb-4 mb-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-indigo-900/50' : 'border-indigo-100/80'}`}>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`lg:hidden p-2 rounded-xl mr-1 shadow-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-50 hover:bg-indigo-100'}`}>
            <Menu className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`} />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isDark ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50' : 'bg-gradient-to-br from-emerald-100 to-teal-100'}`}>
            <ShieldCheck className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              MAP Price Monitor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload your ASINs with Standard MOP to instantly detect price violations across Amazon sellers.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8">

      {!results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600"
          >
            <input 
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .csv, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Drag & drop your Excel file here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-md">
              Your file must contain <span className="font-semibold text-slate-700 dark:text-slate-300">ASIN</span> and <span className="font-semibold text-slate-700 dark:text-slate-300">Standard MOP</span> columns. Max 10 ASINs per batch.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                downloadTemplate();
              }}
              className="mt-6 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {parsedData.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  Ready to scan {parsedData.length} ASIN(s)
                </h3>
                <Button 
                  onClick={runCheck} 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning Market...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Run MAP Check
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-h-[300px] overflow-y-auto text-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <th className="pb-2">ASIN</th>
                      <th className="pb-2 text-right">Standard MOP (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <td className="py-2 text-slate-700 dark:text-slate-300 font-mono">{row.asin}</td>
                        <td className="py-2 text-right font-medium text-slate-800 dark:text-slate-200">
                          {row.standard_mop.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">ASINs Checked</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{results.length}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Store className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Sellers Found</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalSellers}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">MAP Violations</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">{violationsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Detailed Results</h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setResults(null); setParsedData([]); }}>
                  Check Another Batch
                </Button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-10 bg-slate-50/30 dark:bg-slate-900/30">
              {results.map((item, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-indigo-100 dark:border-indigo-900/50 pb-3">
                    <div>
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-300 font-mono text-xl tracking-tight">ASIN - {item.asin}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl mt-1" title={item.product_title}>{item.product_title}</p>
                    </div>
                    <div className="mt-3 sm:mt-0 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg border shadow-sm">
                      Target MOP: <span className="text-indigo-600 dark:text-indigo-400 ml-1">₹{item.standard_mop.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {item.sellers.length === 0 ? (
                    <div className="text-sm text-slate-500 italic p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      No sellers found or an error occurred while fetching.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-1">
                      {item.sellers.map((seller, j) => (
                        <div key={j} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-6 gap-3">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 text-base leading-tight">
                              {seller.seller_name}
                            </h4>
                            <div className="shrink-0">
                              {seller.status === 'VIOLATION' && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" title="Below MOP">
                                  <XCircle className="w-5 h-5" />
                                </span>
                              )}
                              {seller.status === 'OK' && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" title="At MOP">
                                  <CheckCircle className="w-5 h-5" />
                                </span>
                              )}
                              {seller.status === 'ABOVE_MOP' && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" title="Above MOP">
                                  <TrendingUp className="w-5 h-5" />
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-auto space-y-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">Offer Price:</span>
                              <span className={`text-lg font-black tracking-tight ${seller.status === 'VIOLATION' ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                ₹{seller.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
