"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingDown, ArrowRight, Target, Zap, Bell, TrendingUp,
  MessageCircle, Search, Package, BarChart3, ShoppingBag,
  Menu, X, Sun, Moon, ChevronDown, Store, Briefcase, Users,
  Code, Globe, Trophy, BookOpen, Video, FileText,
  RefreshCw, MessageSquare, BarChart2, ArrowUpRight, XCircle,
  CheckCircle2, Layers, Cpu, Sparkles, Calendar, Network,
  Flame, Mail, Phone, MapPin, HelpCircle, Shield, Handshake,
  HeadphonesIcon, Send, ChevronDown as ChevronDownIcon,
  ChevronUp, Building2, Lock, LayoutGrid,  Facebook, Instagram, Linkedin, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




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

const faqs = [
  {
    q: "How quickly do you respond?",
    a: "We typically respond within 24–48 hours on business days. For urgent support issues, please mention it in your message subject.",
  },
  {
    q: "Where is INSYDZ based?",
    a: "INSYDZ is headquartered in New Delhi, India. We are an India-first SaaS platform built specifically for Indian marketplace sellers.",
  },
  {
    q: "Can I request a feature?",
    a: "Absolutely. We actively build based on seller feedback. Use the contact form below and select 'Other' as your inquiry type, then describe the feature you need.",
  },
  {
    q: "Do you offer enterprise plans?",
    a: "Yes. We have custom plans for agencies and large seller operations. Reach out to partnerships@insydz.com or book a demo to discuss your requirements.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel your subscription anytime from your account settings. For help, email support@insydz.com and our team will assist you promptly.",
  },
];

