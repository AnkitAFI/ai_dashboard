// app/(dashboard)/explorer/price-tracker/_components/PctUploadModal.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { pctApi } from "./pct-api";
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Info, ChevronRight } from "lucide-react";

interface PctUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PctUploadModal({ isOpen, onClose, onSuccess }: PctUploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState("");
  const country = "IN";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadTemplate = () => {
    // Blank template with headers for Our ASIN and optional competitor ASINs
    const csvContent =
      "Our Product Code (ASIN),Competitor 1 (Optional),Competitor 2 (Optional),Competitor 3 (Optional),Competitor 4 (Optional),Competitor 5 (Optional)\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Price_Comparison_Tracker_Sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Sample Spreadsheet Downloaded",
      description: "Sample file ready. Add your Amazon product codes in Column A. Competitor columns can be left empty for automatic competitor discovery.",
    });
  };

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const isValid = validExtensions.some((ext) => selected.name.toLowerCase().endsWith(ext));
      if (!isValid) {
        setError("Please choose a valid spreadsheet file (.xlsx, .xls, or .csv)");
        return;
      }
      setFile(selected);
      setError(null);
      if (!sheetName) {
        setSheetName(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a spreadsheet file (.xlsx or .csv) to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_name", sheetName || "Tracked Products");
    formData.append("country", country);

    try {
      const res = await pctApi.uploadSheet(formData);
      setResult(res);
      const totalCreated = res.created_count || 0;
      const totalUpdated = res.updated_count || 0;
      toast({
        title: "Products Added Successfully",
        description: `Now monitoring ${totalCreated + totalUpdated} product(s) on Amazon India.`,
      });
      onSuccess();
    } catch (err: any) {
      const friendlyMsg = err.message || "Unable to read spreadsheet. Please check the file format and try again.";
      setError(friendlyMsg);
      toast({
        title: "Upload Incomplete",
        description: friendlyMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 m-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Add Products to Price Tracker
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Upload an Excel or CSV file with your Amazon product codes (ASINs). You can specify up to 5 competitor codes per product, or leave them empty to automatically find top rivals.
        </p>

        {/* Instructions banner */}
        <div className="p-3.5 mb-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Simple Spreadsheet Guide:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800 dark:text-blue-300">
                <li><strong>Column A:</strong> Your product code (e.g. <code>B08869TSQ4</code>)</li>
                <li><strong>Columns B through F (Optional):</strong> Competitor codes (up to 5). <em>Leave blank to auto-discover top rivals!</em></li>
                <li>1 credit per product row (tracks your product and all competitor prices).</li>
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="shrink-0 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-[11px] hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sample File</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="py-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 mb-4 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm mb-1">Products Added Successfully!</p>
                <p>Now Tracking: <strong>{result.created_count}</strong> new product(s)</p>
                {result.updated_count > 0 && <p>Updated: <strong>{result.updated_count}</strong> existing product(s)</p>}
                <p className="mt-1">Available Tracking Credits: <strong>{result.credits_remaining}</strong></p>
              </div>
            </div>

            {result.failed_count > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 mb-4">
                <p className="font-bold mb-1">Items Needing Attention ({result.failed_count}):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.failed_rows.map((f: any, i: number) => (
                    <li key={i}>Row {f.row_num} (Product {f.our_asin}): {f.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:scale-105"
              >
                <span>View in Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            {/* Sheet Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Group / List Name (Optional)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="e.g. Winter Electronics, Top Sellers, Kitchen"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Marketplace Info (India Only) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amazon Store
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Amazon India (amazon.in · ₹ INR)</span>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/20 mb-6"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click to choose a different spreadsheet
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Click to select or drag & drop your Excel or CSV spreadsheet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accepts .xlsx, .xls, or .csv</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing with Amazon...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Start Tracking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
