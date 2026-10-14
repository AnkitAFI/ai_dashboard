"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  IndianRupee, 
  ArrowUpDown, 
  TrendingUp, 
  Search, 
  X, 
  Filter, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Package,
  Layers
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import SmartSearchInput from "@/components/ui/smart-search-input";
import { useTranslation } from "react-i18next";

// Unified interface for both Flipkart & Amazon
interface TrendingProduct {
  id?: number;
  title?: string;
  product_title?: string;
  category?: string;
  category_name?: string;
  price?: number;
  avg_price?: number;
  rating?: number;
  avg_rating?: number;
  product_star_rating?: number;
  product_star_rating_numeric?: number;
  reviews?: number;
  total_reviews?: number;
  total_ratings?: number;
  product_num_ratings?: number;
  product_rating_count?: number;
  sales_volume?: string;
  avg_sales_volume?: number;
  source?: string;
  product_price?: string | number;
  product_price_numeric?: number;
  pid?: string;
  asin?: string;
  product_subtitle?: string;
  description?: string;
  highlights?: any;
  brand?: string;
  product_url?: string;
  product_photo?: string;
}

interface GroupedProduct {
  groupId: string;
  parentTitle: string;
  brand?: string;
  category?: string;
  variants: TrendingProduct[];
  totalSales: number;
  totalReviews: number;
  minPrice: number;
  maxPrice: number;
  avgRating: number;
  primaryProduct: TrendingProduct;
}

