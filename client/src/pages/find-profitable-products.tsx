import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  TrendingDown, ArrowRight, CheckCircle2, Target, Zap, 
  Bell, TrendingUp, MessageCircle, Search, Package, 
  BarChart3, ChevronRight, Star, AlertCircle, Clock,
  ShoppingBag, Smartphone, X, Check,
  DollarSign, Eye, Sparkles,
  ChevronDown, Filter, Lightbulb, Award, Menu, Sun, Moon, 
  ArrowLeft, BookOpen, Video, FileText, Store, Briefcase, 
  Users, Code, Globe, Trophy,
  Flame, Presentation, MapPin, LayoutGrid, Facebook, Linkedin, Instagram, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Product Research Tool",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful product profitability analysis software for Amazon and Flipkart sellers.",
    "url": "https://insydz.com/use-cases/find-profitable-products"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Find Profitable Products", "item": "https://insydz.com/use-cases/find-profitable-products" }
    ]
  }
];

type MenuItemWithBadge = { name: string; icon: JSX.Element; badge?: string; route?: string; };
type NavigationMenu = {
  Solutions: MenuItemWithBadge[]; "Use Cases": MenuItemWithBadge[]; Features: MenuItemWithBadge[];
  "Free Tools": MenuItemWithBadge[]; Resources: MenuItemWithBadge[]; Integrations: MenuItemWithBadge[];
  Compare: MenuItemWithBadge[]; About: MenuItemWithBadge[];
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
    { name: "Track Competitor Prices", icon: <TrendingDown className="w-4 h-4" />, route: "/use-cases/track-competitor-prices" },
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

const comparisonRows = [
  { feature: "Real demand on Amazon.in / Flipkart", manual: "⚠ Category browse only", insydz: "✓ Real search volume & sales velocity in INR" },
  { feature: "Competition quality", manual: "⚠ Count top sellers manually", insydz: "✓ Competition gap score, weak sellers flagged" },
  { feature: "Realistic profit margin", manual: "✗ Guesswork, no fee modelling", insydz: "✓ Profit/unit estimate including marketplace fees" },
  { feature: "Demand trend", manual: "✗ No trend data, only snapshot", insydz: "✓ Demand velocity over 30/60/90 days" },
  { feature: "Review gaps", manual: "✗ Would need to read 500+ reviews", insydz: "✓ AI review gap analysis — your differentiation brief" },
  { feature: "Research time", manual: "✗ 2–4 weeks", insydz: "✓ Under 10 minutes" },
];

const whatYouDiscover = [
  { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Trending Products Before Saturation", desc: "See which categories are gaining search velocity on Amazon India and Flipkart — so you can enter the market while competition is still low.", color: "from-green-500 to-emerald-500", link: "/features/demand-signals", linkLabel: "product demand analysis tool" },
  { icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Profit Margin Estimates Per Unit", desc: "Insydz shows estimated profit per unit in INR — factoring in Amazon.in and Flipkart fees, typical sourcing costs, and current price ranges. Know your numbers before you place a purchase order.", color: "from-blue-500 to-cyan-500", link: "/features/margin-calculator", linkLabel: "product margin calculator" },
  { icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Competition Analysis & Gaps", desc: "Insydz flags categories where top sellers have weak ratings (below 4.0), low review counts, or listing quality gaps. These are your launch advantage points.", color: "from-purple-500 to-pink-500", link: "/features/product-research", linkLabel: "ecommerce product research tool" },
  { icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Search Volume & Demand Data", desc: "Real demand signals from Indian marketplaces — including festive season demand spikes for Diwali, Navratri, and Republic Day sale events.", color: "from-orange-500 to-red-500", link: "/features/demand-signals", linkLabel: "product demand analysis tool" },
  { icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Best-Selling Categories", desc: "See which categories generate the highest GMV on Amazon India and Flipkart right now — ranked by actual revenue performance.", color: "from-indigo-500 to-purple-500", link: "/features/product-research", linkLabel: "profitable product finder" },
  { icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />, title: "AI Opportunity Score (1–100)", desc: "Every product opportunity gets a single AI score combining demand, competition, profitability, and timing. Higher score = stronger launch opportunity. No analysis paralysis — just a clear ranked list.", color: "from-yellow-500 to-orange-500", link: "/use-cases/find-profitable-products", linkLabel: "product opportunity finder" },
];

const roiWithout = [
  { label: "Initial inventory investment", value: "−₹3,00,000" },
  { label: "Market oversaturated — 40% dead inventory", value: "−₹1,20,000" },
  { label: "Ad spend to force visibility in competitive category", value: "−₹45,000" },
  { label: "Dead inventory carrying cost and storage fees", value: "−₹22,000" },
  { label: "Price drop required to clear stock (margin lost)", value: "−₹38,000" },
];

const roiWith = [
  { label: "Same budget — validated with demand data", value: "₹3,00,000 invested wisely" },
  { label: "Low-competition category — page 1 in 14 days", value: "+organic rank from week 2" },
  { label: "Differentiated product — 4.6★ from month 1", value: "+conversion advantage" },
  { label: "First-month sell-through (₹450 × 760 units)", value: "+₹3,42,000" },
  { label: "2× reorders placed — months 2–6", value: "+₹7,20,000" },
];

const faqs = [
  { id: "faq-1", q: "How does Insydz find profitable products on Amazon India and Flipkart?", a: "Insydz analyses millions of products across Amazon.in and Flipkart in real time — combining demand signals, competition density, and profit margin estimates to generate an AI opportunity score from 1–100. Products with high demand, low competition, and healthy margins surface first." },
  { id: "faq-2", q: "Can I find profitable products for both Amazon India and Flipkart?", a: "Yes. Insydz analyses product opportunities across both platforms simultaneously — comparing demand levels and competition density for the same product, so you know which marketplace has the better opportunity right now." },
  { id: "faq-3", q: "What makes a product 'profitable' according to Insydz?", a: "Four factors: demand strength, competition gap (weak top sellers?), margin viability (does price support profit after fees?), and timing (growing or saturating category?). Products scoring well on all four get a high AI opportunity score." },
  { id: "faq-4", q: "Do I need product research experience to use Insydz?", a: "No. Enter your budget, target margin, and preferred categories. The AI surfaces opportunities in plain language: 'High demand, low competition — estimated profit ₹450/unit.' No experience, spreadsheets, or specialist knowledge required." },
  { id: "faq-5", q: "How often is product opportunity data updated?", a: "Continuously. Trending opportunities are flagged in real time. You can also set category alerts so you're notified when a new high-opportunity product appears — even when you're not actively using the dashboard." },
  { id: "faq-6", q: "Can I save products I'm interested in researching further?", a: "Yes. Save any opportunity to your watchlist and track how demand, competition, and margin scores change over time — especially useful for validating seasonal trends before you commit to sourcing inventory for the Indian festive season." },
];

export default function FindProfitableProductsPage() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-profitable-schema-${i}`;
      if (document.getElementById(id)) return;
      const script = document.createElement("script");
      script.id = id; script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    return () => { SCHEMAS.forEach((_, i) => { document.getElementById(`insydz-profitable-schema-${i}`)?.remove(); }); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    isDarkMode ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDropdown(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetStarted = () => setLocation("/login");
  const toggleMobileMenu = (name: string) => setMobileActiveMenu(mobileActiveMenu === name ? null : name);
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) { setLocation(item.route); setActiveDropdown(null); setIsMenuOpen(false); }
  };

  const DesktopDropdown = ({ label, menuKey, accent = "purple" }: { label: string; menuKey: keyof NavigationMenu; accent?: "purple" | "blue" }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const isBlue = accent === "blue";
    return (
      <div className="relative">
        <button onMouseEnter={() => setActiveDropdown(label)} className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (isBlue ? "text-blue-600 font-semibold" : "text-purple-600 font-semibold") : (isBlue ? "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20")}`}>
          {label}<ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
        {isActive && (
          <div onMouseLeave={() => setActiveDropdown(null)} className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {items.map((item, i) => (
              item.route ? (
                <Link key={i} href={item.route} onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }} className={`w-full px-4 py-2.5 flex items-center gap-3 group transition-colors ${isBlue ? "hover:bg-blue-50 dark:hover:bg-blue-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                  <span className={`flex-shrink-0 ${isBlue ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                  <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                  {item.badge && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">{item.badge}</span>}
                </Link>
              ) : (
                <span key={i} className={`w-full px-4 py-2.5 flex items-center gap-3 opacity-60 cursor-default`}>
                  <span className={`flex-shrink-0 ${isBlue ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}`}>{item.icon}</span>
                  <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{item.name}</span>
                </span>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Helmet>
        <link rel="canonical" href="https://insydz.com/use-cases/find-profitable-products" />
        <title>Find Profitable Products for Amazon & Flipkart | Insydz</title>
        <meta name="description" content="Find high-margin, low-competition products on Amazon & Flipkart with Insydz. Analyse demand, calculate margins, and find your next winner. Try free." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Helmet>

      {/* ══ NAV ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <a href="/" className="flex items-center space-x-1 group">
              <div className="relative">
                <img src="/logo.png" alt="Insydz Logo" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">Insydz</span>
            </a>
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1" ref={dropdownRef}>
              <DesktopDropdown label="Solutions"  menuKey="Solutions" />
              <DesktopDropdown label="Use Cases"  menuKey="Use Cases" accent="blue" />
              <DesktopDropdown label="Features"   menuKey="Features" />
              <Link href="/pricing" onMouseEnter={() => setActiveDropdown(null)} className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">Pricing</Link>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare"    menuKey="Compare" />
              <DesktopDropdown label="Resources"  menuKey="Resources" />
              <DesktopDropdown label="About"      menuKey="About" />
              <Link href="/login" onMouseEnter={() => setActiveDropdown(null)} className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Login</Link>
              <button className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />}
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <a href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Home
              </a>
              {(["Solutions","Use Cases","Features","Free Tools","Compare","Resources","About"] as (keyof NavigationMenu)[]).map((key) => (
                <div key={key}>
                  <button onClick={() => toggleMobileMenu(key)} className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${key === "Use Cases" ? "text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                    {key}<ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveMenu === key && (
                    <div className="ml-3 sm:ml-4 mt-0.5 space-y-0.5">
                      {(navigationMenu[key] as MenuItemWithBadge[]).map((item, i) => (
                        item.route ? (
                          <Link key={i} href={item.route} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg ${key === "Use Cases" ? "hover:bg-blue-50 dark:hover:bg-blue-900/20" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="text-left flex-1">{item.name}</span>
                            {item.badge && <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                          </Link>
                        ) : (
                          <span key={i} className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 rounded-lg opacity-60">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="text-left flex-1">{item.name}</span>
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm">Pricing</Link>
              <a href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center text-sm py-2 rounded-lg font-semibold block">Login</a>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute top-32 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-blue-700">India's #1 Product Profitability Analysis Software 🇮🇳</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                Find Profitable Products
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Before Your Competitors Do
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
                India's most powerful <strong>product profitability analysis software</strong> for Amazon and Flipkart sellers — with AI-powered insights that show you exactly what to sell next,
                <span className="text-blue-700 font-semibold"> backed by real demand data and margin calculations in INR.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
                  👉 Discover Profitable Products Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 sm:pt-4">
                {["Amazon & Flipkart data — real Indian marketplace demand","AI profit predictions in INR before you source","Real-time opportunity alerts — no credit card required"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Top Opportunities Today</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">12 New</span>
                  </div>

                  {[
                    { name: "Smart Kitchen Gadgets", demand: "High", competition: "Low", profit: "₹450", score: "88/100", trend: "up" },
                    { name: "Eco-Friendly Home Decor", demand: "Medium", competition: "Low", profit: "₹380", score: "74/100", trend: "up" },
                    { name: "Tech Accessories", demand: "High", competition: "Medium", profit: "₹290", score: "65/100", trend: "stable" },
                  ].map((product, i) => (
                    <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{product.name}</h4>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded">Demand: {product.demand}</span>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 rounded">Competition: {product.competition}</span>
                          </div>
                        </div>
                        {product.trend === "up" ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" /> : <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Avg. Profit/Unit: <span className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">{product.profit}</span></span>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">Score: {product.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl">
                  <p className="text-white font-bold text-xs sm:text-sm">AI Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY SELLERS PICK WRONG PRODUCTS ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              Why Most Sellers Pick
              <br />
              <span className="text-red-600">The Wrong Products</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The biggest mistake Indian Amazon and Flipkart sellers make isn't in their operations — it's in their product selection. Most sellers launch on instinct, copy competitors, or rely on outdated research methods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Guessing based on gut feeling, not real demand data", color: "from-red-500 to-orange-500" },
              { icon: <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Entering oversaturated markets too late — after competitors are entrenched", color: "from-orange-500 to-yellow-500" },
              { icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Missing hidden profit opportunities that aren't obvious from browsing", color: "from-blue-500 to-indigo-500" },
              { icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />, title: "Wasting weeks on manual research that still gives incomplete data", color: "from-indigo-500 to-purple-500" },
            ].map((pain, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${pain.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform shadow-md`}>{pain.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-sm sm:text-base">{pain.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-400 dark:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="text-red-600">67% of new sellers</span> fail in their first year
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-lg">
              ...because they launch products without proper market research — investing in inventory before validating demand, margins, or competition levels on Indian marketplaces.
            </p>
          </div>
        </div>
      </section>

      {/* ══ MANUAL VS INSYDZ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Why Manual Product Research
              <br />
              <span className="text-red-600">Fails Indian Sellers</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Most sellers spend 2–4 weeks manually researching products before launch. Here's the critical data they miss.
            </p>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl mb-6 sm:mb-8">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-3">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">What You Need to Know</p></div>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 dark:border-gray-700"><p className="font-bold text-gray-500 text-xs sm:text-sm text-center">Manual Research</p></div>
                <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-blue-500"><p className="font-bold text-white text-xs sm:text-sm text-center">✓ Insydz</p></div>
                {comparisonRows.map((row, i) => (
                  <>
                    <div key={`f-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{row.feature}</p></div>
                    <div key={`m-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 text-center ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}`}><p className="text-xs sm:text-sm text-gray-500">{row.manual}</p></div>
                    <div key={`s-${i}`} className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 text-center ${i % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/10" : "bg-blue-50/50 dark:bg-blue-900/10"}`}><p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 font-semibold">{row.insydz}</p></div>
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base">India-First Differentiator</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Global tools like Jungle Scout and Helium 10 are calibrated for Amazon.com — not Amazon.in. Their demand estimates, competition scores, and profitability calculations are built on US marketplace behaviour. Indian category dynamics, price sensitivity, festive demand cycles, and marketplace fee structures are completely different. Insydz is the only <strong>product opportunity finder</strong> built on Indian marketplace data from the ground up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              How Product Discovery Works
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">with Insydz</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From zero to validated product opportunity in under 10 minutes — no research experience needed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 -translate-y-1/2 z-0" />
            {[
              { step: 1, title: "Set Your Criteria", desc: "Tell Insydz your budget, target margin, and preferred categories. AI filters millions of products across Amazon India and Flipkart instantly.", visual: <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto" />, bg: "bg-blue-100 dark:bg-blue-900/20", isResults: false },
              { step: 2, title: "AI Analyses Market Data", desc: "We analyse demand signals, competition density, pricing trends, profitability margins, and review gap opportunities — calibrated for Indian marketplace behaviour.", visual: <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto animate-pulse" />, bg: "bg-purple-100 dark:bg-purple-900/20", isResults: false },
              { step: 3, title: "Get Winning Products", desc: "", visual: null, bg: "bg-green-100 dark:bg-green-900/20", isResults: true },
            ].map((step, i) => (
              <div key={i} className="relative z-10">
                <div className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-black text-white shadow-lg">{step.step}</div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{step.title}</h3>
                  {step.isResults ? (
                    <div className="space-y-2 sm:space-y-3 text-left">
                      {[
                        { cls: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700", icon: "text-green-600", text: '"High demand, low competition product found"' },
                        { cls: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700", icon: "text-blue-600", text: '"Estimated profit: ₹450/unit"' },
                        { cls: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700", icon: "text-indigo-600", text: '"Top sellers have 3.7 rating — gap to win"' },
                      ].map((a, ai) => (
                        <div key={ai} className={`flex items-start gap-2 ${a.cls} border rounded-lg p-2.5 sm:p-3`}>
                          <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${a.icon} flex-shrink-0 mt-0.5`} />
                          <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">{a.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{step.desc}</p>
                      <div className={`${step.bg} rounded-2xl p-3 sm:p-4`}>{step.visual}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group">
              👉 Find Your First Profitable Product Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU DISCOVER ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              What You Discover with
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Product Research</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {whatYouDiscover.map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white shadow-md`}>{item.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">{item.desc}</p>
                <Link href={item.link} className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline">See {item.linkLabel} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDIA-FIRST + SELLER SCENARIO ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-white">
              How Insydz Is Different —
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Built on Indian Marketplace Data</span>
            </h2>
          </div>

          {/* Scenario */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-lg">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl">📌</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Real Seller Scenario</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Home Décor Seller, Jaipur</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">Priya sells home décor on Amazon India. In October, she was planning to launch LED strip lights for the Diwali season. Her instinct said "popular" — but she had no data to back up how much to source or whether the market was already crowded.</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">Using Insydz's <strong>product demand analysis tool</strong>, she ran a 10-minute analysis. Results: "LED strip lights for bedroom" had 340% higher search velocity in Nov–Dec. But the top 4 sellers all had ratings below 3.9, primarily due to cable quality complaints and unclear installation guides.</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">Priya launched with upgraded braided cables and a Hindi installation card. Her listing converted at 4.8 stars from week two.</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[{ label: "First Month GMV", value: "₹3.4 Lakhs" },{ label: "Rating from Week 2", value: "4.8 ★" },{ label: "Research Time", value: "10 minutes" }].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        4 India-First Advantages
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
        Built specifically for Indian e-commerce sellers — not adapted from global tools.
      </p>
    </div>

          {/* 4 India-First Advantages */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Indian Demand Cycles", desc: "Calibrated for Diwali, Navratri, Republic Day — not Black Friday or Prime Day.", color: "from-orange-500 to-red-500" },
              { icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Accurate INR Profit Modelling", desc: "Margin estimates factor in Amazon India and Flipkart fee structures — not US equivalents.", color: "from-green-500 to-emerald-500" },
              { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Tier 1–3 City Demand Intelligence", desc: "Demand signals from all-India activity — not just Delhi/Mumbai/Bengaluru.", color: "from-blue-500 to-cyan-500" },
              { icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Review Gap Analysis", desc: "AI reads competitor reviews to surface product differentiation brief (250,000+ reviews analysed daily).", color: "from-purple-500 to-pink-500" },
            ].map((adv, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 flex items-start gap-3 sm:gap-4 hover:border-blue-400 transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${adv.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>{adv.icon}</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{adv.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROI ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
              The Cost of Launching Without
              <br />
              <span className="text-red-600">Product Profitability Analysis</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Two sellers launch in the same category on Amazon India. Both invest ₹3L in initial inventory. The only difference: one uses Insydz's <strong>product opportunity finder</strong>. One doesn't.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 mb-6 sm:mb-8">
            {[
              { title: "❌ Without Insydz — 6-Month Launch Outcome", rows: roiWithout, total: "Total Cost of Wrong Product Selection", totalValue: "−₹1,05,000", headerCls: "bg-red-50 dark:bg-red-900/30", textCls: "text-red-700 dark:text-red-400", valueCls: "text-red-600", totalBg: "bg-red-50 dark:bg-red-900/20", totalTextCls: "text-red-700", borderCls: "border-red-300 dark:border-red-700" },
              { title: "✅ With Insydz — Same 6-Month Period", rows: roiWith, total: "6-Month Net Revenue", totalValue: "+₹10,62,000", headerCls: "bg-green-50 dark:bg-green-900/30", textCls: "text-green-700 dark:text-green-400", valueCls: "text-green-600", totalBg: "bg-green-50 dark:bg-green-900/20", totalTextCls: "text-green-700", borderCls: "border-green-300 dark:border-green-700" },
            ].map((panel, pi) => (
              <div key={pi} className={`rounded-2xl border-2 ${panel.borderCls} overflow-hidden shadow-lg`}>
                <div className={`${panel.headerCls} px-4 sm:px-6 py-3 sm:py-4`}><p className={`font-bold ${panel.textCls} text-sm sm:text-base lg:text-lg`}>{panel.title}</p></div>
                <div className="bg-white dark:bg-gray-900">
                  {panel.rows.map((row, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 gap-2 ${i % 2 !== 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1">{row.label}</p>
                      <p className={`text-xs sm:text-sm font-bold ${panel.valueCls} whitespace-nowrap flex-shrink-0`}>{row.value}</p>
                    </div>
                  ))}
                  <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 ${panel.totalBg} gap-2`}>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm flex-1">{panel.total}</p>
                    <p className={`font-black ${panel.totalTextCls} text-base sm:text-lg ml-2 whitespace-nowrap flex-shrink-0`}>{panel.totalValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-400 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-2">₹11.67L difference between a validated product launch and a gut-feel launch</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Same budget. Same category. Same marketplaces. The only variable: whether you used <strong>product profitability analysis software</strong> before you sourced.</p>
          </div>
        </div>
      </section>

      {/* ══ FREE PLAN ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Start Free.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">See Real Opportunities.</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">Free Plan — ₹0 / Forever — No credit card required</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-left shadow-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-4 sm:mb-6 text-center">Free Plan Includes:</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {["Product opportunity discovery on Amazon India and Flipkart","AI opportunity scores (1–100) for every product","Competition analysis & gaps","Profit margin estimates in INR","Search volume & demand data","Save products to watchlist"].map((feature, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span><strong className="text-gray-900 dark:text-white">Upgrade teaser:</strong> Paid plans unlock unlimited product research, full 90-day demand history, advanced margin modelling, review gap deep-dives, and real-time opportunity alerts for your saved categories.</span>
            </p>
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group">
            👉 Discover Profitable Products Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* ══ ICP CTAs ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-6 text-white">Stop Guessing.<br />Start Selling Winners.</h2>
          <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12">Join sellers who find profitable products with AI-powered research, not luck.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              { emoji: "🆕", label: "New Sellers (Free Plan)", desc: "The free plan validates your first product idea before you spend a rupee on inventory. No experience needed — the AI does the analysis, you make the call.", cta: "Start Free — No Card Needed →", action: handleGetStarted },
              { emoji: "📈", label: "Growing Sellers (Growth Plan)", desc: "Doing ₹5L+ monthly and planning your next SKU? The Growth Plan unlocks unlimited research, full demand history, advanced margin modelling, and automated alerts.", cta: "Try Growth Plan →", action: () => setLocation("/pricing") },
              { emoji: "🏢", label: "D2C Brands / Agencies (Demo)", desc: "Managing multiple product launches? Custom workflows, white-label opportunity reports, API access, and dedicated account support.", cta: "Book a Demo →", action: () => setLocation("/demo") },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 sm:p-6 text-left">
                <p className="text-xl sm:text-2xl mb-2">{card.emoji}</p>
                <p className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{card.label}</p>
                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4">{card.desc}</p>
                {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="text-blue-200 font-semibold text-xs sm:text-sm hover:text-white transition-colors underline">{card.cta}</Link>
                ) : card.cta === "Book a Demo →" ? (
                  <Link href="/demo" className="text-blue-200 font-semibold text-xs sm:text-sm hover:text-white transition-colors underline">{card.cta}</Link>
                ) : (
                  <a href="/login" className="text-blue-200 font-semibold text-xs sm:text-sm hover:text-white transition-colors underline">{card.cta}</a>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl group">
            👉 Discover Profitable Products Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-sm">✓ No credit card required  ✓ Setup in 2 minutes  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-4 text-center text-gray-900 dark:text-white">Product Research — FAQs</h2>
          <p className="text-center text-gray-500 mb-8 sm:mb-12 text-base sm:text-lg">About Finding Profitable Products on Amazon & Flipkart India</p>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-300 transition-all">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white pr-3 sm:pr-4 text-sm sm:text-base lg:text-lg">{faq.q}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm sm:text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STICKY MOBILE CTA ══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-300 dark:border-blue-700 p-3 sm:p-4 shadow-2xl z-40" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 sm:py-4 rounded-full shadow-xl text-sm sm:text-base">
          👉 Find Profitable Products Free
        </Button>
      </div>

      {/* Spacer so sticky CTA doesn't cover footer content */}
      <div className="lg:hidden h-16 sm:h-20" />

      {/* Footer */}
      <footer className="bg-[#0a0f1e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
          {/* 5 Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 mb-14">
 
            {/* Column 1 – Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <a href="/" className="flex items-center space-x-3 mb-4" aria-label="Insydz – Home">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-10 h-10 object-contain p-0.5"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Insydz
                </span>
              </a>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                India's AI-powered ecommerce analytics software for Amazon, Flipkart sellers.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free →
              </Link>
              <div className="flex space-x-3 mt-6">
                <a
                  title="Insydz on Facebook"
                  href="https://www.facebook.com/profile.php?id=61586202582209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Twitter / X"
                  href="https://x.com/growwithinsydz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on Instagram"
                  href="https://www.instagram.com/growwithinsydz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  title="Insydz on LinkedIn"
                  href="https://www.linkedin.com/company/insydz/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Insydz on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
 
            {/* Column 2 – Solutions */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Solutions</h4>
              <ul className="space-y-3">
                <li><Link to="/solutions/amazon-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Amazon Sellers</Link></li>
                <li><Link to="/solutions/flipkart-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Flipkart Sellers</Link></li>
                <li><Link to="/solutions/ecommerce-agencies" className="text-sm text-gray-400 hover:text-white transition-colors">Agencies</Link></li>
                <li><Link to="/solutions/brand-managers" className="text-sm text-gray-400 hover:text-white transition-colors">Brand Managers</Link></li>
              </ul>
            </div>
 
            {/* Column 3 – Product */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/features/festive-trend-feature" className="text-sm text-gray-400 hover:text-white transition-colors">Festive Trends</Link></li>
                <li><Link to="/compare/insydzvshelium" className="text-sm text-gray-400 hover:text-white transition-colors">Compare</Link></li>
              </ul>
            </div>
 
            {/* Column 4 – Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/resources/expert-blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/resources/guides" className="text-sm text-gray-400 hover:text-white transition-colors">E-commerce Guides</Link></li>
                <li><Link to="/resources/videos" className="text-sm text-gray-400 hover:text-white transition-colors">Video Tutorials</Link></li>
                <li><Link to="/resources/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link to="/free-tools/free-amazon-product-analyzer" className="text-sm text-gray-400 hover:text-white transition-colors">Free Tools</Link></li>
              </ul>
            </div>
 
            {/* Column 5 – Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Company</h4>
              <ul className="space-y-3">
                {/* "About" scrolls on this page — use a hash href so it's crawlable */}
                <li><a href="#About" onClick={(e) => { e.preventDefault(); scrollToSection('About'); }} className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/about/our-vision" className="text-sm text-gray-400 hover:text-white transition-colors">Our Vision</Link></li>
                <li><Link to="/about/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/about/contact-us" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
 
          </div>
 
          {/* Bottom Strip */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-gray-500 text-sm">
                © 2025 <span className="text-purple-400 font-semibold">Insydz</span>. All rights reserved. Designed & Developed in India 🇮🇳
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-gray-700">·</span>
                <a href="/terms-service" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="text-gray-700">·</span>
                <a href="/privacy-policy" className="hover:text-white transition-colors">Data Disclaimer</a>
              </div>
            </div>
          </div>
 
        </div>
      </footer>
 
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
 
