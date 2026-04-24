import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSubscriptionLimits, UNLIMITED } from "@/hooks/useSubscriptionLimits";

// ✅ Export Filters interface
export interface Filters {
  table: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  dateRange: string;
  showTrendingOnly: boolean;
  sortBy: string;
  topN: number;
}

interface FiltersContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  maxTopN: number; // Expose the subscription limit
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const { limits } = useSubscriptionLimits();
  
  const [filters, setFilters] = useState<Filters>({
    table: "flipkart",
    category: "All Categories",
    priceRange: [0, 5000000],
    rating: 0,
    dateRange: "30d",
    showTrendingOnly: false,
    sortBy: "sales_desc",
    topN: Math.min(5, limits.maxTopN) // ✅ Enforce limit on initialization
  });

  // ✅ Auto-correct topN if it exceeds the subscription limit
  useEffect(() => {
    if (filters.topN > limits.maxTopN) {
      setFilters(prev => ({
        ...prev,
        topN: limits.maxTopN
      }));
    }
  }, [limits.maxTopN]);

  return (
    <FiltersContext.Provider value={{ 
      filters, 
      setFilters,
      maxTopN: limits.maxTopN 
    }}>
      {children}
    </FiltersContext.Provider>
  );
};

// ✅ Export useFilters hook
export const useFilters = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (!context) throw new Error("useFilters must be used within a FiltersProvider");
  return context;
};