export default function Sales() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [source, setSource] = useState<"flipkart" | "amazon">("flipkart");
  const [sortField, setSortField] = useState<"reviews" | "price" | "rating" | "sales">("sales");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TrendingProduct | null>(null);
  
  // Expand/collapse state for grouped product variants
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Debounce searchQuery by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories & reset selection when source changes
  useEffect(() => {
    setSelectedCategory("All Categories");
    setCurrentPage(1);
    fetchCategories();
  }, [source]);

  // Re-fetch products when source or selected category changes
  useEffect(() => {
    fetchData();
  }, [source, selectedCategory]);

  const isDark = mounted && resolvedTheme === "dark";

  // Parse sales_volume text like "9.4K+ bought" or "10K+ bought in past month"
  const parseSalesVolume = (salesText?: string, avgSales?: number): number => {
    if (avgSales) return avgSales;
    if (!salesText) return 0;

    const match = salesText.match(/([\d.]+)([KMB])?/i);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const multiplier = match[2]?.toUpperCase();

    switch (multiplier) {
      case 'K': return num * 1000;
      case 'M': return num * 1000000;
      case 'B': return num * 1000000000;
      default: return num;
    }
  };

  const getProductPrice = (p: TrendingProduct): number => {
    if (typeof p.price === "number" && !isNaN(p.price) && p.price > 0) return p.price;
    if (typeof p.product_price === "number" && !isNaN(p.product_price) && p.product_price > 0) return p.product_price;
    if (typeof p.product_price === "string") {
      const parsed = parseFloat(p.product_price);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (typeof p.product_price_numeric === "number" && !isNaN(p.product_price_numeric) && p.product_price_numeric > 0) return p.product_price_numeric;
    return p.avg_price ?? 0;
  };

  const getHighlightsArray = (highlights?: any): string[] => {
    if (!highlights) return [];
    if (Array.isArray(highlights)) {
      return highlights.map(h => typeof h === 'string' ? h : (h?.text || h?.title || JSON.stringify(h)));
    }
    if (typeof highlights === 'string') {
      try {
        const parsed = JSON.parse(highlights);
        if (Array.isArray(parsed)) {
          return parsed.map(h => typeof h === 'string' ? h : (h?.text || h?.title || JSON.stringify(h)));
        }
      } catch (e) {
        return highlights.split('•').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const fetchCategories = () => {
    setCategoriesLoading(true);
    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/rapidapi_flipkart_products/categories`
        : `${API_BASE_URL}/rapidapi_amazon_products/categories`;

    axios
      .get(url)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const names = data
          .map((c: { category_name?: string; category?: string }) => c.category_name || c.category || "")
          .filter((name: string) => name.trim() !== "");
        setCategories(names);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  };

  const fetchData = () => {
    setLoading(true);
    const categoryParam =
      selectedCategory && selectedCategory !== "All Categories"
        ? `&category=${encodeURIComponent(selectedCategory)}`
        : "";

    const url =
      source === "flipkart"
        ? `${API_BASE_URL}/top?table=rapidapi_flipkart_products&n=500${categoryParam}`
        : `${API_BASE_URL}/rapidapi/top-sales?limit=500${categoryParam}`;

    axios
      .get(url)
      .then((res) => {
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        setExpandedGroups({});
      })
      .catch(() => setError("Failed to fetch top products"))
      .finally(() => setLoading(false));
  };

  const getFieldValue = (p: TrendingProduct, field: string): number => {
    switch (field) {
      case "reviews":
        return p.reviews ?? p.total_reviews ?? p.total_ratings ?? p.product_num_ratings ?? p.product_rating_count ?? 0;
      case "price":
        return getProductPrice(p);
      case "rating":
        return p.rating ?? p.avg_rating ?? p.product_star_rating_numeric ?? p.product_star_rating ?? 0;
      case "sales":
        const rawSales = parseSalesVolume(p.sales_volume, p.avg_sales_volume ?? (p as any).estimated_sales);
        return source === "flipkart" ? Math.round(rawSales / 125) : rawSales;
      default:
        return 0;
    }
  };

  // Helper: Check if a string is an internal PID/ASIN/system code
  const isInternalCode = (text: string, p?: TrendingProduct): boolean => {
    if (!text) return true;
    const clean = text.trim();
    if (p?.pid && clean.toLowerCase() === p.pid.trim().toLowerCase()) return true;
    if (p?.asin && clean.toLowerCase() === p.asin.trim().toLowerCase()) return true;

    // Real human text has spaces, commas, slashes, or hyphens between words
    if (clean.includes(" ")) return false;

    // Reject raw PIDs / ASINs (e.g. STIGFG4SSZ8PHFCW, B08N5WRWNW)
    // Real codes are 8-25 chars containing letters and numbers with NO spaces
    if (/^[A-Z0-9]{8,25}$/i.test(clean)) {
      if (!/[0-9]/.test(clean)) return false; // Normal words like "Multicolor", "Standard" have no digits
      if (clean.length >= 10 && /[A-Z]/i.test(clean)) return true;
    }
    return false;
  };

  // Helper: Find longest common prefix of an array of strings
  const getCommonPrefix = (strings: string[]): string => {
    if (strings.length === 0) return "";
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    // Roll back to word boundary if cuts inside a word
    const lastSpace = prefix.lastIndexOf(" ");
    if (lastSpace > 0 && prefix.length - lastSpace < 6) {
      prefix = prefix.slice(0, lastSpace + 1);
    }
    return prefix;
  };

  // Helper: Find longest common suffix of an array of strings
  const getCommonSuffix = (strings: string[]): string => {
    if (strings.length === 0) return "";
    let suffix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].toLowerCase().endsWith(suffix.toLowerCase())) {
        suffix = suffix.slice(1);
        if (!suffix) return "";
      }
    }
    // Roll forward to word boundary if starts inside a word
    const firstSpace = suffix.indexOf(" ");
    if (firstSpace >= 0 && firstSpace < 6) {
      suffix = suffix.slice(firstSpace + 1);
    }
    return suffix;
  };

  // Helper: Dynamically extract what makes currentTitle unique compared to all other variant titles in the group
  // Completely data-driven: NO hardcoded colors, NO hardcoded units, NO hardcoded category lists
  const extractTitleDifference = (currentTitle: string, allTitles: string[]): string => {
    if (allTitles.length <= 1) return "";

    // 1. Prefix & Suffix diffing (e.g. "WolTop 300 cm x 40 cm Floral Wallpaper" vs "WolTop 500 cm x 40 cm Floral Wallpaper")
    const prefix = getCommonPrefix(allTitles);
    const suffix = getCommonSuffix(allTitles);

    let start = prefix.length;
    let end = currentTitle.length - suffix.length;

    if (start < end) {
      let diff = currentTitle.slice(start, end).trim();
      diff = diff.replace(/^[,\s\-|–—/()]+|[,\s\-|–—/()]+$/g, "").trim();
      if (diff.length >= 1 && diff.length <= 45) {
        return diff;
      }
    }

    // 2. Token subtraction (removes common template words shared by all siblings)
    const words = currentTitle.split(/\s+/);
    const otherTitlesTokens = allTitles
      .filter(t => t !== currentTitle)
      .map(t => new Set(t.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, ""))));

    const isCommonWord = (w: string) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!clean) return true;
      return otherTitlesTokens.every(tokenSet => tokenSet.has(clean));
    };

    let firstDiffIndex = -1;
    let lastDiffIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (!isCommonWord(words[i])) {
        if (firstDiffIndex === -1) firstDiffIndex = i;
        lastDiffIndex = i;
      }
    }

    if (firstDiffIndex !== -1 && lastDiffIndex !== -1) {
      const tokenDiff = words.slice(firstDiffIndex, lastDiffIndex + 1).join(" ");
      const cleaned = tokenDiff.replace(/^[,\s\-|–—/()]+|[,\s\-|–—/()]+$/g, "").trim();
      if (cleaned.length >= 1 && cleaned.length <= 45) {
        return cleaned;
      }
    }

    return "";
  };

  // Helper: Dynamically retrieve variant value directly from data or dynamic diffing
  const getProductVariant = (p: TrendingProduct, siblings?: TrendingProduct[]): string => {
    const currentTitle = (p.title || p.product_title || "").trim();
    const currentSub = (p.product_subtitle || p.description || "").trim();

    // 1. If group has multiple variants, dynamically compare them
    if (siblings && siblings.length > 1) {
      // Check if subtitles vary across the siblings
      const validSubs = siblings
        .map(v => {
          const s = (v.product_subtitle || v.description || "").trim();
          return s && !isInternalCode(s, v) ? s : "";
        })
        .filter(Boolean);
      
      const uniqueSubs = new Set(validSubs.map(s => s.toLowerCase()));
      
      // If each variant has a unique, descriptive subtitle from Flipkart/Amazon, use it directly!
      if (uniqueSubs.size > 1 && currentSub && !isInternalCode(currentSub, p)) {
        return currentSub;
      }

      // If subtitles are identical (e.g. all "Multicolor") or missing, dynamically diff the titles
      const allTitles = siblings.map(v => (v.title || v.product_title || "").trim()).filter(Boolean);
      if (allTitles.length > 1 && currentTitle) {
        const diff = extractTitleDifference(currentTitle, allTitles);
        if (diff) {
          return diff;
        }
      }
    }

    // 2. Direct platform subtitle/variant field if clean and human-readable
    if (currentSub && !isInternalCode(currentSub, p) && currentSub.toLowerCase() !== "standard") {
      return currentSub;
    }

    return "Standard";
  };

  // Helper: Extract clean concise name for sub-table variants
  const getCleanVariantName = (p: TrendingProduct): string => {
    const fullTitle = (p.title || p.product_title || "").trim();
    if (!fullTitle) return "Standard Variant";

    // If title has pipe separators: "Vaseline Deep Moisture Body Lotion | For Cushion Soft Skin| With Ceramides Hyaluron"
    const pipeParts = fullTitle.split("|").map(s => s.trim());
    if (pipeParts.length > 1 && pipeParts[0].length >= 8) {
      return pipeParts[0].replace(/\bwith\s+.*$/i, "").trim() || pipeParts[0];
    }

    // If title has commas: "MUUCHSTAC Ocean for Men, Anti Acne & Pimple, Skin Brightening, All Skin Types Face Wash"
    const commaParts = fullTitle.split(",").map(s => s.trim());
    if (commaParts.length > 1) {
      const first = commaParts[0];
      const typeMatch = fullTitle.match(/\b(face wash|body wash|body lotion|lotion|sunscreen|serum|cream|shampoo|cleanser|moisturizer|oil|gel|spray|soap)\b/i);
      if (typeMatch) {
        const type = typeMatch[0];
        const base = first.replace(/\bfor\s+(?:men|women|kids)\b/i, "").trim();
        if (base.toLowerCase().includes(type.toLowerCase())) {
          return base;
        }
        const formattedType = type.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return `${base} ${formattedType}`;
      }
      return first;
    }

    if (fullTitle.length > 45) {
      return fullTitle.slice(0, 42) + "…";
    }
    return fullTitle;
  };

  // Helper: Normalize title and extract tokens for grouping comparison
  const normalizeProductTitle = (title: string, brand?: string): { cleanName: string; tokens: Set<string> } => {
    let cleaned = (title || "").toLowerCase();

    // Remove unit/size specifications
    cleaned = cleaned.replace(/\b\d+(\.\d+)?\s*(ml|l|ltr|litres?|liters?|g|gm|gms|kg|kgs|pcs|pieces|pack of \d+|pack|count|gb|tb|cm|inch|inches|tablets?|tabs?|capsules?|caps)\b/gi, "");
    cleaned = cleaned.replace(/\([^)]*\)/g, "");

    const pipeIndex = cleaned.indexOf("|");
    if (pipeIndex > 10) {
      cleaned = cleaned.substring(0, pipeIndex);
    }

    const words = cleaned
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 1);

    const stopWords = new Set([
      "for", "with", "and", "the", "in", "of", "to", "all", "types", "more", "dry", "soft", 
      "cushion", "brightening", "brighten", "fights", "anti", "acne", "pimple", "men", "women",
      "pure", "natural", "daily", "deep", "instant", "new", "best", "pro", "plus", "ultra"
    ]);

    const stemmed = words.map(w => {
      if (w.endsWith("ies")) return w.slice(0, -3) + "y";
      if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
      return w;
    });

    const tokens = new Set(stemmed.filter(w => !stopWords.has(w)));
    return { cleanName: cleaned.trim(), tokens };
  };

  // Helper: Check if two items are variants of the same product
  const areVariantsOfSameProduct = (
    p1: TrendingProduct, 
    p2: TrendingProduct,
    t1: { cleanName: string; tokens: Set<string> },
    t2: { cleanName: string; tokens: Set<string> }
  ): boolean => {
    // If explicit parent match
    const parent1 = (p1 as any).parent_asin || (p1 as any).product_parent || (p1 as any).parent_id;
    const parent2 = (p2 as any).parent_asin || (p2 as any).product_parent || (p2 as any).parent_id;
    if (parent1 && parent2 && parent1 === parent2) return true;

    // Check Category
    const cat1 = (p1.category || p1.category_name || "").toLowerCase().trim();
    const cat2 = (p2.category || p2.category_name || "").toLowerCase().trim();
    if (cat1 && cat2 && cat1 !== cat2) return false;

    // Check Brand
    const b1 = (p1.brand || "").toLowerCase().trim();
    const b2 = (p2.brand || "").toLowerCase().trim();
    if (b1 && b2 && b1 !== b2) return false;

    if (b1 && !b2 && !p2.title?.toLowerCase().includes(b1)) return false;
    if (b2 && !b1 && !p1.title?.toLowerCase().includes(b2)) return false;

    // Clean variant names identical
    const vName1 = getCleanVariantName(p1).toLowerCase();
    const vName2 = getCleanVariantName(p2).toLowerCase();
    if (vName1 && vName2 && vName1 === vName2) {
      return true;
    }

    if (t1.cleanName && t2.cleanName && (t1.cleanName === t2.cleanName || t1.cleanName.startsWith(t2.cleanName) || t2.cleanName.startsWith(t1.cleanName))) {
      return true;
    }

    // Token Overlap
    const setA = t1.tokens;
    const setB = t2.tokens;
    if (setA.size === 0 || setB.size === 0) return false;

    let intersectionCount = 0;
    for (const token of Array.from(setA)) {
      if (setB.has(token)) {
        intersectionCount++;
      }
    }

    const minTokens = Math.min(setA.size, setB.size);
    const overlapRatio = intersectionCount / minTokens;

    return intersectionCount >= 3 && overlapRatio >= 0.65;
  };

  // Group raw products into Parent listings
  const groupedProducts: GroupedProduct[] = useMemo(() => {
    if (!products || products.length === 0) return [];

    const groups: GroupedProduct[] = [];
    const tokenizedList = products.map(p => ({
      product: p,
      norm: normalizeProductTitle(p.title || p.product_title || "", p.brand)
    }));

    for (let i = 0; i < tokenizedList.length; i++) {
      const item = tokenizedList[i];
      let foundGroup: GroupedProduct | null = null;

      for (const group of groups) {
        const primaryNorm = normalizeProductTitle(group.primaryProduct.title || group.primaryProduct.product_title || "", group.primaryProduct.brand);
        if (areVariantsOfSameProduct(item.product, group.primaryProduct, item.norm, primaryNorm)) {
          foundGroup = group;
          break;
        }
      }

      if (foundGroup) {
        foundGroup.variants.push(item.product);
      } else {
        groups.push({
          groupId: item.product.pid || item.product.asin || `group-${i}`,
          parentTitle: item.product.title || item.product.product_title || "",
          brand: item.product.brand,
          category: item.product.category || item.product.category_name,
          variants: [item.product],
          totalSales: 0,
          totalReviews: 0,
          minPrice: 0,
          maxPrice: 0,
          avgRating: 0,
          primaryProduct: item.product,
        });
      }
    }

    // Compute aggregated metrics for each group
    for (const g of groups) {
      g.variants.sort((a, b) => getFieldValue(b, "sales") - getFieldValue(a, "sales"));
      g.totalSales = g.variants.reduce((sum, v) => sum + getFieldValue(v, "sales"), 0);
      g.totalReviews = g.variants.reduce((sum, v) => sum + getFieldValue(v, "reviews"), 0);

      const prices = g.variants.map(v => getProductPrice(v)).filter(p => p > 0);
      g.minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      g.maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      let totalReviewWeight = 0;
      let weightedRatingSum = 0;
      for (const v of g.variants) {
        const r = getFieldValue(v, "rating");
        const rev = getFieldValue(v, "reviews") || 1;
        if (r > 0) {
          weightedRatingSum += r * rev;
          totalReviewWeight += rev;
        }
      }
      g.avgRating = totalReviewWeight > 0 ? weightedRatingSum / totalReviewWeight : (getFieldValue(g.primaryProduct, "rating") || 0);
      g.primaryProduct = g.variants[0];
      g.parentTitle = g.primaryProduct.title || g.primaryProduct.product_title || g.parentTitle;
    }

    return groups;
  }, [products, source]);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!debouncedSearch) return groupedProducts;
    const query = debouncedSearch.toLowerCase().trim();
    return groupedProducts.filter((group) => {
      const titleMatch = group.parentTitle.toLowerCase().includes(query);
      const brandMatch = group.brand?.toLowerCase().includes(query);
      const catMatch = group.category?.toLowerCase().includes(query);
      const variantMatch = group.variants.some((v) => {
        const vTitle = (v.title || v.product_title || "").toLowerCase();
        const vSub = (v.description || v.product_subtitle || "").toLowerCase();
        const vId = (v.pid || v.asin || "").toLowerCase();
        return vTitle.includes(query) || vSub.includes(query) || vId.includes(query);
      });
      return titleMatch || brandMatch || catMatch || variantMatch;
    });
  }, [groupedProducts, debouncedSearch]);

  // Sort groups
  const sortedGroups = useMemo(() => {
    const factor = sortOrder === "asc" ? 1 : -1;
    return [...filteredGroups].sort((a, b) => {
      switch (sortField) {
        case "sales":
          return (a.totalSales - b.totalSales) * factor;
        case "reviews":
          return (a.totalReviews - b.totalReviews) * factor;
        case "price":
          const priceA = sortOrder === "asc" ? a.minPrice : a.maxPrice;
          const priceB = sortOrder === "asc" ? b.minPrice : b.maxPrice;
          return (priceA - priceB) * factor;
        case "rating":
          return (a.avgRating - b.avgRating) * factor;
        default:
          return 0;
      }
    });
  }, [filteredGroups, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = sortedGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Auto-expand first item if it has variants on initial load
  useEffect(() => {
    if (currentGroups.length > 0 && currentGroups[0].variants.length > 1) {
      setExpandedGroups(prev => {
        if (Object.keys(prev).length === 0) {
          return { [currentGroups[0].groupId]: true };
        }
        return prev;
      });
    }
  }, [currentGroups]);

  const toggleSort = (field: "reviews" | "price" | "rating" | "sales") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = currentGroups.every(g => g.variants.length <= 1 || expandedGroups[g.groupId]);
    const nextState: Record<string, boolean> = { ...expandedGroups };
    for (const g of currentGroups) {
      if (g.variants.length > 1) {
        nextState[g.groupId] = !allExpanded;
      }
    }
    setExpandedGroups(nextState);
  };

  const getMetricColumns = (): Array<"sales" | "reviews" | "price" | "rating"> => {
    const allMetrics: Array<"sales" | "reviews" | "price" | "rating"> = ["sales", "reviews", "price", "rating"];
    const rest = allMetrics.filter((m) => m !== sortField);
    return [sortField, ...rest];
  };

  const getMetricLabel = (field: "sales" | "reviews" | "price" | "rating") => {
    switch (field) {
      case "price":
        return t("sales.price", "Price (₹)");
      case "rating":
        return t("sales.rating", "Rating");
      case "reviews":
        return t("sales.reviews", "Reviews");
      case "sales":
        return t("sales.sales", "Sales");
    }
  };

  const formatSalesDisplay = (salesNum: number): string => {
    if (!salesNum || salesNum === 0) return "0";
    if (salesNum >= 1000000) {
      return `${(salesNum / 1000000).toFixed(1)}M`;
    }
    if (salesNum >= 1000) {
      return `${(salesNum / 1000).toFixed(1)}K`;
    }
    return salesNum.toLocaleString();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Find the group to which selectedProduct belongs (for modal variant switcher)
  const selectedGroup = useMemo(() => {
    if (!selectedProduct) return null;
    return groupedProducts.find(g => 
      g.variants.some(v => 
        (v.pid && v.pid === selectedProduct.pid) || 
        (v.asin && v.asin === selectedProduct.asin) || 
        v.id === selectedProduct.id ||
        (v.title && v.title === selectedProduct.title)
      )
    );
  }, [selectedProduct, groupedProducts]);

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p>{t('sales.loading', 'Loading {{source}} top product data...', { source })}</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header & Source Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="text-left space-y-1">
          <h1 className="page-title">
            Top {products.length} Selling Products ({source})
          </h1>
          <p className="page-subtitle">
            {t('sales.subtitle', 'Analyze and sort by sales, reviews, price, or rating for data-driven decisions.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as "flipkart" | "amazon")}
            className={cn(
              "border px-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm",
              isDark 
                ? "border-slate-700 bg-slate-900 text-slate-100" 
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            )}
            data-track-id="sales_source_select"
            data-filter-value={source}
          >
            <option value="flipkart" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Flipkart India</option>
            <option value="amazon" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Amazon India</option>
          </select>

          <div className="relative max-w-[170px] sm:max-w-[220px]">
            <Filter className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              isDark ? "text-slate-400" : "text-slate-500"
            )} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              disabled={categoriesLoading}
              className={cn(
                "border pl-8 pr-3 py-2 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full truncate text-xs sm:text-sm",
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                categoriesLoading && "opacity-50 cursor-wait"
              )}
              data-track-id="sales_category_select"
              data-filter-value={selectedCategory}
            >
              <option value="All Categories" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}
                >
                  {cat.length > 25 ? cat.slice(0, 25) + "…" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar & Sort Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="relative w-full sm:w-80">
          <SmartSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('sales.searchPlaceholder', 'Search products...')}
            className="w-full"
            inputClassName={cn(
              "w-full text-sm font-medium",
              isDark 
                ? "border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500" 
                : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            )}
          />
        </div>
        <div className="flex justify-end gap-3 flex-wrap">
          {["sales", "reviews", "price", "rating"].map((field) => (
            <Button
              key={field}
              variant={sortField === field ? "default" : "outline"}
              className={cn(
                "flex items-center gap-2",
                sortField === field
                  ? isDark
                    ? "bg-sky-700/90 hover:bg-sky-600 text-white border-sky-500/40 shadow-xs"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : isDark
                    ? "text-slate-300 border-slate-800 hover:bg-slate-800/60 bg-slate-900/60"
                    : "text-slate-700 border-slate-300 hover:bg-slate-100"
              )}
              onClick={() => toggleSort(field as "reviews" | "price" | "rating" | "sales")}
              data-track-id="sales_sort_btn"
              data-filter-value={field}
              disabled={loading}
            >
              <ArrowUpDown className="w-4 h-4" />
              {t(`sales.sort_${field}`, field.charAt(0).toUpperCase() + field.slice(1))}
              {sortField === field ? ` (${sortOrder === "asc" ? "↑" : "↓"})` : ""}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className={cn(
        "shadow-sm rounded-2xl overflow-hidden border",
        isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
      )}>
        {/* Banner: Products grouped by parent listing • Expand to compare variants */}
        <div className={cn(
          "px-4 py-2.5 border-b flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-medium",
          isDark 
            ? "bg-sky-950/20 text-sky-300 border-slate-800" 
            : "bg-blue-50/70 text-blue-800 border-blue-100"
        )}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{t('sales.groupedBanner', 'Products grouped by parent listing • Expand to compare variants')}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleExpandAll}
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors cursor-pointer",
                isDark 
                  ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700" 
                  : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
              )}
            >
              {currentGroups.every(g => g.variants.length <= 1 || expandedGroups[g.groupId])
                ? t('sales.collapseAll', 'Collapse All')
                : t('sales.expandAll', 'Expand All')}
            </button>
            <span className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
              isDark 
                ? "bg-slate-800/80 text-sky-400 border-sky-800/60" 
                : "bg-white text-blue-600 border-blue-200"
            )}>
              {filteredGroups.length} {t('sales.parentListings', 'Parent Listings')}
            </span>
          </div>
        </div>

        <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
            {t('sales.showingPage', 'Showing Page')} {currentPage} {t('sales.of', 'of')} {totalPages} — {t('sales.sortedBy', 'Sorted by')}{" "}
            {t(`sales.sort_${sortField}`, sortField.charAt(0).toUpperCase() + sortField.slice(1))}{" "}
            ({sortOrder === "asc" ? t('sales.lowToHigh', 'Low → High') : t('sales.highToLow', 'High → Low')})
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <table className={cn("w-full text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
            <thead className={cn(
              "uppercase text-xs font-semibold",
              isDark ? "bg-slate-800/80 text-slate-400" : "bg-slate-100 text-slate-700"
            )}>
              <tr>
                <th className={cn("py-3 px-4 text-left border-b w-16", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>
                  #
                </th>
                <th className={cn("py-3 px-4 text-left border-b", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>
                  {t('sales.product', 'Product')}
                </th>
                <th className={cn("py-3 px-4 text-left border-b w-32", isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200")}>
                  {t('sales.category', 'Category')}
                </th>
                {getMetricColumns().map((field) => {
                  const isSorted = sortField === field;
                  return (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className={cn(
                        "py-3 px-4 text-right border-b cursor-pointer select-none transition-colors w-32",
                        isSorted
                          ? isDark
                            ? "bg-slate-800/80 text-sky-300 font-bold border-slate-700"
                            : "bg-blue-50 text-blue-700 font-bold border-blue-300"
                          : isDark
                            ? "bg-slate-800/80 border-slate-700 hover:bg-slate-750"
                            : "bg-slate-100 border-slate-200 hover:bg-slate-200/70"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{getMetricLabel(field)}</span>
                        {isSorted && (
                          <span className="text-xs font-extrabold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentGroups.map((group, i) => {
                const isExpanded = !!expandedGroups[group.groupId];
                const hasVariants = group.variants.length > 1;

                return (
                  <Fragment key={group.groupId}>
                    {/* Parent Row */}
                    <tr
                      className={cn(
                        "transition-colors group",
                        isDark 
                          ? isExpanded ? "bg-slate-800/40 hover:bg-slate-800/60" : "hover:bg-slate-800/30" 
                          : isExpanded ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"
                      )}
                      data-track-id="sales_parent_row"
                      data-filter-value={group.parentTitle}
                    >
                      {/* Chevron & Rank Number */}
                      <td className={cn("py-3.5 px-4 font-medium whitespace-nowrap", isDark ? "text-slate-400" : "text-slate-600")}>
                        <div className="flex items-center gap-2">
                          {hasVariants ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.groupId)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-sky-400 transition-colors focus:outline-none"
                              title={isExpanded ? "Collapse variants" : "Expand variants"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          ) : (
                            <span className="w-6 inline-block" />
                          )}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </span>
                        </div>
                      </td>

                      {/* Product Title, Brand & Variants Pill */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={cn(
                              "font-semibold line-clamp-2 transition-colors hover:text-blue-500 dark:hover:text-sky-400 cursor-pointer",
                              isDark ? "text-slate-200" : "text-slate-900"
                            )}
                            title={group.parentTitle}
                            onClick={() => setSelectedProduct(group.primaryProduct)}
                          >
                            {group.parentTitle}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {group.brand && (
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                {group.brand}
                              </span>
                            )}
                            {hasVariants && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(group.groupId)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-colors cursor-pointer",
                                  isDark
                                    ? "bg-sky-950/60 text-sky-400 border-sky-800/80 hover:bg-sky-900/60"
                                    : "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100"
                                )}
                              >
                                {group.variants.length} variants
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className={cn("py-3.5 px-4 font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
                        {group.category || group.primaryProduct.category || group.primaryProduct.category_name || source}
                      </td>

                      {/* Metrics Columns */}
                      {getMetricColumns().map((field) => {
                        const isSorted = sortField === field;
                        const baseCellClass = cn(
                          "py-3.5 px-4 text-right transition-colors",
                          isSorted
                            ? isDark
                              ? "bg-slate-800/40 font-semibold"
                              : "bg-blue-50/50 font-bold"
                            : ""
                        );

                        switch (field) {
                          case "price":
                            return (
                              <td key={field} className={cn(baseCellClass, "text-emerald-600 dark:text-emerald-400 font-semibold")}>
                                {group.minPrice < group.maxPrice
                                  ? `₹${Math.round(group.minPrice)}–₹${Math.round(group.maxPrice)}`
                                  : `₹${group.minPrice.toFixed(2)}`}
                              </td>
                            );
                          case "rating":
                            return (
                              <td key={field} className={cn(baseCellClass, "text-slate-700 dark:text-slate-300 font-semibold")}>
                                <Star className="inline w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                                {group.avgRating.toFixed(1)}
                              </td>
                            );
                          case "reviews":
                            return (
                              <td key={field} className={cn(baseCellClass, isDark ? "text-slate-200 font-medium" : "text-blue-600 font-semibold")}>
                                {group.totalReviews.toLocaleString()}
                              </td>
                            );
                          case "sales":
                            return (
                              <td key={field} className={cn(baseCellClass, isDark ? "text-purple-300 font-semibold" : "text-purple-600 font-bold")}>
                                <TrendingUp className="inline w-3.5 h-3.5 mr-1 text-purple-400" />
                                {formatSalesDisplay(group.totalSales)}
                              </td>
                            );
                        }
                      })}
                    </tr>

                    {/* Sub-Table of Variants (Exact visual reproduction of Image 2) */}
                    {isExpanded && hasVariants && (
                      <tr className={cn(
                        "border-t",
                        isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50/80 border-slate-200"
                      )}>
                        <td colSpan={3 + getMetricColumns().length} className="p-0">
                          <div className="px-6 py-3 overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm">
                              <thead>
                                <tr className={cn(
                                  "font-semibold text-xs border-b",
                                  isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                                )}>
                                  <th className="py-2.5 px-3 text-left w-[42%] font-medium">{t('sales.product', 'Product')}</th>
                                  <th className="py-2.5 px-3 text-left w-[18%] font-medium">{t('sales.variant', 'Variant')}</th>
                                  <th className="py-2.5 px-3 text-right font-medium">Sales</th>
                                  <th className="py-2.5 px-3 text-right font-medium">Reviews</th>
                                  <th className="py-2.5 px-3 text-right font-medium">Price (₹)</th>
                                  <th className="py-2.5 px-3 text-right font-medium">Rating</th>
                                </tr>
                              </thead>
                              <tbody className={cn("divide-y", isDark ? "divide-slate-800/60" : "divide-slate-100")}>
                                {group.variants.map((variant, vIdx) => {
                                  const variantPrice = getProductPrice(variant);
                                  const variantRating = getFieldValue(variant, "rating");
                                  const variantSales = getFieldValue(variant, "sales");
                                  const variantReviews = getFieldValue(variant, "reviews");
                                  const variantValue = getProductVariant(variant, group.variants);
                                  const cleanName = getCleanVariantName(variant);

                                  return (
                                    <tr
                                      key={variant.pid || variant.asin || vIdx}
                                      onClick={() => setSelectedProduct(variant)}
                                      className={cn(
                                        "transition-colors cursor-pointer group/row",
                                        isDark 
                                          ? "hover:bg-slate-800/50 text-slate-300" 
                                          : "hover:bg-white text-slate-700"
                                      )}
                                      title={variant.title || variant.product_title}
                                    >
                                      {/* Product Thumbnail + Name + PID Tag */}
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                            {variant.product_photo ? (
                                              <img
                                                src={variant.product_photo}
                                                alt={cleanName}
                                                className="w-full h-full object-contain p-0.5"
                                                onError={(e) => {
                                                  (e.target as HTMLElement).style.display = "none";
                                                }}
                                              />
                                            ) : (
                                              <Package className="w-4 h-4 text-slate-400" />
                                            )}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 dark:text-slate-200 group-hover/row:text-blue-600 dark:group-hover/row:text-sky-400 transition-colors line-clamp-1">
                                              {cleanName}
                                            </span>
                                            {(variant.pid || variant.asin) && (
                                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                                {source === "flipkart" ? `PID: ${variant.pid}` : `ASIN: ${variant.asin}`}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Variant (Retrieved directly from product_subtitle / description, e.g. 600 ml, 400 ml, Black) */}
                                      <td className="py-2.5 px-3">
                                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200/60 dark:border-slate-700/60">
                                          {variantValue}
                                        </span>
                                      </td>

                                      {/* Sales */}
                                      <td className="py-2.5 px-3 text-right font-semibold text-purple-600 dark:text-purple-400">
                                        <TrendingUp className="inline w-3 h-3 mr-1 text-purple-400" />
                                        {formatSalesDisplay(variantSales)}
                                      </td>

                                      {/* Reviews */}
                                      <td className="py-2.5 px-3 text-right font-semibold text-blue-600 dark:text-sky-400">
                                        {variantReviews.toLocaleString()}
                                      </td>

                                      {/* Price */}
                                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                        ₹{Math.round(variantPrice)}
                                      </td>

                                      {/* Rating */}
                                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                                        <Star className="inline w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                                        {variantRating.toFixed(1)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={cn(
            "border transition-colors",
            isDark 
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
          )}
          data-track-id="sales_prev_page_btn"
        >
          {t('sales.previous', 'Previous')}
        </Button>

        <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
          {t('sales.page', 'Page')} {currentPage} {t('sales.of', 'of')} {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={cn(
            "border transition-colors",
            isDark 
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
          )}
          data-track-id="sales_next_page_btn"
        >
          {t('sales.next', 'Next')}
        </Button>
      </div>

      {/* Product Details Modal (With Variant Switcher) */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className={cn("max-w-2xl max-h-[85vh] overflow-y-auto", isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white text-slate-800")}>
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      {selectedProduct.category || selectedProduct.category_name || source}
                    </span>
                    {selectedProduct.brand && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {selectedProduct.brand}
                      </span>
                    )}
                    {(selectedProduct.pid || selectedProduct.asin) && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {source === "flipkart" ? `PID: ${selectedProduct.pid}` : `ASIN: ${selectedProduct.asin}`}
                      </span>
                    )}
                  </div>
                </div>
                <DialogTitle className="text-lg font-bold mt-2 text-left">
                  {selectedProduct.title || selectedProduct.product_title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-left">
                  {selectedProduct.brand ? `Brand: ${selectedProduct.brand}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Available Variants Selector if grouped */}
                {selectedGroup && selectedGroup.variants.length > 1 && (
                  <div className={cn("p-3.5 rounded-xl border", isDark ? "bg-slate-800/40 border-slate-800" : "bg-blue-50/40 border-blue-100")}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        Available Variants ({selectedGroup.variants.length})
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-sky-400">Click to compare</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.variants.map((v, idx) => {
                        const isCurrent = (v.pid && v.pid === selectedProduct.pid) || 
                                          (v.asin && v.asin === selectedProduct.asin) || 
                                          v.id === selectedProduct.id ||
                                          v === selectedProduct;
                        const option = getProductVariant(v, selectedGroup.variants);
                        const price = getProductPrice(v);

                        return (
                          <button
                            key={v.pid || v.asin || idx}
                            type="button"
                            onClick={() => setSelectedProduct(v)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer",
                              isCurrent
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : isDark
                                  ? "bg-slate-900 text-slate-300 border-slate-700 hover:border-blue-500 hover:bg-slate-800"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                            )}
                          >
                            <span className="font-semibold">{option}</span>
                            <span className={cn(isCurrent ? "text-blue-100" : "text-emerald-600 dark:text-emerald-400 font-semibold")}>
                              ₹{Math.round(price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3">
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Price</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹{getProductPrice(selectedProduct).toFixed(2)}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Rating</div>
                    <div className="text-base font-bold text-yellow-500 mt-1">
                      ★ {(selectedProduct.rating ?? selectedProduct.avg_rating ?? selectedProduct.product_star_rating_numeric ?? selectedProduct.product_star_rating ?? 0).toFixed(1)}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Reviews</div>
                    <div className="text-base font-bold text-blue-500 mt-1">
                      {(selectedProduct.reviews ?? selectedProduct.total_reviews ?? selectedProduct.total_ratings ?? selectedProduct.product_num_ratings ?? selectedProduct.product_rating_count ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl border text-center", isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs text-slate-400 font-medium">Sales</div>
                    <div className="text-base font-bold text-purple-500 mt-1">
                      {formatSalesDisplay(getFieldValue(selectedProduct, "sales"))}
                    </div>
                  </div>
                </div>

                {/* Subtitle / Description */}
                {(selectedProduct.description || selectedProduct.product_subtitle) && (
                  <div className={cn("p-3.5 rounded-xl border", isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Subtitle & Variant</div>
                    <p className="text-sm font-medium leading-relaxed">
                      {selectedProduct.description || selectedProduct.product_subtitle}
                    </p>
                  </div>
                )}

                {/* Highlights / Features List */}
                {getHighlightsArray(selectedProduct.highlights).length > 0 && (
                  <div className={cn("p-3.5 rounded-xl border", isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200")}>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Highlights & Features</div>
                    <ul className="space-y-1.5 list-disc list-inside text-sm font-medium">
                      {getHighlightsArray(selectedProduct.highlights).map((h, i) => (
                        <li key={i} className="leading-snug text-slate-600 dark:text-slate-300">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {selectedProduct.product_url && (
                  <div className="flex justify-end pt-2">
                    <Button
                      asChild
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 font-medium"
                    >
                      <a href={selectedProduct.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        Open on {source === "flipkart" ? "Flipkart" : "Amazon"}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}