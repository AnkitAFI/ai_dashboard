"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Box, Home, Utensils, Car, Sparkle, Shirt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/config";
import { useFilters } from "@/components/dashboard/filters-context";

interface CategoryOpportunity {
  id: number;
  category: string;
  demand: "High" | "Medium" | "Low" | string;
  competition: "Low" | "Medium" | "High" | string;
  avgPrice: number;
  opportunityScore: number;
}

interface BestOpportunityCategoriesCardProps {
  selectedSource: string;
}

export default function BestOpportunityCategoriesCard({ selectedSource }: BestOpportunityCategoriesCardProps) {
  const BASE_URL = API_BASE_URL;
  const { filters } = useFilters();
  const [categories, setCategories] = useState<CategoryOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunityCategories = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const res = await fetch(`${BASE_URL}/api/explorer/opportunity-categories?source=${table}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          // Fallback static demo data matching attached mockup
          setCategories([
            { id: 1, category: "Home Storage", demand: "High", competition: "Medium", avgPrice: 699, opportunityScore: 92 },
            { id: 2, category: "Kitchen Tools", demand: "High", competition: "High", avgPrice: 449, opportunityScore: 78 },
            { id: 3, category: "Car Accessories", demand: "Medium", competition: "Low", avgPrice: 899, opportunityScore: 86 },
            { id: 4, category: "Home Decor", demand: "Medium", competition: "Medium", avgPrice: 599, opportunityScore: 75 },
            { id: 5, category: "Personal Care", demand: "High", competition: "High", avgPrice: 349, opportunityScore: 68 },
          ]);
        }
      } catch (err) {
        console.error("Error fetching opportunity categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunityCategories();
  }, [selectedSource, filters.table]);

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes("kitchen") || lower.includes("utensil")) return Utensils;
    if (lower.includes("storage") || lower.includes("home")) return Home;
    if (lower.includes("car") || lower.includes("auto")) return Car;
    if (lower.includes("care") || lower.includes("beauty")) return Sparkles;
    if (lower.includes("fashion") || lower.includes("wear")) return Shirt;
    return Box;
  };

  const getBadgeColor = (val: string, type: "demand" | "competition") => {
    if (type === "demand") {
      if (val === "High") return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300/90 dark:border-emerald-800/40";
      if (val === "Medium") return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300/90 dark:border-amber-800/40";
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
    } else {
      if (val === "Low") return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300/90 dark:border-emerald-800/40";
      if (val === "Medium") return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300/90 dark:border-amber-800/40";
      return "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300/90 dark:border-rose-800/40";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500 text-emerald-600";
    if (score >= 75) return "bg-emerald-400 text-emerald-500";
    return "bg-amber-500 text-amber-600";
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-slate-800 shadow-sm flex flex-col justify-start overflow-hidden min-w-0 h-full">
      <CardHeader className="min-h-[52px] h-auto sm:h-[54px] px-3.5 sm:px-5 py-2.5 sm:py-2 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between shrink-0 gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200 tracking-tight flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse shrink-0" />
            <span className="truncate">Best opportunity categories</span>
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
            High demand + lower competition = better opportunity
          </p>
        </div>

        <Link
          href="/explorer/white-space-finder"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors shrink-0 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="p-3.5 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="h-[38px] border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/80">
                <th className="py-2 px-3 pl-4 sm:pl-5 w-10 align-middle">#</th>
                <th className="py-2 px-3 align-middle min-w-[140px]">Category</th>
                <th className="py-2 px-3 text-center align-middle whitespace-nowrap min-w-[90px]">Demand</th>
                <th className="py-2 px-3 text-center align-middle whitespace-nowrap min-w-[110px]">Competition</th>
                <th className="py-2 px-3 text-right align-middle whitespace-nowrap min-w-[90px]">Avg. Price</th>
                <th className="py-2 px-3 pr-4 sm:pr-5 text-right align-middle whitespace-nowrap min-w-[120px]">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {categories.map((cat, idx) => {
                const IconComponent = getCategoryIcon(cat.category);
                const scoreColorClass = getScoreColor(cat.opportunityScore);

                return (
                  <tr
                    key={cat.id || idx}
                    className="h-[44px] hover:bg-sky-50/60 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <td className="py-0 px-3 pl-4 sm:pl-5 font-bold text-slate-400 text-xs align-middle">{idx + 1}</td>
                    <td className="py-0 px-3 font-semibold text-slate-800 dark:text-slate-200 align-middle min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-500 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{cat.category}</span>
                      </div>
                    </td>
                    <td className="py-0 px-3 text-center align-middle whitespace-nowrap min-w-[90px]">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border normal-case tracking-normal ${getBadgeColor(cat.demand, "demand")}`}>
                        {cat.demand}
                      </span>
                    </td>
                    <td className="py-0 px-3 text-center align-middle whitespace-nowrap min-w-[110px]">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border normal-case tracking-normal ${getBadgeColor(cat.competition, "competition")}`}>
                        {cat.competition}
                      </span>
                    </td>
                    <td className="py-0 px-3 text-right font-bold text-slate-800 dark:text-slate-200 align-middle whitespace-nowrap min-w-[90px]">
                      ₹{cat.avgPrice.toLocaleString()}
                    </td>
                    <td className="py-0 px-3 pr-4 sm:pr-5 text-right align-middle min-w-[120px]">
                      <div className="inline-flex items-center justify-end gap-1.5 w-full max-w-[100px] ml-auto">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-200 shrink-0">
                          {cat.opportunityScore}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full ${scoreColorClass.split(" ")[0]}`}
                            style={{ width: `${cat.opportunityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
