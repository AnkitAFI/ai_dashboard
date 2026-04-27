"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, Users, Store, TrendingUp,
  ShoppingBag, Briefcase, Target, Zap, ArrowRight,
  CheckCircle2, Package, BarChart3, Globe,
  Menu, X, Sun, Moon, Code, Trophy, BookOpen,
  Video, FileText, MessageCircle, Bell, Search, TrendingDown,
  Flame, Presentation, ArrowLeft, Mail, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




// ── Navigation Data (identical to SolutionsPage) ──────────────────────────────
type MenuItemWithBadge = {
  name: string;
  icon: JSX.Element;
  badge?: string;
  route?: string;
};

type NavigationMenu = {
  Solutions: MenuItemWithBadge[];
  "Use Cases": MenuItemWithBadge[];
  Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[];
  Resources: MenuItemWithBadge[];
  Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[];
  About: MenuItemWithBadge[];
};

const navigationMenu: NavigationMenu = {
  Solutions: [
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions" },
    { name: "For Amazon Sellers (India)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/amazon-sellers" },
    { name: "For Flipkart Sellers", icon: <Store className="w-4 h-4" />, route: "/solutions/flipkart-sellers" },
    { name: "For E-commerce Agencies", icon: <Briefcase className="w-4 h-4" />, route: "/solutions/ecommerce-agencies" },
    { name: "For Brand Managers", icon: <Users className="w-4 h-4" />, route: "/solutions/brand-managers" },
  ],
  "Use Cases": [
    { name: "All Use Cases", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases" },
    { name: "Track Competitor Prices", icon: <TrendingUp className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
    { name: "Find Profitable Products", icon: <Target className="w-4 h-4" />, route: "/use-cases/find-profitable-products" },
    { name: "Analyze Customer Reviews", icon: <MessageCircle className="w-4 h-4" />, route: "/use-cases/analyze-customer-reviews" },
    { name: "Improve Amazon & Flipkart SEO", icon: <Search className="w-4 h-4" />, route: "/use-cases/improve-seo" },
    { name: "Avoid Stockouts & Missed Sales", icon: <Package className="w-4 h-4" />, route: "/use-cases/avoid-stockouts" },
  ],
  Features: [
    { name: "All Features", icon: <LayoutGrid className="w-4 h-4" />, route: "/features" },
    { name: "Competitor Price Tracking", icon: <TrendingDown className="w-4 h-4" />, route: "/features/competitor-price-tracking-feature" },
    { name: "Review Analytics", icon: <MessageCircle className="w-4 h-4" />, route: "/features/review-analytics-feature" },
    { name: "Price Optimization", icon: <TrendingUp className="w-4 h-4" />, route: "/features/price-optimization-feature" },
    { name: "Keyword & Rank Tracking", icon: <Search className="w-4 h-4" />, route: "/features/keyword-rank-tracking-feature" },
    { name: "Product Research", icon: <Package className="w-4 h-4" />, route: "/features/product-research-feature" },
    { name: "AI Recommendations", icon: <Zap className="w-4 h-4" />, route: "/features/ai-recommendations-feature" },
    { name: "WhatsApp Alerts", icon: <Bell className="w-4 h-4" />, badge: "NEW", route: "/features/whatsapp-alerts-feature" },
    { name: "Festive Trend Intelligence", icon: <Flame className="w-4 h-4" />, badge: "UPCOMING", route: "/features/festive-trend-feature" },
  ],
  "Free Tools": [
    { name: "Free Amazon Product Analyzer", icon: <BarChart3 className="w-4 h-4" />, route: "/free-tools/free-amazon-product-analyzer" },
    { name: "Free Review Sentiment Checker", icon: <MessageCircle className="w-4 h-4" />, route: "/free-tools/free-review-sentiment-checker" },
    { name: "Free Competitor Price Checker", icon: <TrendingDown className="w-4 h-4" />, route: "/free-tools/free-competitor-price-checker" },
    { name: "Free Keyword Rank Checker", icon: <Search className="w-4 h-4" />, badge: "NEW", route: "/free-tools/free-keyword-rank-checker" },
  ],
  Resources: [
    { name: "Expert Blog", icon: <BookOpen className="w-4 h-4" />, route: "/resources/expert-blog" },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    { name: "Insydz vs Helium 10", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvshelium" },
    { name: "Insydz vs Jungle Scout", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsjunglescout" },
    { name: "Insydz vs Viral Launch", icon: <Trophy className="w-4 h-4" />, route: "/compare/insydzvsvirallaunch" },
  ],
  About: [
    { name: "Our Vision", icon: <Globe className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Users className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Mail className="w-4 h-4" />, route: "/about/contact-us" }
  ],
};

// ── Particle Canvas ────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number };
    const pts: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
    let rid: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251,146,60,0.35)"; ctx.fill();
        for (const q of pts) {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 100 && d > 0) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(251,146,60,${0.07 * (1 - d / 100)})`;
            ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      rid = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rid); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Flow Steps ────────────────────────────────────────────────────────────────
function FlowSteps() {
  const steps = [
    { label: "Build", note: "Ship real product to real sellers" },
    { label: "Measure", note: "Look at what actually matters" },
    { label: "Improve", note: "Iterate with purpose and speed" },
    { label: "Scale", note: "Build infrastructure for the long term" },
  ];
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 border-2 ${i === steps.length - 1 ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 text-orange-500"}`}>
              {String(i + 1).padStart(2, "0")}
            </div>
            {i < steps.length - 1 && <div className="w-0.5 h-8 bg-gradient-to-b from-orange-400 to-orange-100" />}
          </div>
          <div className={`${i < steps.length - 1 ? "pb-8" : ""} pt-1`}>
            <div className={`font-bold text-base ${i === steps.length - 1 ? "text-orange-500" : "text-gray-900 dark:text-white"}`}>{s.label}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CareersPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    isDarkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = (name: string) => setMobileActiveMenu(mobileActiveMenu === name ? null : name);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { router.push(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  // ── Desktop Dropdown helper ─────────────────────────────────────────────────
  const DesktopDropdown = ({
    label, menuKey, accent = false
  }: { label: string; menuKey: keyof NavigationMenu; accent?: boolean }) => (
    <div className="relative">
      <button
        onMouseEnter={() => setActiveDropdown(label)}
        className={`px-3 py-2 text-sm font-${accent ? "semibold" : "medium"} rounded-lg flex items-center gap-1 transition-all ${
          accent
            ? "text-orange-600 dark:text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === label ? "rotate-180" : ""}`} />
      </button>
      {activeDropdown === label && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {navigationMenu[menuKey].map((item, i) => (
            <button
              key={i}
              onClick={() => handleMenuItemClick(item)}
              className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 group ${
                accent ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              <span className={`group-hover:scale-110 transition-transform ${accent ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`}>
                {item.icon}
              </span>
              <span className={`text-sm text-gray-700 dark:text-gray-300 flex-1 group-hover:${accent ? "text-orange-600 dark:group-hover:text-orange-400" : "text-purple-600 dark:group-hover:text-purple-400"}`}>
                {item.name}
              </span>
              {item.badge && (
                <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const MobileMenuSection = ({ label, menuKey }: { label: string; menuKey: keyof NavigationMenu }) => (
    <div>
      <button
        onClick={() => toggleMobileMenu(label)}
        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg font-medium ${
          label === "Solutions"
            ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
            : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === label ? "rotate-180" : ""}`} />
      </button>
      {mobileActiveMenu === label && (
        <div className="ml-4 mt-2 space-y-1">
          {navigationMenu[menuKey].map((item, i) => (
            <button
              key={i}
              onClick={() => handleMenuItemClick(item)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg ${
                label === "Solutions" ? "hover:bg-orange-50 dark:hover:bg-orange-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              {item.icon}
              {item.name}
              {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

  const WHY_BULLETS = [
    { label: "India-first product thinking", sub: "Built for the realities of Indian marketplaces." },
    { label: "Real marketplace data focus", sub: "Structured intelligence, not noise." },
    { label: "Action-driven product philosophy", sub: "Insight without action is useless." },
    { label: "Long-term infrastructure mindset", sub: "We're building a foundation, not a feature." },
  ];

  const WHAT_MEANS = [
    "You work on product that impacts real businesses",
    "You solve real marketplace problems, not synthetic ones",
    "You ship fast but thoughtfully",
    "You take ownership from day one",
  ];

  const TRAITS = [
    { icon: "◈", title: "Ownership Mindset", desc: "You treat every problem as yours to solve. You follow through without being reminded.", color: "from-orange-500 to-red-500" },
    { icon: "◉", title: "Product Thinking", desc: "You connect features to outcomes. You ask why before how. You build for users, not roadmaps.", color: "from-blue-500 to-cyan-500" },
    { icon: "◆", title: "Data-Driven Decisions", desc: "You don't guess when you can measure. Numbers sharpen your intuition, not replace it.", color: "from-purple-500 to-pink-500" },
    { icon: "▶", title: "Bias for Execution", desc: "You'd rather ship something good fast than perfect something slowly. Speed is strategy.", color: "from-green-500 to-emerald-500" },
  ];

  const NOT_FOR = [
    "People looking for comfort jobs",
    "Those who avoid responsibility",
    "People chasing titles over impact",
    "Passive contributors who wait to be told",
    "Those who want to be managed, not trusted",
  ];

  const PRINCIPLES = [
    { icon: "🇮🇳", label: "Build for India", desc: "India-first product thinking, always." },
    { icon: "⚡", label: "Ship fast, iterate faster", desc: "Speed beats perfection. Learn from real data." },
    { icon: "🧩", label: "Solve real seller problems", desc: "Don't assume — talk to sellers." },
    { icon: "⬡", label: "Keep it simple", desc: "Complexity is the enemy of adoption." },
    { icon: "🔭", label: "Think long term", desc: "Infrastructure thinking, not feature thinking." },
  ];

  const OPEN_ROLES: { title: string; location: string; department: string; desc: string }[] = [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* ═══════════════════════════════════════════════════════
          NAVIGATION (exactly matches SolutionsPage)
      ═══════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Insydz</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions" menuKey="Solutions" accent />
              <DesktopDropdown label="Use Cases" menuKey="Use Cases" />
              <DesktopDropdown label="Features" menuKey="Features" />
              <button onClick={() => router.push("/pricing")} onMouseEnter={() => setActiveDropdown(null)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                Pricing
              </button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare" menuKey="Compare" />
              <DesktopDropdown label="Resources" menuKey="Resources" />
              <DesktopDropdown label="About" menuKey="About" />

              <Button onClick={() => router.push("/login")} onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Login
              </Button>
              <button
                className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => { router.push("/"); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <MobileMenuSection label="Solutions" menuKey="Solutions" />
              <MobileMenuSection label="Use Cases" menuKey="Use Cases" />
              <MobileMenuSection label="Features" menuKey="Features" />
              <button onClick={() => router.push("/pricing")} className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium">Pricing</button>
              <MobileMenuSection label="Free Tools" menuKey="Free Tools" />
              <MobileMenuSection label="Compare" menuKey="Compare" />
              <MobileMenuSection label="Resources" menuKey="Resources" />
              <MobileMenuSection label="About" menuKey="About" />
              <Button onClick={() => { router.push("/login"); setIsMenuOpen(false); }} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500">Login</Button>
              <button className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-full flex justify-center items-center" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════
          01 — HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <ParticleCanvas />
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
                </span>
                <span className="text-sm font-medium text-orange-700">Now Hiring — Builders Only 🇮🇳</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Build the
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Intelligence Layer
                </span>
                <br />
                for Indian E-commerce
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                We're building infrastructure for serious sellers
                <span className="text-orange-700 font-semibold"> and we're looking for serious builders.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all group"
                >
                  View Open Roles
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-700 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  Why Join INSYDZ →
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {["India-first culture", "Real ownership from day one", "No comfort jobs"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — preview cards */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {[
                    { gradient: "from-orange-500 to-red-500", icon: <Target className="w-8 h-8 text-white" />, title: "Ownership Mindset", sub: "You own the problem end to end" },
                    { gradient: "from-blue-500 to-cyan-500", icon: <BarChart3 className="w-8 h-8 text-white" />, title: "Data-Driven Culture", sub: "Measure before you ship, ship before you perfect" },
                    { gradient: "from-purple-500 to-pink-500", icon: <Zap className="w-8 h-8 text-white" />, title: "Bias for Execution", sub: "Speed is a strategic advantage" },
                  ].map((card, i) => (
                    <div key={i} className={`bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center`}>{card.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{card.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-2 shadow-xl">
                  <p className="text-white font-bold text-sm">Serious Builders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          02 — WHY WE EXIST
      ═══════════════════════════════════════════════════════ */}
      <section id="why" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Different Problem.
              <br />
              <span className="text-orange-600">We're Solving It.</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Indian marketplace sellers operate in one of the most competitive environments in the world.
                We believe they deserve structured intelligence not guesswork.
              </p>
              <div className="space-y-4">
                {WHY_BULLETS.map((b, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border-l-4 border-orange-500 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-bold text-gray-900 dark:text-white mb-1">{b.label}</div>
                    <div className="text-sm text-gray-500">{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <ShoppingBag className="w-8 h-8" />, title: "Amazon sellers need pricing alerts", color: "from-orange-500 to-red-500" },
                { icon: <Store className="w-8 h-8" />, title: "Flipkart sellers need SEO insights", color: "from-blue-500 to-cyan-500" },
                { icon: <TrendingUp className="w-8 h-8" />, title: "D2C brands need market validation", color: "from-purple-500 to-pink-500" },
                { icon: <Briefcase className="w-8 h-8" />, title: "Agencies need centralized reporting", color: "from-green-500 to-emerald-500" },
              ].map((pain, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-orange-400 hover:shadow-lg transition-all group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform shadow-md`}>
                    {pain.icon}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-relaxed">{pain.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          03 — WHAT WORKING HERE MEANS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              What Working at
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">INSYDZ Actually Means</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {WHAT_MEANS.map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-orange-400 hover:shadow-lg transition-all group">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-8 shadow-xl">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-6">Our Loop</p>
              <FlowSteps />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          04 — WHO WE'RE LOOKING FOR
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              We're Looking for
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Builders, Not Spectators</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRAITS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all group hover:-translate-y-1">
                <div className={`w-14 h-14 bg-gradient-to-br ${t.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-white text-xl font-bold">{t.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          05 — NOT FOR EVERYONE
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-4">Filter</p>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            INSYDZ Is Not For Everyone
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto">
            We prefer small teams with high accountability.
          </p>
          <div className="space-y-4 text-left">
            {NOT_FOR.map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-background opacity-100 border border-white/10 rounded-2xl px-6 py-4 hover:bg-background opacity-100 transition-colors">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-gray-300 font-medium">Not for {item.replace(/^[Nn]ot for /, "")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          06 — OPEN ROLES
      ═══════════════════════════════════════════════════════ */}
      <section id="open-roles" className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              Open Roles
            </h2>
          </div>

          {OPEN_ROLES.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
              {OPEN_ROLES.map((role, i) => (
                <div key={i} className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors last:border-b-0 flex-wrap gap-4">
                  <div>
                    <div className="font-bold text-xl text-gray-900 dark:text-white mb-2">{role.title}</div>
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{role.location}</span>
                      <span className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full">{role.department}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{role.desc}</p>
                  </div>
                  <a href={`mailto:careers@insydz.com?subject=Application: ${role.title}`} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all whitespace-nowrap">
                    Apply → <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  We're always looking for exceptional builders.
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  No open roles right now, but strong product thinkers and growth operators are always welcome.
                </p>
                <a href="mailto:careers@insydz.com" className="text-xl font-black text-orange-600 hover:text-orange-700 border-b-2 border-orange-300 pb-0.5 transition-colors">
                  careers@insydz.com
                </a>
              </div>
              <div className="flex-shrink-0 opacity-20">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="10" width="60" height="72" rx="4" stroke="#111" strokeWidth="3" />
                  <path d="M22 30h36M22 42h36M22 54h20" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          07 — HOW WE WORK
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
              How We <span className="text-orange-600">Work</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all group hover:-translate-y-1">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{p.label}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
            {/* 5th card full-width on last row */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 sm:col-span-2 lg:col-span-2 flex items-center gap-6 hover:shadow-xl transition-all">
              <div className="text-4xl">🔭</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Think long term</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Infrastructure thinking, not feature thinking. We're building a foundation that Indian e-commerce will rely on for years.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          08 — GROW WITH THE PRODUCT
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Grow With
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">the Product</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            As INSYDZ grows, the people building it grow with it — in responsibility, learning, and impact.
            No exaggerated promises. Just real stakes.
          </p>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-10 shadow-xl">
            <svg viewBox="0 0 480 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto">
              <defs>
                <linearGradient id="gcg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M20 155 C 80 135 150 105 220 75 C 290 45 360 25 460 10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M20 155 C 80 135 150 105 220 75 C 290 45 360 25 460 10 L 460 170 L 20 170 Z" fill="url(#gcg2)" />
              {([[20,155,"Join"],[220,75,"Grow"],[460,10,"Lead"]] as [number,number,string][]).map(([cx,cy,label],idx) => (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="7" fill="#f97316" />
                  <circle cx={cx} cy={cy} r="14" fill="#f97316" fillOpacity="0.12" />
                  <text x={idx === 2 ? cx-36 : cx+12} y={cy-14} fill={idx === 2 ? "#f97316" : "#aaa"} fontSize="12" fontFamily="monospace">{label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          09 — FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
            Ready to Build With Us?
          </h2>
          <p className="text-xl text-white/90 mb-2 leading-relaxed">
            Serious builders only.
          </p>
          <p className="text-white/70 text-base mb-10">
            Start by emailing us or watching for open roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" })}
              size="lg"
              className="bg-white hover:bg-gray-100 text-orange-700 font-bold px-12 py-6 text-lg rounded-full shadow-2xl group"
            >
              Explore Open Roles
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-12 py-6 text-lg rounded-full border-2 border-orange-400"
              onClick={() => { window.location.href = "mailto:careers@insydz.com"; }}
            >
              Email Your Profile →
            </Button>
          </div>
          <p className="text-white/70 mt-8 text-sm">✓ Small team  ✓ High accountability  ✓ Real impact</p>
        </div>
      </section>

      
      {/* Footer */}
      
 
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
 

