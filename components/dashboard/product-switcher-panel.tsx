"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSessionState } from "@/hooks/use-session-state";
import { useSelectedProduct } from "@/lib/selected-product-context";
import { API_BASE_URL } from "@/lib/config";
import { ChevronLeft, ChevronRight, Package, Loader2, Layers } from "lucide-react";
import { useTheme } from "next-themes";

interface Product {
  asin: string;
  title: string;
  image?: string;
  price?: string | number;
  rating?: number;
}

interface ProductSwitcherPanelProps {
  currentAsin?: string;
  sellerId?: string;
}

export default function ProductSwitcherPanel({ currentAsin, sellerId }: ProductSwitcherPanelProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSelected } = useSelectedProduct();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const effectiveSellerId = sellerId || user?.seller_id || "";
  const activeAsin = currentAsin || searchParams.get("asin") || "";

  const [products, setProducts] = useSessionState<Product[]>("seller_my_products_data", []);
  const [lastFetchedSellerId, setLastFetchedSellerId] = useSessionState<string>(
    "seller_my_products_last_seller_id",
    ""
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!effectiveSellerId) return;
    if (products.length > 0 && lastFetchedSellerId === effectiveSellerId) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/api/seller/products?seller_id=${effectiveSellerId}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products) {
          setProducts(data.products);
          setLastFetchedSellerId(effectiveSellerId);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [effectiveSellerId, products.length, lastFetchedSellerId]);

  const handleSelectProduct = (p: Product) => {
    setSelected({ asin: p.asin, sellerId: effectiveSellerId });
    const params = new URLSearchParams({ asin: p.asin, seller_id: effectiveSellerId });
    router.push(`${pathname}?${params}`);
  };

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`flex flex-row transition-all duration-300 ${
        open ? "w-64" : "w-10"
      } shrink-0`}
    >
      {/* Panel body */}
      <div
        className={`relative rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
          open ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none overflow-hidden"
        } ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} shadow-sm`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 border-b flex items-center gap-2 shrink-0 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDark ? "bg-sky-900/30" : "bg-sky-50"
            }`}
          >
            <Layers className={`w-4 h-4 ${isDark ? "text-sky-400" : "text-sky-600"}`} />
          </div>
          <span className={`font-bold text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            My Products
          </span>
          {products.length > 0 && (
            <span
              className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
              }`}
            >
              {products.length}
            </span>
          )}
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-12rem)] py-1">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2
                className={`w-5 h-5 animate-spin ${isDark ? "text-sky-400" : "text-sky-500"}`}
              />
            </div>
          ) : products.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center h-24 gap-2 px-4 text-center`}
            >
              <Package
                className={`w-6 h-6 ${isDark ? "text-slate-600" : "text-slate-300"}`}
              />
              <p
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                No products found
              </p>
            </div>
          ) : (
            products.map((p) => {
              const isActive = p.asin === activeAsin;
              return (
                <button
                  key={p.asin}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all group ${
                    isActive
                      ? isDark
                        ? "bg-sky-900/25 border-l-2 border-sky-500"
                        : "bg-sky-50 border-l-2 border-sky-500"
                      : isDark
                      ? "hover:bg-slate-800/60 border-l-2 border-transparent"
                      : "hover:bg-slate-50 border-l-2 border-transparent"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className={`w-9 h-9 rounded-lg border overflow-hidden flex items-center justify-center flex-shrink-0 ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span
                        className={`font-bold text-sm ${
                          isDark ? "text-slate-600" : "text-slate-300"
                        }`}
                      >
                        {p.title?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  {/* Title + ASIN */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold line-clamp-2 leading-tight ${
                        isActive
                          ? isDark
                            ? "text-sky-400"
                            : "text-sky-700"
                          : isDark
                          ? "text-slate-300 group-hover:text-slate-100"
                          : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      {p.title}
                    </p>
                    <p
                      className={`text-[10px] font-mono mt-0.5 ${
                        isDark ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {p.asin}
                    </p>
                  </div>
                  {isActive && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isDark ? "bg-sky-400" : "bg-sky-500"
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-7 shrink-0 rounded-r-xl border-y border-r transition-all hover:opacity-80 ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
        }`}
        title={open ? "Collapse product list" : "Expand product list"}
      >
        {open ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
