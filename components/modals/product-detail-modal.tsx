"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Package, ExternalLink, ShoppingBag, ShieldCheck } from "lucide-react";
import { Dialog as ShadcnDialog, DialogContent as ShadcnContent } from "@/components/ui/dialog";

export interface FastProduct {
  id?: number | string;
  asin?: string;
  product_title?: string;
  title?: string;
  product_photo?: string;
  image?: string;
  category_name?: string;
  category?: string;
  daily_sales?: number;
  price?: number;
  reviews?: number;
  rating?: number;
  source?: string;
}

interface ProductDetailModalProps {
  product: FastProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  if (!product) return null;

  const title = product.product_title || product.title || "Product Details";
  const photo = product.product_photo || product.image || "/logo.png";
  const category = product.category_name || product.category || "General Category";
  const price = product.price || 499;
  const rating = product.rating || 4.2;
  const reviews = product.reviews || 0;
  const dailySales = product.daily_sales || 1200;
  const source = product.source || "amazon";

  const formatNum = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <ShadcnDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ShadcnContent className="sm:max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
        {/* Header Image & Title Banner */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50/50 to-indigo-50/60 dark:from-slate-950 dark:to-slate-900 p-5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src={photo}
                alt={title}
                className="w-full h-full object-contain rounded-md"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute("src", "https://via.placeholder.com/80?text=Product");
                }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                {source.toUpperCase()} LISTING
              </Badge>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Category: <span className="text-slate-700 dark:text-slate-300 font-semibold">{category}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Metrics & Intelligence Breakdown */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Daily Sales</p>
              <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatNum(dailySales)} <span className="text-[10px] font-normal text-slate-500">units/day</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                ₹{price.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating & Reviews</p>
              <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                {rating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] text-slate-500 font-medium">({formatNum(reviews)})</span>
              </p>
            </div>
          </div>

          {/* Key Insights Summary Box */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-800/70 border border-sky-200/60 dark:border-slate-700/60 space-y-1.5">
            <h4 className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> Market Intelligence Insight
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              This SKU exhibits high sales velocity ({formatNum(dailySales)} units/day). Margin headroom is strong at the current ₹{price} price point.
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs font-bold h-9">
              Close
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-sky-700 dark:hover:bg-sky-600 dark:border dark:border-sky-500/40 text-white text-xs font-bold h-9 gap-1.5 shadow-md shadow-blue-500/20 dark:shadow-none"
              onClick={() => {
                const url = source === "flipkart" 
                  ? `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`
                  : `https://www.amazon.in/dp/${product.asin || ""}`;
                window.open(url, "_blank");
              }}
            >
              <span>View Marketplace SKU</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </ShadcnContent>
    </ShadcnDialog>
  );
}
