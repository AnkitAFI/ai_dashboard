"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Search, TrendingUp, ChevronRight, Target,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function ImproveSEOPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Rank Higher on Amazon & Flipkart <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">With Smart SEO</span>
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">Insydz shows you exactly which keywords to target, how to optimize listings, and where you rank <span className="text-green-700 dark:text-green-400 font-semibold">so more customers find your products.</span></p>
              <Link href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 sm:px-8 py-4 sm:py-3 text-sm sm:text-lg rounded-full shadow-2xl inline-flex items-center w-full sm:w-auto justify-center transition-all">
                  Improve Your SEO Free <ArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Keyword Performance</h3>
              <div className="space-y-3">
                {[
                  { keyword: "wireless earbuds", rank: "#8", searches: "45K/mo", trend: "↑" },
                  { keyword: "bluetooth headphones", rank: "#15", searches: "32K/mo", trend: "↑" },
                  { keyword: "noise cancelling", rank: "#23", searches: "28K/mo", trend: "↓" }
                ].map((kw, i) => (
                  <div key={i} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between transition-all">
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white leading-relaxed">{kw.keyword}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{kw.searches} searches</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400 leading-relaxed">{kw.rank}</p>
                      <p className="text-lg leading-relaxed">{kw.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-12 text-gray-900 dark:text-white leading-relaxed">Why Your Products <span className="text-red-600 dark:text-red-500">Don't Rank</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Wrong keywords in titles", icon: <Search className="w-8 h-8" /> },
              { title: "Competitors outrank you", icon: <TrendingUp className="w-8 h-8" /> },
              { title: "No tracking = no improvement", icon: <Target className="w-8 h-8" /> }
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 transition-all hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 text-white mx-auto">{p.icon}</div>
                <p className="font-bold text-gray-900 dark:text-white leading-relaxed">{p.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12 text-gray-900 dark:text-white leading-relaxed">How SEO Optimization Works <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">with Insydz</span></h2>
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Find High-Value Keywords", desc: "Discover what customers actually search for" },
              { step: "2", title: "Track Your Rankings", desc: "Monitor where you rank vs competitors" },
              { step: "3", title: "Optimize & Improve", desc: "Get specific recommendations to rank higher" }
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-3xl p-8 text-center shadow-xl transition-all hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white">{s.step}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white leading-relaxed">{s.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-12 py-6 rounded-full shadow-2xl inline-flex items-center transition-all">
              Start Ranking Higher Free <ChevronRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6 text-gray-900 dark:text-white leading-relaxed">Stop Being Invisible. <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Get Found.</span></h2>
          <Link href="/login" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-12 py-6 rounded-full shadow-2xl inline-flex items-center transition-all">
            Improve SEO Free <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
