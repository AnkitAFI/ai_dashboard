"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, BarChart3, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/config";
import { useFilters } from "@/components/dashboard/filters-context";

interface ExplorerKpiCardsProps {
  selectedSource: string;
}

interface KPIData {
  strongDemandCategories: number;
  investigatingProducts: number;
  lowCompetitionCategories: number;
  risingSalesProducts: number;
}

export default function ExplorerKpiCards({ selectedSource }: ExplorerKpiCardsProps) {
  const BASE_URL = API_BASE_URL;
  const { filters } = useFilters();
  const [data, setData] = useState<KPIData>({
    strongDemandCategories: 23,
    investigatingProducts: 12,
    lowCompetitionCategories: 8,
    risingSalesProducts: 3,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPIData = async () => {
      setIsLoading(true);
      try {
        const table = filters.table || selectedSource;
        const res = await fetch(`${BASE_URL}/api/explorer/kpi-summary?source=${table}`);
        const json = await res.json();

        if (json && typeof json.strongDemandCategories === "number") {
          setData({
            strongDemandCategories: json.strongDemandCategories,
            investigatingProducts: json.investigatingProducts,
            lowCompetitionCategories: json.lowCompetitionCategories,
            risingSalesProducts: json.risingSalesProducts,
          });
        }
      } catch (err) {
        console.error("Error fetching KPI metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIData();
  }, [selectedSource, filters.table]);

  const cards = [
    {
      id: "demand",
      count: data.strongDemandCategories,
      label: "Categories",
      sublabel: "with strong demand",
      ctaText: "View Categories",
      ctaHref: "/categories",
      icon: Package,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      cardBg: "bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white dark:from-slate-900/90 dark:to-slate-800/80 border-blue-200/60 dark:border-slate-800",
      ctaColor: "text-blue-600 dark:text-blue-400 hover:text-blue-700",
    },
    {
      id: "investigate",
      count: data.investigatingProducts,
      label: "Products",
      sublabel: "worth investigating",
      ctaText: "View Products",
      ctaHref: "/sales",
      icon: BarChart3,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      cardBg: "bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-slate-900/90 dark:to-slate-800/80 border-emerald-200/60 dark:border-slate-800",
      ctaColor: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700",
    },
    {
      id: "competition",
      count: data.lowCompetitionCategories,
      label: "Categories",
      sublabel: "with lower competition",
      ctaText: "View Opportunities",
      ctaHref: "/explorer/white-space-finder",
      icon: Trophy,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      cardBg: "bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-slate-900/90 dark:to-slate-800/80 border-amber-200/60 dark:border-slate-800",
      ctaColor: "text-amber-600 dark:text-amber-400 hover:text-amber-700",
    },
    {
      id: "trending",
      count: data.risingSalesProducts,
      label: "Products",
      sublabel: "showing rising sales",
      ctaText: "View Trending",
      ctaHref: "/product-tracker",
      icon: TrendingUp,
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      cardBg: "bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white dark:from-slate-900/90 dark:to-slate-800/80 border-purple-200/60 dark:border-slate-800",
      ctaColor: "text-purple-600 dark:text-purple-400 hover:text-purple-700",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 min-w-0">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <Card
            key={card.id}
            className={`relative p-3 sm:p-3.5 rounded-xl border shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-row items-center justify-between overflow-hidden min-w-0 ${card.cardBg}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 tracking-tight">
                    {card.count}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {card.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                  {card.sublabel}
                </p>
              </div>
            </div>

            <Link
              href={card.ctaHref}
              className={`p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 ${card.ctaColor}`}
              title={card.ctaText}
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
