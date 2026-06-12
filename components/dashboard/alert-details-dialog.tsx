"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Star, Package, AlertCircle, ExternalLink, Crown } from "lucide-react";
import { useAlerts, Notification } from "@/components/dashboard/alert-context";

export default function AlertDetailsDialog() {
  const router = useRouter();
  const { selectedAlert, isAlertDialogOpen, closeAlertDialog } = useAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "price_drop": return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "price_increase": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "review_spike": return <Star className="w-5 h-5 text-yellow-500" />;
      case "sales_spike": return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "new_product": return <Package className="w-5 h-5 text-purple-500" />;
      case "upgrade": return <Crown className="w-5 h-5 text-amber-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isAlertDialogOpen} onOpenChange={closeAlertDialog}>
      <DialogContent className="max-w-2xl rounded-3xl bg-background border-slate-200 dark:border-slate-805 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {selectedAlert && getAlertIcon(selectedAlert.type)}
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedAlert?.type.replace(/_/g, " ").toUpperCase()}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base font-medium">
            {selectedAlert?.message}
          </DialogDescription>
        </DialogHeader>
        
        {selectedAlert?.details && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mt-4 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Alert Intelligence</h4>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{selectedAlert.time}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {selectedAlert.details.product_title && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impacted Product</p>
                  <p 
                    className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-305 cursor-pointer hover:underline transition-all leading-snug"
                    onClick={() => {
                      closeAlertDialog();
                      router.push(`/product/${encodeURIComponent(selectedAlert.details!.product_title!)}?from=notification&source=${selectedAlert.platform?.toLowerCase() || 'amazon'}`);
                    }}
                  >
                    {selectedAlert.details.product_title}
                  </p>
                </div>
              )}
              
              {selectedAlert.details.old_price && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Previous Price</p>
                  <p className="text-sm font-bold text-slate-400 line-through">₹{selectedAlert.details.old_price.toLocaleString()}</p>
                </div>
              )}
              
              {selectedAlert.details.new_price && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">New Price</p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-450">₹{selectedAlert.details.new_price.toLocaleString()}</p>
                </div>
              )}
              
              {selectedAlert.details.discount_percent && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Price Drop</p>
                  <p className="text-sm font-extrabold text-rose-600 dark:text-rose-450">-{selectedAlert.details.discount_percent}% OFF</p>
                </div>
              )}
              
              {selectedAlert.details.rating && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Sentiment</p>
                  <p className="text-sm font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    {selectedAlert.details.rating} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
              )}
              
              {selectedAlert.details.estimated_sales && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Sales Impact</p>
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{selectedAlert.details.estimated_sales} units/mo</p>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full h-12 mt-4 bg-sky-900 hover:bg-sky-950 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 dark:shadow-none transition-all border-none" 
              onClick={() => window.open(`https://www.amazon.in/dp/${selectedAlert.details?.product_id}`, "_blank")}
            >
              Live Marketplace View <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
