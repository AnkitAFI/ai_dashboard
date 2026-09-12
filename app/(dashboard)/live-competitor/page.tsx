"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Lock, Crown, FileSpreadsheet, UploadCloud, AlertCircle, Save, Folder, Download } from "lucide-react";
import { LiveCompetitorDashboard } from "@/components/dashboard/live-competitor/live-competitor-dashboard";
import { CompetitorInput } from "./types";
import { API_BASE_URL } from "@/lib/config";
import * as XLSX from "xlsx";

const BASE_URL = API_BASE_URL;

// ── Subscription Tier Gate ────────────────────────────────────────────────────
function TierGate({ tier, feature }: { tier: "basic" | "premium" | "enterprise"; feature: string }) {
  const router = useRouter();
  return (
    <div className="relative w-full bg-white/40 dark:bg-slate-950/60 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center z-10 min-h-[500px] border border-white/20 dark:border-white/5 mt-8">
      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-md w-full text-center border border-white/50 dark:border-slate-700/50 overflow-hidden group">
        
        {/* Subtle background glow effect */}
        <div className="absolute -inset-20 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center mx-auto mb-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-2xl mb-3 tracking-tight">{feature} is locked</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed px-4">
            This premium market intelligence feature requires an Enterprise data plan to scan competitors at massive scale.
          </p>
          <button
            onClick={() => router.push("/subscription")}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
          >
            <Crown className="w-5 h-5" /> Upgrade to Enterprise
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveCompetitorPage() {
  const { user } = useAuth();
  
  // This state will be populated by the user's Excel Importer in the future
  const [inputs, setInputs] = useState<CompetitorInput[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listNameInput, setListNameInput] = useState("");

  // We restrict this feature purely to Enterprise users
  const isEnterprise = user?.subscriptionTier?.toLowerCase() === "enterprise";

  useEffect(() => {
    if (isEnterprise && user?.id) {
      fetch(`${BASE_URL}/api/live-competitor/lists`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.lists) setSavedLists(data.lists);
        })
        .catch(console.error);
    }
  }, [isEnterprise, user?.id]);

  const handleSaveListClick = () => {
    if (inputs.length === 0 || !user?.id) return;
    setListNameInput("");
    setShowSaveModal(true);
  };

  const confirmSaveList = async () => {
    if (!listNameInput.trim() || !user?.id) return;
    setShowSaveModal(false);
    setIsSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/live-competitor/lists`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list_name: listNameInput.trim(), asin_data: inputs }),
      });
      const data = await res.json();
      if (data.list) {
        setSavedLists([data.list, ...savedLists]);
        alert("List saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save list");
    }
    setIsSaving(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Use header: 1 to get raw array of arrays
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Find the actual header row by scanning for "Our ASIN" (case-insensitive, ignoring spaces)
        const headerRowIdx = rawData.findIndex(row => 
          row.some(cell => typeof cell === 'string' && cell.trim().toLowerCase() === 'our asin')
        );

        if (headerRowIdx === -1) {
          setUploadError("Could not find an 'Our ASIN' column header. Please ensure it is spelled correctly.");
          return;
        }

        const headers = rawData[headerRowIdx].map(h => typeof h === 'string' ? h.trim().toLowerCase() : '');
        const ourAsinIdx = headers.indexOf('our asin');
        
        // Find indices of competitor columns dynamically (unlimited)
        const compIndices: number[] = [];
        headers.forEach((h, idx) => {
          if (h.startsWith('competitor-') || h.startsWith('competitor ')) {
            compIndices.push(idx);
          }
        });

        const parsedInputs: CompetitorInput[] = [];
        
        // Parse the rows below the header
        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue; // skip empty rows
          
          const ourAsin = row[ourAsinIdx];
          
          // Skip if empty or not a string
          if (!ourAsin || typeof ourAsin !== 'string' || !ourAsin.trim()) continue;

          const cleanAsin = ourAsin.trim();
          
          // Amazon ASINs are strictly 10 characters long (e.g., B0B2536B1F)
          // This automatically ignores "FSIN" headers and Flipkart IDs (which are longer)
          if (cleanAsin.length !== 10) continue;
          
          const comps: string[] = [];
          for (const compIdx of compIndices) {
            const comp = row[compIdx];
            if (comp && typeof comp === 'string' && comp.trim()) {
              const cleanComp = comp.trim();
              if (cleanComp.length === 10) {
                comps.push(cleanComp);
              }
            }
          }
          
          parsedInputs.push({
            ownAsin: cleanAsin,
            competitorAsins: comps,
          });
        }

        if (parsedInputs.length === 0) {
          setUploadError("Found the 'Our ASIN' column, but couldn't find any valid ASIN data below it.");
          return;
        }

        setInputs(parsedInputs);
      } catch (error) {
        console.error(error);
        setUploadError("Failed to parse the Excel file. Please ensure it is a valid .xlsx or .csv format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    // Create an empty worksheet with just the required headers
    const ws = XLSX.utils.aoa_to_sheet([
      ["Our ASIN", "Amazon Url", "Competitor-1", "Competitor-2", "Competitor-3", "Competitor-4", "Competitor-5"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "competitor_tracking_template.xlsx");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      {/* Custom Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Save Tracking List</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Assign a name to securely save this product configuration for future market scans.</p>
            <input 
              type="text" 
              autoFocus
              placeholder="e.g. Winter Collection 2026"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mb-8 transition-all"
              value={listNameInput}
              onChange={(e) => setListNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSaveList()}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSaveList}
                disabled={!listNameInput.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Save List
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
          Market Intelligence Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Upload your product list to automatically analyze real-time pricing, Buy Box winners, and delivery speeds against thousands of competitors.
        </p>
      </div>

      {!isEnterprise && (
        <TierGate tier="enterprise" feature="Live Competitor Comparison" />
      )}

      {isEnterprise && (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Upload Product List</h3>
              <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Download Recommended Template
              </button>
            </div>
            
            <div className="flex items-start gap-6">
              <label className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-lg cursor-pointer bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload spreadsheet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports .xlsx, .xls, .csv</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
              </label>

              <div className="flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><strong className="text-slate-800 dark:text-slate-200">Recommended Data Structure:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Primary Column: <code>Our ASIN</code> (Your Product ID)</li>
                  <li>Comparison Columns: <code>Competitor-1</code>, <code>Competitor-2</code>... (Add as many as needed)</li>
                </ul>
                <p className="text-xs mt-4 text-slate-500">Incomplete rows will be automatically skipped.</p>
              </div>
            </div>
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </div>
            )}

            {savedLists.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <Folder className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Or load a saved list:</span>
                <select 
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const list = savedLists.find(l => l.id.toString() === e.target.value);
                    if (list) setInputs(list.asin_data);
                  }}
                >
                  <option value="">Select a saved list...</option>
                  {savedLists.map(list => (
                    <option key={list.id} value={list.id}>{list.list_name} ({new Date(list.created_at).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <LiveCompetitorDashboard 
              initialInputs={inputs} 
              onSaveList={handleSaveListClick}
              isSaving={isSaving}
            />
          </div>
        </>
      )}
    </div>
  );
}
