"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, ChevronRight, Check, ArrowRight,
  CheckCircle2, DollarSign, Globe, Bell, Zap, 
  TrendingUp, Users, Target, AlertCircle, IndianRupee,
  Mail, Smartphone, BarChart3, Package, Shield,
  Menu, Sun, Moon, ShoppingBag, Store, Briefcase,
  Code, Trophy, ArrowLeft, BookOpen, Video, FileText,
  Search, MessageCircle, TrendingDown, X,
  Presentation,
  Flame, LayoutGrid, Facebook, Instagram, Linkedin, Twitter
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";




const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Jungle Scout", "item": "https://insydz.com/compare/insydz-vs-jungle-scout" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is Insydz a replacement for Jungle Scout?", "acceptedAnswer": { "@type": "Answer", "text": "For Indian sellers on Amazon India, Flipkart — yes, Insydz is a direct and more capable replacement. It covers Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence that Jungle Scout cannot provide. If you also sell on Amazon.com and need deep US-market tools (AccuSales, supplier database), Jungle Scout may be worth evaluating separately for that use case." } },
      { "@type": "Question", "name": "Why is Insydz cheaper than Jungle Scout?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is priced in INR starting at ₹1,999/month vs Jungle Scout's $49/month (~₹4,100). The difference isn't just currency: Insydz focuses on five high-value use cases for Indian marketplace sellers rather than building a 15+ tool suite for a global audience. Lower cost structure, faster onboarding, and features you'll actually use on day one." } },
      { "@type": "Question", "name": "Can I use Insydz and Jungle Scout together?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — some sellers with cross-border operations do exactly this. They use Jungle Scout for Amazon.com product research and global supplier sourcing, and Insydz for Indian marketplace intelligence: Flipkart tracking, Hindi review analysis, WhatsApp alerts, and festive demand forecasting. If India and USA are both active markets, this combination covers both without compromise." } },
      { "@type": "Question", "name": "How accurate is Jungle Scout data for Amazon India?", "acceptedAnswer": { "@type": "Answer", "text": "Jungle Scout's data is calibrated for Amazon.com. When applied to Amazon India, keyword volume estimates are off because Indian search behaviour differs significantly from US patterns. Demand projections don't account for Indian festive spikes. Revenue estimates use US marketplace fee structures, not Amazon.in fees. Directional signals can sometimes be useful — but for precise inventory, repricing, and launch decisions, Amazon.in-native data from Insydz is materially more accurate." } },
      { "@type": "Question", "name": "What is the cheapest Jungle Scout alternative for Indian sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is the most affordable Jungle Scout alternative built specifically for Indian sellers — with a permanent free plan (no credit card, no expiry) and paid plans from ₹1,999/month. Other alternatives include SellerApp (covers Amazon India, English-only, no Flipkart) and Helium 10 (USD pricing, Amazon.com focused). For sellers whose primary market is India, Insydz is the only purpose-built option of the three." } },
      { "@type": "Question", "name": "Does Insydz work for Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — this is one of Insydz's most significant advantages over Jungle Scout. Insydz provides competitor price tracking, keyword rank monitoring, review sentiment analysis, and inventory management for Flipkart sellers. Jungle Scout has no Flipkart support whatsoever. If Flipkart is part of your business, Insydz is the only option between these two tools." } },
      { "@type": "Question", "name": "Is there a free plan for Insydz?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz has a permanent free plan — not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Jungle Scout has no free plan — only a 7-day money-back period after you enter credit card details." } },
      { "@type": "Question", "name": "What are the best Jungle Scout alternatives for India in 2025?", "acceptedAnswer": { "@type": "Answer", "text": "The top Jungle Scout alternatives for Indian sellers are: (1) Insydz — most India-specific, covers Amazon India + Flipkart, WhatsApp alerts, Hindi reviews, INR pricing, free plan. (2) SellerApp — covers Amazon India, English-only, no Flipkart. (3) Helium 10 — powerful but USD pricing, Amazon.com focused, no Flipkart support. For sellers whose primary market is India, Insydz is the only purpose-built option of the three." } }
    ]
  }
];

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
    { name: "All Solutions (Overview)", icon: <ShoppingBag className="w-4 h-4" />, route: "/solutions/solutions" },
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

export default function InsydzVsJungleScoutPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  SCHEMAS.forEach((schema, i) => {
    const id = `insydz-junglescout-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-junglescout-schema-${i}`);
      if (el) el.remove();
    });
  };
}, []);  

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetStarted = () => router.push("/signup");
  const toggleMobileMenu = (menuName: string) => setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);

  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    router.push('/');
    setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // Updated comparison data from DOCX
  const comparisonFeatures = [
    { area: 'Marketplace Coverage', insydz: 'Amazon India + Flipkart', competitor: 'Amazon.com only no Amazon.in, no Flipkart', insydzIcon: <Globe className="w-5 h-5 text-green-600" />, competitorIcon: <Package className="w-5 h-5 text-gray-500" /> },
    { area: 'Pricing', insydz: '₹0 / ₹1,999 / ₹2,999/month in INR', competitor: '$49–$129/month (~₹4,100–₹10,800). Billed in USD.', insydzIcon: <IndianRupee className="w-5 h-5 text-green-600" />, competitorIcon: <DollarSign className="w-5 h-5 text-gray-500" /> },
    { area: 'Free Plan', insydz: 'Free forever — 25 products, no credit card', competitor: 'No free plan. 7-day money-back only. Card required upfront.', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Alert Channel', insydz: 'WhatsApp + Dashboard', competitor: 'Email + Dashboard only', insydzIcon: <Smartphone className="w-5 h-5 text-green-600" />, competitorIcon: <Mail className="w-5 h-5 text-gray-500" /> },
    { area: 'Language Support', insydz: 'Hindi + Hinglish + English review analysis', competitor: 'English only', insydzIcon: <Users className="w-5 h-5 text-green-600" />, competitorIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Keyword Research', insydz: 'Amazon.in + Flipkart data in Indian volumes', competitor: 'Amazon.com data — not calibrated for Indian search volumes', insydzIcon: <Search className="w-5 h-5 text-green-600" />, competitorIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Competitor Price Tracking', insydz: 'Real-time, WhatsApp alert, AI reprice in INR', competitor: 'Price tracking on Amazon.com only', insydzIcon: <TrendingDown className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Review Analysis', insydz: 'AI clustering in Hindi & English', competitor: 'English only', insydzIcon: <MessageCircle className="w-5 h-5 text-green-600" />, competitorIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Festive Demand Intelligence', insydz: 'Diwali, BBD, GIF, Republic Day forecasting', competitor: 'Not available built for US market', insydzIcon: <Flame className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Data Accuracy for India', insydz: 'Built from Amazon.in + Flipkart data directly', competitor: 'US-calibrated data directional but not India-accurate', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, competitorIcon: <AlertCircle className="w-5 h-5 text-orange-500" /> },
    { area: 'Ease of Use', insydz: 'Action-driven every alert includes next step', competitor: 'Data-heavy, requires learning curve to act on insights', insydzIcon: <Zap className="w-5 h-5 text-green-600" />, competitorIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Product Research Depth', insydz: 'Focused 5 Indian marketplace use cases', competitor: 'Deep Amazon.com product research AccuSales, Opportunity Score', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, competitorIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
    { area: 'Supplier Database', insydz: 'Not available', competitor: 'Supplier database for global sourcing (US-focused)', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, competitorIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
    { area: 'Amazon PPC Tools', insydz: 'Not available (focus: organic intelligence)', competitor: 'Cobalt keyword PPC tracking for Amazon Ads', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, competitorIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is Insydz a replacement for Jungle Scout?',
      answer: "For Indian sellers on Amazon India, Flipkart yes, Insydz is a direct and more capable replacement. It covers Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence that Jungle Scout cannot provide. If you also sell on Amazon.com and need deep US-market tools (AccuSales, supplier database), Jungle Scout may be worth evaluating separately for that use case."
    },
    {
      id: 'faq-2',
      question: 'Why is Insydz cheaper than Jungle Scout?',
      answer: "Insydz is priced in INR starting at ₹1,999/month vs Jungle Scout's $49/month (~₹4,100). The difference isn't just currency: Insydz focuses on five high-value use cases for Indian marketplace sellers rather than building a 15+ tool suite for a global audience. Lower cost structure, faster onboarding, and features you'll actually use on day one."
    },
    {
      id: 'faq-3',
      question: 'Can I use Insydz and Jungle Scout together?',
      answer: "Yes some sellers with cross-border operations do exactly this. They use Jungle Scout for Amazon.com product research and global supplier sourcing, and Insydz for Indian marketplace intelligence: Flipkart tracking, Hindi review analysis, WhatsApp alerts, and festive demand forecasting. If India and USA are both active markets, this combination covers both without compromise."
    },
    {
      id: 'faq-4',
      question: 'How accurate is Jungle Scout data for Amazon India?',
      answer: "Jungle Scout's data is calibrated for Amazon.com. When applied to Amazon India, keyword volume estimates are off because Indian search behaviour differs significantly from US patterns. Demand projections don't account for Indian festive spikes. Revenue estimates use US marketplace fee structures, not Amazon.in fees. Directional signals can sometimes be useful but for precise inventory, repricing, and launch decisions, Amazon.in-native data from Insydz is materially more accurate."
    },
    {
      id: 'faq-5',
      question: 'What is the cheapest Jungle Scout alternative for Indian sellers?',
      answer: "Insydz is the most affordable Jungle Scout alternative built specifically for Indian sellers with a permanent free plan (no credit card, no expiry) and paid plans from ₹1,999/month. Other alternatives include SellerApp (covers Amazon India, English-only, no Flipkart) and Helium 10 (USD pricing, Amazon.com focused). For sellers whose primary market is India, Insydz is the only purpose-built option of the three."
    },
    {
      id: 'faq-6',
      question: 'Does Insydz work for Flipkart sellers?',
      answer: "Yes. This is one of Insydz's most significant advantages over Jungle Scout. Insydz provides competitor price tracking, keyword rank monitoring, review sentiment analysis, and inventory management for Flipkart sellers. Jungle Scout has no Flipkart support whatsoever. If Flipkart is part of your business, Insydz is the only option between these two tools."
    },
    {
      id: 'faq-7',
      question: 'Is there a free plan for Insydz?',
      answer: "Yes. Insydz has a permanent free plan not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Jungle Scout has no free plan only a 7-day money-back period after you enter credit card details."
    },
    {
      id: 'faq-8',
      question: 'What are the best Jungle Scout alternatives for India in 2025?',
      answer: "The top Jungle Scout alternatives for Indian sellers are: (1) Insydz most India-specific, covers Amazon India + Flipkart, WhatsApp alerts, Hindi reviews, INR pricing, free plan. (2) SellerApp covers Amazon India, English-only, no Flipkart. (3) Helium 10 powerful but USD pricing, Amazon.com focused, no Flipkart support. For sellers whose primary market is India, Insydz is the only purpose-built option of the three."
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium text-blue-700">🇮🇳 Built for Indian Sellers</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
            Insydz vs Jungle Scout
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Which Tool Fits Indian Sellers Better?</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
            Both tools help sellers grow on Amazon. The difference is who they're built for. Compare pricing, marketplaces, alerts, and usability then decide confidently.
          </p>

          {/* Verdict Strip */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 mb-10 max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium pb-3 pr-6">Metric</th>
                  <th className="text-left text-blue-400 font-bold pb-3 pr-6">Insydz</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Jungle Scout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { label: 'Starting Price', insydz: '₹0/month', competitor: '~₹4,100+/month ($49)' },
                  { label: 'Flipkart Support', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'WhatsApp Alerts', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'Hindi Review Analysis', insydz: '✅ Yes', competitor: '✗ No' },
                  { label: 'Free Plan (Permanent)', insydz: '✅ Yes, no credit card', competitor: '✗ 7-day money-back only' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-gray-400 py-2.5 pr-6 text-left">{row.label}</td>
                    <td className="text-green-400 font-semibold py-2.5 pr-6 text-left">{row.insydz}</td>
                    <td className="text-gray-500 py-2.5 text-left">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-8 py-6 rounded-full shadow-2xl group">
              Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="lg"
              className="border-2 border-blue-400 text-blue-600 dark:text-blue-400 font-bold px-8 py-6 rounded-full"
            >
              See Full Comparison ↓
            </Button>
          </div>
        </div>
      </section>

      {/* Why Indian Sellers Struggle with Jungle Scout */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Why Indian Sellers Struggle with Jungle Scout
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Jungle Scout is a serious tool for Amazon.com sellers in the US. Indian sellers who try it for Amazon India or Flipkart hit the same four walls within weeks.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                title: 'No free plan. Just a 7-day window.',
                desc: "Jungle Scout's entry plan is $49/month (~₹4,100). There's no permanent free tier just a 7-day money-back window. For a new Indian seller who needs weeks to validate their niche before committing, that's not a real trial.",
                color: 'from-red-500 to-orange-500',
              },
              {
                number: '02',
                title: "Jungle Scout doesn't know Flipkart exists",
                desc: "Jungle Scout is built for Amazon.com. It has zero data on Flipkart, or Indian marketplace search patterns. If Flipkart is part of your business, Jungle Scout can't help regardless of which plan you're on.",
                color: 'from-orange-500 to-yellow-500',
              },
              {
                number: '03',
                title: 'Email alerts in a WhatsApp-first world',
                desc: "Jungle Scout sends alerts by email. Most Indian sellers don't monitor business email on mobile the way they monitor WhatsApp. A competitor repricing your product at 11pm during sale season? You'll see the email in the morning too late.",
                color: 'from-yellow-500 to-green-500',
              },
              {
                number: '04',
                title: 'Jungle Scout data accuracy for India real talk',
                desc: "Jungle Scout's demand estimates, keyword volumes, and revenue projections are calibrated for Amazon.com. When applied to Amazon India, the data is directionally useful but not accurate for Indian search behaviour, INR margin calculations, or festive season demand spikes.",
                color: 'from-blue-500 to-cyan-500',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center gap-4 mb-4">
  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white font-black text-lg`}>
    {item.number}
  </div>
  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
    {item.title}
  </h3>
</div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-3xl mx-auto text-center">
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              <strong>A fair note:</strong> Jungle Scout is a well-built product for Amazon.com sellers. If your primary business is Amazon USA, it's worth evaluating. This comparison is specifically for Indian sellers on Amazon India, Flipkart where the data gap matters most.
            </p>
          </div>
        </div>
      </section>

      {/* Full Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Insydz vs Jungle Scout Every Dimension That Matters
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            A complete comparison for Indian marketplace sellers including areas where Jungle Scout has a genuine edge too.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <th className="px-6 py-4 text-left text-white font-bold">Feature Area</th>
                  <th className="px-6 py-4 text-left text-white font-bold">🇮🇳 Insydz</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Jungle Scout</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={i} className={`border-b border-gray-200 dark:border-gray-700 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white">{feature.area}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.insydzIcon}
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature.insydz}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {feature.competitorIcon}
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{feature.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Insydz vs Jungle Scout Pricing Paying in Dollars When You Sell in Rupees
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Every month, Jungle Scout's bill changes based on the USD/INR exchange rate. Insydz bills in INR.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Insydz Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🇮🇳</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Insydz Pricing</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Free Plan', price: '₹0/month always', desc: '25 products, no credit card, no expiry date' },
                  { plan: 'Basic', price: '₹1,999/month', desc: 'Competitor price tracking, keyword monitoring, review analysis' },
                  { plan: 'Premium', price: '₹2,999/month', desc: 'All features, all three marketplaces, priority support' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Start free, upgrade only when you see results. No exchange rate surprises.</span>
                </li>
              </ul>
            </div>

            {/* Jungle Scout Pricing */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Jungle Scout Pricing (India Reality)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Basic', price: '$49/month (~₹4,100)', desc: 'Limited features' },
                  { plan: 'Suite', price: '$69/month (~₹5,800)', desc: 'Full feature access' },
                  { plan: 'Professional', price: '$129/month (~₹10,800)', desc: 'Team features' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{item.plan}: </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{item.price}</span>
                      <span className="text-gray-600 dark:text-gray-400"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
                {[
                  'No free plan — 7-day money-back only. Credit card required upfront.',
                  'Billing in USD means your cost rises when the rupee weakens.',
                  'All plans cover Amazon.com only — not Amazon.in or Flipkart.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROI callout */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-black mb-3">12-Month Real Cost Comparison</h3>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              A seller on Jungle Scout Suite pays ~<strong>₹69,600/year</strong>. Insydz Premium is <strong>₹35,988/year</strong> covering Amazon India, Flipkart, with WhatsApp alerts and Hindi review analysis.
            </p>
            <p className="text-white font-black text-3xl mt-4">That's ₹33,612 per year back into inventory or ads.</p>
          </div>
        </div>
      </section>

      {/* Real Seller Scenario */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            What Most Tools Don't Tell You About India-Specific Risk
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            The biggest cost of using the wrong tool isn't the subscription fee. It's the revenue you miss because your tool didn't warn you in time with Indian data, in the right channel.
          </p>
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Meenakshi's Diwali Stock Disaster Kitchen Appliances Category, Amazon India
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { label: 'The situation', value: 'Selling mixer-grinder, ₹2,499 price point, 4.1★ rating, strong pre-Diwali demand' },
                    { label: 'What happened', value: "Stocked 200 units based on last year. Sold out in 4 days. Listed as 'Currently Unavailable' for 9 days during peak Diwali week." },
                    { label: 'Why it happened', value: "Jungle Scout demand estimate was based on Amazon.com data didn't account for 4× Indian festive demand spike. No WhatsApp alert. Email arrived 2 days after stockout." },
                    { label: 'The cost', value: '₹3.2L missed revenue. Page 1 ranking dropped from #6 → #29. Took 8 weeks to recover.' },
                    { label: 'With Insydz (same scenario)', value: '14-day festive demand alert with 4× multiplier applied. Reordered 600 units. Zero stockout days.', highlight: true },
                    { label: 'Revenue captured', value: '₹4.8L Diwali revenue. Ranking held at #5 through festive week.', highlight: true },
                  ].map((row, i) => (
                    <tr key={i} className={row.highlight ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                      <td className="py-4 pr-6 font-bold text-gray-700 dark:text-gray-300 w-1/3">{row.label}</td>
                      <td className={`py-4 ${row.highlight ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm">
              The problem wasn't Meenakshi's product or her instincts. The problem was that her tool's demand data was built for Seattle, not Surat and the alert arrived in her email, not her WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Assessment */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Where Each Tool Has a Genuine Edge
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Honest comparisons are more useful than sales pitches.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🇮🇳 Choose Insydz if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell on Flipkart alongside Amazon India',
                  'Want WhatsApp alerts not email digests',
                  'Need pricing in INR with no currency risk',
                  'Have customers who review in Hindi or Hinglish',
                  'Need festive demand forecasting (Diwali, BBD, Great Indian Festival)',
                  'Are a new or growing seller who needs value before scale',
                  'Want action-driven insights not raw data to interpret',
                  'Run a D2C brand on Indian marketplaces',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Choose Jungle Scout if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell primarily on Amazon.com (US marketplace)',
                  'Need deep Amazon.com product research with AccuSales data',
                  'Want a supplier database for global sourcing',
                  'Run Amazon US PPC campaigns needing keyword-level tracking',
                  'Are already a large-scale Amazon US seller',
                  'Want trend analysis calibrated for US consumer behaviour',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm">
                If you sell on Amazon.com, Jungle Scout is a strong, established tool. But if India is your primary market, the data you need lives here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Alerts */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            The Alert That Actually Gets Acted On
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Jungle Scout sends alerts to email. Insydz sends them to WhatsApp with the exact action needed, the moment it matters.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: 'Competitor Price Drop',
                icon: <IndianRupee className="w-6 h-6" />,
                color: 'from-green-500 to-emerald-500',
                message: 'Competitor cut price on Mixer Grinder (1000W). Their new price: ₹2,199 (was ₹2,499). Your price: ₹2,499. AI suggested response: ₹2,299 stays above ₹2,050 margin floor.',
              },
              {
                type: 'Festive Demand Warning',
                icon: <Flame className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
                message: 'Diwali in 18 days. Predicted demand: 4× your normal velocity. Current stock: 180 units (lasts 7 days at festive pace). Recommended reorder: 540 units. Supplier lead time: 10 days. Act now.',
              },
              {
                type: 'Ranking Drop',
                icon: <TrendingDown className="w-6 h-6" />,
                color: 'from-red-500 to-rose-500',
                message: '"mixer grinder 1000 watt" dropped from #5 → #14. Top competitor added 750W variant 5 days ago. Suggested fix: test separate listing for 750W variant.',
              },
            ].map((alert, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className={`bg-gradient-to-r ${alert.color} p-4 flex items-center gap-3`}>
                  <div className="w-8 h-8 bg-background opacity-100 rounded-lg flex items-center justify-center text-white">{alert.icon}</div>
                  <span className="font-bold text-white text-sm">WhatsApp Alert — {alert.type}</span>
                </div>
                <div className="p-5">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center text-gray-900 dark:text-white">
            FAQs Insydz vs Jungle Scout
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronDown className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 text-white">Compare Clearly. Choose What Fits.</h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            Start with the free plan no credit card, no 7-day expiry. See Insydz vs Jungle Scout on your own products, with your own data, before spending a rupee.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icp: 'New Seller', headline: 'Just starting on Amazon India or Flipkart', cta: 'Start Free →', action: () => router.push('/signup') },
              { icp: 'Growing Seller', headline: 'Scaling to ₹5L+ monthly on Indian marketplaces', cta: 'Try Growth Plan →', action: () => router.push('/pricing') },
              { icp: 'Agency', headline: 'Managing multiple seller accounts across platforms', cta: 'Book Demo →', action: () => router.push('/about/contact-us') },
            ].map((card, i) => (
              <div key={i} className="bg-background opacity-100 backdrop-blur rounded-2xl p-6 text-white border border-white/20">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{card.icp}</p>
                <p className="text-sm mb-4 text-white/90">{card.headline}</p>
                {card.cta === "Try Growth Plan →" ? (
                  <Link href="/pricing" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</Link>
                ) : card.cta === "Book Demo →" ? (
                  <Link href="/about/contact-us" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</Link>
                ) : (
                  <a href="/signup" className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-50 transition-colors block text-center">{card.cta}</a>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleGetStarted} size="lg" className="bg-white text-blue-700 font-bold px-12 py-6 rounded-full shadow-2xl group">
            Start Free with Insydz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
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
 