export default function ContactUsPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    inquiry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => router.push("/login");
  const toggleMobileMenu = (menuName: string) =>
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 backdrop-blur-none shadow-lg" : "bg-background opacity-100 backdrop-blur-none"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-12 h-12 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 object-contain" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Insydz</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2" ref={dropdownRef}>
              {(["Solutions", "Use Cases", "Features", "Pricing", "Free Tools", "Compare", "Resources"] as const).map((menu) => (
                 menu === "Pricing" ? (
    <button
      key={menu}
      onClick={() => router.push('/pricing')}
      onMouseEnter={() => setActiveDropdown(null)}
      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all"
    >
      Pricing
    </button>
  ) : (
    <div key={menu} className="relative">
      <button
        onMouseEnter={() => setActiveDropdown(menu)}
        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all flex items-center gap-1"
      >
        {menu}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            activeDropdown === menu ? 'rotate-180' : ''
          }`}
        />
      </button>

      {activeDropdown === menu && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
        >
          {(navigationMenu[menu as keyof NavigationMenu] as MenuItemWithBadge[]).map((item, i) => (
            <button
              key={i}
              onClick={() => handleMenuItemClick(item)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-3 group"
            >
              <span className="text-orange-500 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-orange-600 flex-1">
                {item.name}
              </span>
              {item.badge && (
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
))}
              {/* About */}
              <div className="relative">
                <button
                  onMouseEnter={() => setActiveDropdown("About")}
                  className="px-3 py-2 text-sm text-gray-700 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all flex items-center gap-1"
                >
                  About <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "About" ? "rotate-180" : ""}`} />
                </button>
                {activeDropdown === "About" && (
                  <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    {navigationMenu.About.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 group">
                        <span className="text-purple-600 group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm text-gray-700 group-hover:text-purple-600 flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleGetStarted} onMouseEnter={() => setActiveDropdown(null)} className="ml-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition-all transform hover:scale-105">Login</Button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-3">
              {(["Solutions", "Use Cases", "Features", "Free Tools", "Compare", "Resources"] as const).map((menu) => (
                <div key={menu}>
                  <button onClick={() => toggleMobileMenu(menu)} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-medium">
                    {menu} <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === menu ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === menu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {(navigationMenu[menu as keyof NavigationMenu] as MenuItemWithBadge[]).map((item, i) => (
                        <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 rounded-lg">
                          {item.icon}{item.name}
                          {item.badge && <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div>
                <button onClick={() => toggleMobileMenu("About")} className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg font-medium">
                  About <ChevronDown className={`w-4 h-4 transition-transform ${mobileActiveMenu === "About" ? "rotate-180" : ""}`} />
                </button>
                {mobileActiveMenu === "About" && (
                  <div className="ml-4 mt-2 space-y-1">
                    {navigationMenu.About.map((item, i) => (
                      <button key={i} onClick={() => handleMenuItemClick(item)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-purple-50 rounded-lg">
                        {item.icon}{item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => router.push("/pricing")} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-medium">Pricing</button>
              <Button onClick={handleGetStarted} className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="pt-36 pb-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block"></span>
            <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Contact Us</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-5">
            Get in Touch with INSYDZ
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            Questions about the product, partnerships, or support? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/login")}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-orange-400/30 transition-all group"
            >
              Book a Demo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a
              href=""
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-600 font-semibold px-8 py-3 text-base rounded-full transition-all"
            >
              <Mail className="w-4 h-4" />
              Email Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — CONTACT OPTIONS GRID
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#f7f7f7]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">How Can We Help?</h2>
            <div className="w-10 h-0.5 bg-orange-400"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <HelpCircle className="w-6 h-6" />,
                title: "Product Questions",
                desc: "For feature clarifications, onboarding help, and demo requests.",
                cta: "Book a Demo",
                ctaHref: "/login",
                ctaType: "route",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: <HeadphonesIcon className="w-6 h-6" />,
                title: "Customer Support",
                desc: "For account issues, billing, or technical help.",
                cta: "support@insydz.com",
                ctaHref: "mailto:support@insydz.com",
                ctaType: "email",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Handshake className="w-6 h-6" />,
                title: "Partnerships",
                desc: "For agencies, integrations, and collaborations.",
                cta: "partnerships@insydz.com",
                ctaHref: "mailto:partnerships@insydz.com",
                ctaType: "email",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: <Briefcase className="w-6 h-6" />,
                title: "Careers",
                desc: "For job-related inquiries and open positions.",
                cta: "careers@insydz.com",
                ctaHref: "mailto:careers@insydz.com",
                ctaType: "email",
                color: "bg-green-100 text-green-600",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{card.desc}</p>
                {card.ctaType === "route" ? (
                  <button
                    onClick={() => router.push(card.ctaHref)}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <a
                    href={card.ctaHref}
                    className="text-sm font-semibold text-gray-700 hover:text-orange-600 flex items-center gap-1 transition-colors break-all"
                  >
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {card.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — CONTACT FORM
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Send Us a Message</h2>
            <div className="w-10 h-0.5 bg-orange-400"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 lg:p-10">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Message Received</h3>
                <p className="text-gray-500 text-base">We'll get back to you within 24–48 business hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", company: "", inquiry: "", message: "" }); }}
                  className="mt-6 text-sm text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleFormChange}
                      placeholder="Rahul Sharma"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleFormChange}
                      placeholder="rahul@brand.com"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company / Brand</label>
                  <input
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleFormChange}
                    placeholder="Your company or brand name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Inquiry Type <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      name="inquiry"
                      required
                      value={formState.inquiry}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white cursor-pointer"
                    >
                      <option value="" disabled>Select inquiry type</option>
                      <option value="support">Support</option>
                      <option value="sales">Sales</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={handleFormChange}
                    placeholder="Describe your question or request in detail..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-md transition-all group"
                  >
                    Send Message
                    <Send className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We typically respond within <span className="font-semibold text-gray-500">24–48 hours</span> on business days.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — COMPANY INFORMATION
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#f7f7f7]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Company Information</h2>
            <div className="w-10 h-0.5 bg-orange-400"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-gray-900 font-bold text-base">INSYDZ</p>
                <p className="text-gray-500 text-sm mt-0.5">India-focused SaaS platform</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:contact@insydz.com" className="text-gray-900 font-bold text-base hover:text-orange-600 transition-colors">contact@insydz.com</a>
                <p className="text-gray-500 text-sm mt-0.5">General enquiries</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Registered Office</p>
                <p className="text-gray-900 font-bold text-base">New Delhi, India 🇮🇳</p>
                <p className="text-gray-500 text-sm mt-0.5">Serving sellers nationwide</p>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-8 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm max-w-xl">
            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-500 leading-relaxed">
              We respect your privacy. Your information is never shared with third parties.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — FAQ
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Common Questions</h2>
            <div className="w-10 h-0.5 bg-orange-400"></div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-orange-50 border-t border-orange-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <ArrowUpRight className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Looking for a Personalized Walkthrough?
          </h2>
          <p className="text-gray-500 mb-7 text-base">See how INSYDZ fits your selling model.</p>
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-6 text-base rounded-full shadow-xl hover:shadow-orange-400/30 transition-all group"
          >
            Book a Demo
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <Button
          onClick={() => router.push("/login")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full text-sm shadow-md"
        >
          Book a Demo →
        </Button>
      </div>

      
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
 

