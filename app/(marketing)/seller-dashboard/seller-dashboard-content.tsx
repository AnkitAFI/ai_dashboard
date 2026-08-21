"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingDown,
  Target,
  Package,
  Search,
  Bell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Store,
  ShoppingBag,
  TrendingUp,
  Check,
  Quote,
} from "lucide-react";

const TRACK_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
];

function SellerDashboardContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  // Build URL preserving UTM tracking parameters and optional email parameter
  const buildTargetUrl = (basePath: string, userEmail?: string) => {
    const params = new URLSearchParams();

    TRACK_KEYS.forEach((key) => {
      const val = searchParams?.get(key);
      if (val) {
        params.set(key, val);
      }
    });

    if (userEmail) {
      params.set("email", userEmail);
    }

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildTargetUrl("/signup", email.trim() || undefined));
  };

  const iconItems = [
    {
      title: "Amazon Price Tracker",
      desc: "Real-time competitor price alerts",
      icon: (
        <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      ),
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      title: "Product Research Tool",
      desc: "Data-backed demand analysis",
      icon: <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      bg: "bg-pink-50 dark:bg-pink-950/40",
    },
    {
      title: "Inventory Management Tool",
      desc: "Avoid stockouts & overstocking",
      icon: (
        <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      ),
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Amazon Sales Rank Tracker",
      desc: "Track Buy Box & BSR 24/7",
      icon: <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Amazon Keyword Research Tool",
      desc: "Indian search volume metrics",
      icon: <Search className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "Brand Monitoring Tool",
      desc: "Protect map & Buy Box status",
      icon: <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
  ];

  const stats = [
    { value: "5,000+", label: "Indian sellers trust Insydz" },
    { value: "2.5L+", label: "Reviews analysed" },
    { value: "24/7", label: "Live market data" },
    { value: "₹0", label: "To get started" },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      features: [
        "25 products tracked",
        "5 AI messages/month",
        "Weekly reports",
      ],
      isPopular: false,
      btnLabel: "Get Started Free",
      btnVariant: "outline",
    },
    {
      name: "Basic",
      price: "₹1,999",
      period: "/month",
      features: [
        "500 products tracked",
        "Daily reports & alerts",
        "Email support",
      ],
      isPopular: true,
      btnLabel: "Upgrade to Basic",
      btnVariant: "primary",
    },
    {
      name: "Premium",
      price: "₹2,999",
      period: "/month",
      features: ["Unlimited tracking", "Real-time alerts", "Priority support"],
      isPopular: false,
      btnLabel: "Upgrade to Premium",
      btnVariant: "outline",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* ===== TOP NAVBAR ===== */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Insydz Home"
        >
          <img
            src="/logo.png"
            alt="Insydz Logo"
            className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Insydz
          </span>
        </Link>

        <div className="flex items-center gap-3.5">
          {/* <Link
            href={buildTargetUrl("/login")}
            className="px-7 py-3 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-base font-bold transition-all transform hover:scale-105"
          >
            Login
          </Link> */}
          <Link
            href={buildTargetUrl("/signup")}
            className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-600/25 transition-all transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-6 pb-4 sm:pt-10 sm:pb-6 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-purple-300/20 dark:bg-purple-900/15 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-pink-300/15 dark:bg-pink-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 text-xs sm:text-sm font-semibold shadow-sm mb-6 animate-fade-in">
            <span className="text-base">🎯</span> Built for Amazon &amp; Flipkart sellers in India
          </div> */}

          {/* Main Title */}
          <h1 className="mt-1 sm:mt-3 lg:mt-6 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.15] mb-6">
            Your Amazon &amp; Flipkart data,{" "}
            <span className="text-blue-600 dark:text-blue-400 italic block sm:inline">
              finally in one place.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Track prices, research products, and grow your marketplace business,
            all from a dashboard made specifically for Indian sellers.
          </p>

          {/* Email Capture Form */}
          <form
            onSubmit={handleHeroSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="w-full sm:flex-1 px-5 py-3.5 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all shadow-sm"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Sign Up Free <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link & Guarantee Note */}
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={buildTargetUrl("/login")}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Already have an account? Login
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> No credit
              card required
            </span>
          </div>

          {/* HERO ILLUSTRATION: parcel from Amazon and Flipkart flowing into one clear dashboard screen */}
          <div className="mt-16 sm:mt-20 max-w-2xl mx-auto relative">
            <svg
              viewBox="0 0 640 280"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-sm"
            >
              <ellipse
                cx="320"
                cy="262"
                rx="160"
                ry="12"
                className="fill-slate-200/80 dark:fill-gray-800/80"
              />

              {/* Amazon parcel */}
              <g transform="translate(46,140)">
                <rect
                  x="0"
                  y="0"
                  width="118"
                  height="98"
                  rx="8"
                  className="fill-white dark:fill-gray-900 stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                />
                <path
                  d="M0 24 L118 24"
                  className="stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                />
                <path
                  d="M42 0 L59 24 L76 0"
                  className="stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                  fill="none"
                />
                <rect
                  x="16"
                  y="40"
                  width="86"
                  height="20"
                  rx="4"
                  fill="#1862FE"
                />
                <text
                  x="59"
                  y="54"
                  fontFamily="sans-serif"
                  fontSize="11"
                  fontWeight="700"
                  fill="#fff"
                  textAnchor="middle"
                >
                  AMAZON
                </text>
                <text
                  x="59"
                  y="80"
                  fontFamily="sans-serif"
                  fontSize="9"
                  fontWeight="500"
                  className="fill-gray-500 dark:fill-gray-400"
                  textAnchor="middle"
                >
                  Seller Parcel
                </text>
              </g>

              {/* Flipkart parcel */}
              <g transform="translate(476,140)">
                <rect
                  x="0"
                  y="0"
                  width="118"
                  height="98"
                  rx="8"
                  className="fill-white dark:fill-gray-900 stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                />
                <path
                  d="M0 24 L118 24"
                  className="stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                />
                <path
                  d="M42 0 L59 24 L76 0"
                  className="stroke-gray-900 dark:stroke-gray-100"
                  strokeWidth="2.5"
                  fill="none"
                />
                <rect
                  x="16"
                  y="40"
                  width="86"
                  height="20"
                  rx="4"
                  fill="#FFC200"
                />
                <text
                  x="59"
                  y="54"
                  fontFamily="sans-serif"
                  fontSize="11"
                  fontWeight="700"
                  fill="#171717"
                  textAnchor="middle"
                >
                  FLIPKART
                </text>
                <text
                  x="59"
                  y="80"
                  fontFamily="sans-serif"
                  fontSize="9"
                  fontWeight="500"
                  className="fill-gray-500 dark:fill-gray-400"
                  textAnchor="middle"
                >
                  Seller Parcel
                </text>
              </g>

              {/* flow lines into dashboard */}
              <path
                d="M180 180 C240 180 240 120 300 120"
                stroke="#B9C6EA"
                strokeWidth="2.5"
                strokeDasharray="1 8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M460 180 C400 180 400 120 340 120"
                stroke="#B9C6EA"
                strokeWidth="2.5"
                strokeDasharray="1 8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Clear dashboard monitor */}
              <g transform="translate(180,10)">
                <rect
                  x="0"
                  y="0"
                  width="280"
                  height="180"
                  rx="16"
                  className="fill-gray-900 dark:fill-gray-800"
                />
                <rect
                  x="14"
                  y="14"
                  width="252"
                  height="152"
                  rx="8"
                  className="fill-slate-50 dark:fill-gray-900"
                />
                {/* top bar */}
                <rect
                  x="14"
                  y="14"
                  width="252"
                  height="30"
                  rx="8"
                  className="fill-white dark:fill-gray-800"
                />
                <text
                  x="28"
                  y="34"
                  fontFamily="sans-serif"
                  fontSize="12"
                  fontWeight="700"
                  className="fill-gray-900 dark:fill-white"
                >
                  Insydz Dashboard
                </text>
                <circle cx="238" cy="29" r="9" fill="#EAF0FF" />
                <path
                  d="M238 24v6M235 30h6"
                  stroke="#1862FE"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="248" cy="24" r="4" fill="#FF6B4A" />
                {/* revenue figure */}
                <text
                  x="28"
                  y="66"
                  fontFamily="sans-serif"
                  fontSize="10"
                  className="fill-gray-500 dark:fill-gray-400"
                >
                  Revenue today
                </text>
                <text
                  x="28"
                  y="86"
                  fontFamily="sans-serif"
                  fontSize="20"
                  fontWeight="700"
                  className="fill-gray-900 dark:fill-white"
                >
                  ₹48,200
                </text>
                {/* simple bar chart */}
                <g transform="translate(150,50)">
                  <rect
                    x="0"
                    y="46"
                    width="16"
                    height="24"
                    rx="3"
                    fill="#B9C6EA"
                  />
                  <rect
                    x="22"
                    y="30"
                    width="16"
                    height="40"
                    rx="3"
                    fill="#B9C6EA"
                  />
                  <rect
                    x="44"
                    y="38"
                    width="16"
                    height="32"
                    rx="3"
                    fill="#B9C6EA"
                  />
                  <rect
                    x="66"
                    y="16"
                    width="16"
                    height="54"
                    rx="3"
                    fill="#1862FE"
                  />
                  <rect
                    x="88"
                    y="24"
                    width="16"
                    height="46"
                    rx="3"
                    fill="#1862FE"
                  />
                </g>
                {/* bottom status pill */}
                <rect
                  x="28"
                  y="128"
                  width="158"
                  height="22"
                  rx="11"
                  fill="#EAFBF3"
                />
                <circle cx="42" cy="139" r="4" fill="#00B894" />
                <text
                  x="52"
                  y="143"
                  fontFamily="sans-serif"
                  fontSize="9"
                  fontWeight="600"
                  fill="#0C7A54"
                >
                  Buy Box won on Flipkart
                </text>
              </g>
              {/* monitor stand */}
              <g transform="translate(300,190)">
                <rect
                  x="0"
                  y="0"
                  width="40"
                  height="32"
                  rx="3"
                  fill="#3A3A38"
                />
                <rect
                  x="-14"
                  y="32"
                  width="68"
                  height="10"
                  rx="5"
                  className="fill-gray-900 dark:fill-gray-800"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ===== ICON STRIP ===== */}
      <section className="pt-10 pb-10 sm:pt-14 sm:pb-14 border-b border-gray-200/60 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {iconItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white dark:hover:bg-gray-800/90 border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                {/* <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                  {item.desc}
                </p> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INLINE STATS BAR ===== */}
      <section className="py-8 sm:py-10 border-b border-gray-200/60 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-1 sm:gap-6 text-center divide-x divide-gray-200/60 dark:divide-gray-800">
            {stats.map((stat, idx) => (
              <div key={idx} className="px-1 sm:px-3">
                <div className="text-xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400 truncate">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE BLOCK 1: PRICE TRACKER ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Left */}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                Amazon Price Tracker
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
                Know the moment your competitor drops a price
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Insydz is the amazon price tracker and price tracking tool that
                watches every product you sell, and every competitor selling
                next to you.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time alerts from our competitor price tracking software",
                  "Amazon sales rank tracker keeps Buy Box status current 24/7",
                  "See exactly when and why a rank dropped",
                ].map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Graphic Right */}
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">
                      Monitoring Target
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Wireless Noise-Cancelling Earbuds
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    -12% Drop Alert
                  </span>
                </div>
                <div className="py-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Current Price
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      ₹1,149
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 line-through">
                      ₹1,299
                    </div>
                    <div className="text-xs font-semibold text-rose-500">
                      Save ₹150
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Alert sent to WhatsApp
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Competitor dropped price 2 mins ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE BLOCK 2: PRODUCT RESEARCH ===== */}
      <section className="py-16 sm:py-24 bg-slate-100/70 dark:bg-gray-900/60 border-t border-b border-gray-200/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Graphic Left */}
            <div className="order-2 lg:order-1 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-left">
                <div className="flex items-center gap-3 mb-4 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Search: Indian Kitchen Appliances
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Demand Score
                    </div>
                    <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                      High (92/100)
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Est. Monthly Sales
                    </div>
                    <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                      14,200 units
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between font-medium">
                  <span>Search Volume: 1.2L searches/mo</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Low Competition Gap
                  </span>
                </div>
              </div>
            </div>

            {/* Text Right */}
            <div className="order-1 lg:order-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                Amazon Product Research Tool
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
                Find winning products before you invest
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Our amazon product research tool and amazon keyword research
                tool validate real demand with data, not guesswork, before you
                commit stock or ad budget.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Amazon product research tools backed by real demand data",
                  "Amazon keyword research tool built on Indian search volume",
                  "Spot trends before your competitors do",
                ].map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE BLOCK 3: FLIPKART SELLER DASHBOARD ===== */}
      <section className="pt-16 pb-4 sm:pt-24 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Left */}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                Flipkart Seller Dashboard
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
                Flipkart seller dashboard &amp; Amazon seller tools, one login
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                One amazon seller dashboard for your amazon seller tools, amazon
                seller software, and marketplace software, plus everything on
                Flipkart.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Amazon seller dashboard and Flipkart seller dashboard in one login",
                  "All your amazon tools and amazon seller software together",
                  "The marketplace software built specifically for India",
                ].map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Graphic Right */}
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400 text-gray-900">
                      FLIPKART
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white">
                      AMAZON
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Multi-Channel
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 font-medium">
                      REVENUE
                    </div>
                    <div className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                      ₹48.2K
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 font-medium">
                      ORDERS
                    </div>
                    <div className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                      143
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 font-medium">
                      BUY BOX
                    </div>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      Won
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUOTE / TESTIMONIAL ===== */}
      <section className="pt-0 pb-20 sm:pb-28 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            Insydz Reviews
          </span>
          <Quote className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-2 opacity-80" />
          <blockquote className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-3 italic">
            "Insydz helped me identify products quietly losing margin. Two weeks
            later, net profit was up 22%."
          </blockquote>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Rahul Gupta —{" "}
            <span className="text-gray-900 dark:text-gray-200">
              Electronics Seller, Amazon India
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SellerDashboardContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center">Loading...</div>
      }
    >
      <SellerDashboardContentInner />
    </Suspense>
  );
}
