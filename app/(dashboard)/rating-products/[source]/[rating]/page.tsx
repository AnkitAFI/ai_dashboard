"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, Star, ShoppingBag, Menu } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useTranslation } from "react-i18next";

interface Product {
  product_name: string;
  avg_price: number;
  min_price?: number | null;
  max_price?: number | null;
  total_reviews: number;
  avg_rating: number;
  source: string;
}

export default function RatingProducts() {
  const { t } = useTranslation();
  const params = useParams();
  const source = params?.source;
  const rating = params?.rating;
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const { toggle } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get("page");
      if (pageParam) {
        setPage(parseInt(pageParam));
      }
    }
  }, []);

  useEffect(() => {
    if (!source || !rating) return;

    setLoading(true);
    axios
      .get(
        `${API_BASE_URL}/rating/products/${rating}?source=${source}&limit=${limit}&offset=${(page - 1) * limit}`
      )
      .then((res) => {
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setError("Failed to fetch products"))
      .finally(() => setLoading(false));
  }, [source, rating, page]);

  const handleBackClick = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <header className="bg-background border border-sky-100 shadow-lg rounded-2xl px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={toggle} className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors">
            <Menu className="w-5 h-5 text-sky-900" />
          </button>
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800 transition text-sm font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 capitalize">
            {rating}★ Rating —{" "}
            <span className="text-blue-600">{source}</span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore products with this rating profile
        </p>
      </header>

      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl mb-2 shadow-inner">
          <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 text-transparent bg-clip-text">
          Products with {rating}★ Rating
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
          Browse {source} products that have precisely a {rating}★ rating profile.
        </p>
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="text-center text-slate-400 py-20 text-lg">
          Loading products...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20 text-lg">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-slate-500 py-20 text-lg">
          No products found with this rating.
        </div>
      ) : (
        <>
          {/* Product Table */}
          <Card className="bg-card border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Product List
              </CardTitle>
              <CardDescription>
                Showing products for rating {rating}★ on {source}
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-700 border-b">
                    <th className="py-3 px-4 text-left font-semibold">#</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      {t('catProd.productName', 'Product Name')}
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.avgPrice', 'Avg. Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.minPrice', 'Min Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.maxPrice', 'Max Price')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.rating', 'Rating')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.reviews', 'Reviews')}</th>
                    <th className="py-3 px-4 text-left font-semibold">{t('catProd.source', 'Source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50 transition-all"
                    >
                      <td className="py-3 px-4">{(page - 1) * limit + index + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span
                          onClick={() =>
                            router.push(
                              `/product/${encodeURIComponent(p.product_name)}?source=${source}&page=${page}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline-offset-2 hover:underline transition"
                        >
                          {p.product_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold">
                        ₹{p.avg_price?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-semibold">
                        {p.min_price ? `₹${p.min_price.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-red-600 font-semibold">
                        {p.max_price ? `₹${p.max_price.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-yellow-500 font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        {p.avg_rating?.toFixed(1) ?? "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.total_reviews.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700">{p.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8 pb-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="font-medium text-slate-700">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
