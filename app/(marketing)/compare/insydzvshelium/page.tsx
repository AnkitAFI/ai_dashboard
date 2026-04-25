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
  Search, MessageCircle, TrendingDown,
  Flame,
  Presentation, LayoutGrid, Facebook, Instagram, Twitter, Linkedin
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
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Helium 10", "item": "https://insydz.com/compare/insydz-vs-helium-10" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is Insydz a replacement for Helium 10 for Indian sellers?", "acceptedAnswer": { "@type": "Answer", "text": "For Indian sellers whose primary market is Amazon India, Flipkart — yes, Insydz is a direct replacement and covers ground Helium 10 cannot: Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. If you also sell on Amazon.com and need deep US-market PPC tools, you may want to keep Helium 10 specifically for that use case." } },
      { "@type": "Question", "name": "Why is Insydz cheaper than Helium 10?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is priced in INR for Indian sellers — starting at ₹1,999/month vs Helium 10's $39/month (~₹3,300). But the cost difference isn't just currency. Insydz is focused on five high-value use cases for Indian marketplace sellers rather than 20+ tools for a global audience. That focus means a product you can use from day one, without a learning curve." } },
      { "@type": "Question", "name": "Can I use Insydz and Helium 10 together?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — and some large sellers do exactly this. They use Helium 10 for Amazon.com PPC management and US-market research, and Insydz for Indian marketplace intelligence, Flipkart tracking, and WhatsApp alerts. If you're running a cross-border business with both US and India operations, this combination makes sense." } },
      { "@type": "Question", "name": "Does Insydz work for Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — this is one of Insydz's most significant advantages over Helium 10. Insydz provides competitor price tracking, keyword rank monitoring, review analysis, and inventory management for Flipkart sellers. Helium 10 has no Flipkart support. If Flipkart is part of your business, Insydz is the only option between these two tools." } },
      { "@type": "Question", "name": "What is the best Helium 10 alternative for India?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz is the most purpose-built Helium 10 alternative for Indian sellers. Built specifically for Amazon India, Flipkart — with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. Other tools like SellerApp cover some Amazon India use cases but none combine Flipkart support, WhatsApp delivery, and multilingual review analysis at INR pricing." } },
      { "@type": "Question", "name": "Is there a free plan for Insydz?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz has a permanent free plan — not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Helium 10 offers a 30-day free trial with limited features, after which you must upgrade to continue." } },
      { "@type": "Question", "name": "Does Insydz support Amazon and Flipkart sellers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports Amazon India, Flipkart from a unified dashboard. For sellers operating across all three Indian marketplaces, Insydz is the only tool in this comparison that covers your full business." } }
    ]
  }
];

// Navigation types and data - same structure as other pages
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
    { name: "Our Vision", icon: <Presentation className="w-4 h-4" />, route: "/about/our-vision" },
    { name: "Careers", icon: <Globe className="w-4 h-4" />, route: "/about/careers" },
    { name: "Contact Us", icon: <Users className="w-4 h-4" />, route: "/about/contact-us" },
  ],
};

export default function InsydzVsHeliumPage() {
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
    const id = `insydz-helium-schema-${i}`;
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
  return () => {
    SCHEMAS.forEach((_, i) => {
      const el = document.getElementById(`insydz-helium-schema-${i}`);
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

  // Page data — updated from SEO content doc
  const comparisonFeatures = [
    { area: 'Marketplace Coverage', insydz: 'Amazon India + Flipkart', helium: 'Amazon.com only — no Amazon.in, no Flipkart', insydzIcon: <Globe className="w-5 h-5 text-green-600" />, heliumIcon: <Package className="w-5 h-5 text-gray-500" /> },
    { area: 'Pricing', insydz: '₹0 / ₹1,999 / ₹2,999/month', helium: '$39–$99/month (~₹3,300–₹8,300)', insydzIcon: <IndianRupee className="w-5 h-5 text-green-600" />, heliumIcon: <DollarSign className="w-5 h-5 text-gray-500" /> },
    { area: 'Free Plan', insydz: 'Free forever — 25 products, no credit card', helium: '30-day trial only. Credit card required.', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Alert Channel', insydz: 'WhatsApp + Dashboard', helium: 'Email + Dashboard only', insydzIcon: <Smartphone className="w-5 h-5 text-green-600" />, heliumIcon: <Mail className="w-5 h-5 text-gray-500" /> },
    { area: 'Language Support', insydz: 'Hindi + Hinglish + English review analysis', helium: 'English only', insydzIcon: <Users className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Keyword Research', insydz: 'Amazon.in + Flipkart data in Indian volumes', helium: 'Amazon.com keyword data — not calibrated for India', insydzIcon: <Search className="w-5 h-5 text-green-600" />, heliumIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Competitor Price Tracking', insydz: 'Real-time, WhatsApp alert, AI reprice in INR', helium: 'Available for Amazon.com — not Amazon.in or Flipkart', insydzIcon: <TrendingDown className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Review Analysis', insydz: 'AI complaint + praise clustering in Hindi & English', helium: 'English only', insydzIcon: <MessageCircle className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Festive Demand Intelligence', insydz: 'Diwali, Big Billion Days, Republic Day forecasting', helium: 'Not available — built for US market', insydzIcon: <Flame className="w-5 h-5 text-green-600" />, heliumIcon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
    { area: 'Ease of Use', insydz: 'Action-driven — every alert includes next step', helium: 'Feature-rich but requires learning curve', insydzIcon: <Zap className="w-5 h-5 text-green-600" />, heliumIcon: <BarChart3 className="w-5 h-5 text-gray-500" /> },
    { area: 'Customer Support', insydz: 'Hindi + English support', helium: 'English only', insydzIcon: <CheckCircle2 className="w-5 h-5 text-green-600" />, heliumIcon: <Globe className="w-5 h-5 text-gray-500" /> },
    { area: 'Amazon PPC Management', insydz: 'Not available (focus is organic intelligence)', helium: 'Adtomic — advanced PPC management', insydzIcon: <AlertCircle className="w-5 h-5 text-gray-400" />, heliumIcon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Is Insydz a replacement for Helium 10 for Indian sellers?',
      answer: 'For Indian sellers whose primary market is Amazon India, Flipkart yes, Insydz is a direct replacement and covers ground Helium 10 cannot: Flipkart data, WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. If you also sell on Amazon.com and need deep US-market PPC tools, you may want to keep Helium 10 specifically for that use case.'
    },
    {
      id: 'faq-2',
      question: 'Why is Insydz cheaper than Helium 10?',
      answer: 'Insydz is priced in INR for Indian sellers starting at ₹1,999/month vs Helium 10\'s $39/month (~₹3,300). But the cost difference isn\'t just currency. Insydz is focused on five high-value use cases for Indian marketplace sellers rather than 20+ tools for a global audience. That focus means a product you can use from day one, without a learning curve.'
    },
    {
      id: 'faq-3',
      question: 'Can I use Insydz and Helium 10 together?',
      answer: 'Yes. And some large sellers do exactly this. They use Helium 10 for Amazon.com PPC management and US-market research, and Insydz for Indian marketplace intelligence, Flipkart tracking, and WhatsApp alerts. If you\'re running a cross-border business with both US and India operations, this combination makes sense.'
    },
    {
      id: 'faq-4',
      question: 'Does Insydz work for Flipkart sellers?',
      answer: 'Yes. This is one of Insydz\'s most significant advantages over Helium 10. Insydz provides competitor price tracking, keyword rank monitoring, review analysis, and inventory management for Flipkart sellers. Helium 10 has no Flipkart support. If Flipkart is part of your business, Insydz is the only option between these two tools.'
    },
    {
      id: 'faq-5',
      question: 'What is the best Helium 10 alternative for India?',
      answer: 'Insydz is the most purpose-built Helium 10 alternative for Indian sellers. Built specifically for Amazon India, Flipkart with WhatsApp alerts, Hindi review analysis, INR pricing, and Indian festive demand intelligence. Other tools like SellerApp cover some Amazon India use cases but none combine Flipkart support, WhatsApp delivery, and multilingual review analysis at INR pricing.'
    },
    {
      id: 'faq-6',
      question: 'Is there a free plan for Insydz?',
      answer: 'Yes. Insydz has a permanent free plan not a trial. It covers up to 25 products with competitor price monitoring, keyword rank tracking, review analysis, and inventory alerts. No credit card required, no expiry. Helium 10 offers a 30-day free trial with limited features, after which you must upgrade to continue.'
    },
    {
      id: 'faq-7',
      question: 'Does Insydz support Amazon and Flipkart sellers?',
      answer: 'Yes. Insydz supports Amazon India, Flipkart from a unified dashboard. For sellers operating across all three Indian marketplaces, Insydz is the only tool in this comparison that covers your full business.'
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
            <span className="text-sm font-medium text-blue-700">Built for Indian Sellers 🇮🇳</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6">
            Insydz vs Helium 10
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Which Tool Fits Indian Sellers Better?</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
            Both tools help sellers grow on Amazon. The difference is who they're built for. Compare pricing, marketplace coverage, alerts, and language support then decide for yourself.
          </p>

          {/* Verdict Strip */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 mb-10 max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium pb-3 pr-6">Metric</th>
                  <th className="text-center text-blue-400 font-bold pb-3 pr-6">Insydz</th>
                  <th className="text-center text-gray-400 font-medium pb-3">Helium 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { label: 'Starting Price', insydz: '₹0 / month', helium: '~₹3,300+/month ($39)' },
                  { label: 'Flipkart Support', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'WhatsApp Alerts', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'Hindi Review Analysis', insydz: '✅ Yes', helium: '✗ No' },
                  { label: 'Free Plan (Permanent)', insydz: '✅ Yes', helium: '✗ 30-day trial only' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-gray-400 py-2.5 pr-6 text-left">{row.label}</td>
                    <td className="text-green-400 font-semibold py-2.5 pr-6 text-center">{row.insydz}</td>
                    <td className="text-gray-500 py-2.5 text-center">{row.helium}</td>
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

      {/* Why Indian Sellers Struggle with Helium 10 */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Why Indian Sellers Struggle with Helium 10
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Helium 10 is a powerful tool built for Amazon.com sellers in the US. Most Indian sellers who try it hit the same four walls within the first month.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                title: 'The price feels like a fine, not a plan',
                desc: "Helium 10's paid plans start at $39/month roughly ₹3,300 at current exchange rates. That's more than many Indian sellers spend on all their SaaS tools combined. And the free plan is a 30-day trial, not a real option for new sellers who need time to validate before committing.",
                color: 'from-red-500 to-orange-500',
              },
              {
                number: '02',
                title: 'No Flipkart. Full stop.',
                desc: "Helium 10 tracks Amazon.com. It has no data for Flipkart two marketplaces where millions of Indian sellers run a significant portion of their business. If you sell on Flipkart and pay for Helium 10, you're paying for half your coverage.",
                color: 'from-orange-500 to-yellow-500',
              },
              {
                number: '03',
                title: 'Email alerts nobody checks',
                desc: "Helium 10 sends alerts by email. Indian sellers don't run their businesses out of their inbox they run them from WhatsApp. By the time you check an email about a competitor price drop, the Buy Box is already gone.",
                color: 'from-yellow-500 to-green-500',
              },
              {
                number: '04',
                title: 'Amazon.com data in an Amazon.in world',
                desc: "Helium 10's keyword and demand data is calibrated for US consumer behaviour. Indian festive demand spikes Diwali, Big Billion Days, Republic Day sales are invisible to it. Demand estimates, keyword volumes, and revenue projections are built for a market 10,000 km away.",
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
              <strong>A fair note:</strong> Helium 10 is an excellent product for Amazon.com sellers. If your primary business is selling on Amazon USA, it's a serious tool worth considering. This comparison is specifically for Indian sellers who sell on Amazon India, Flipkart.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Insydz vs Helium 10 Full Feature Breakdown
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            A direct comparison across every dimension that matters for Indian marketplace sellers including areas where Helium 10 has the edge.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <th className="px-6 py-4 text-left text-white font-bold">Feature Area</th>
                  <th className="px-6 py-4 text-left text-white font-bold">🇮🇳 Insydz</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Helium 10</th>
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
                        {feature.heliumIcon}
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{feature.helium}</span>
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
            Insydz vs Helium 10 Pricing — The Gap Is Real
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            When you're building a business in rupees, paying in dollars creates a hidden tax that compounds every month.
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
                  { plan: 'Free Plan', price: '₹0/month forever', desc: '25 products, no credit card, no expiry date' },
                  { plan: 'Basic', price: '₹1,999/month', desc: 'Full competitor price tracking, keyword monitoring, review analysis' },
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
                  <span className="text-gray-700 dark:text-gray-300">All plans billed in INR. No USD billing, no exchange rate risk.</span>
                </li>
              </ul>
            </div>

            {/* Helium 10 Pricing */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🌐</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Helium 10 Pricing (India Reality)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { plan: 'Starter', price: '$39/month (~₹3,300)', desc: 'Limited features' },
                  { plan: 'Platinum', price: '$99/month (~₹8,300)', desc: 'Full feature access' },
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
                  '30-day trial only not a permanent free option',
                  'Billing in USD means your cost changes with the INR/USD exchange rate',
                  'Platinum-level features only work on Amazon.com not Amazon.in or Flipkart',
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
            <h3 className="text-2xl font-black mb-3">Real Cost Over 12 Months</h3>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              A seller on Helium 10 Platinum pays roughly <strong>₹99,600/year</strong>. The same seller on Insydz Premium pays <strong>₹35,988/year</strong> for a tool that covers Flipkart, sends WhatsApp alerts, and understands Hindi reviews.
            </p>
            <p className="text-white font-black text-3xl mt-4">That's ₹63,612 per year back into inventory.</p>
          </div>
        </div>
      </section>

      {/* Real Seller Scenario */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            What Most Tools Don't Tell You Real Seller, Real Numbers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            A specific, honest scenario the kind of situation that plays out every week for mid-size Indian sellers.
          </p>
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Arjun's Big Billion Days Problem Electronics Category, Amazon India
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { label: 'The situation', value: 'Selling Bluetooth earphones, ₹899 price point, 3.8★ rating, Page 1 for 3 key keywords' },
                    { label: 'What happened', value: 'Went out of stock 11 days before Big Billion Days. Ranking dropped from #7 → #38.' },
                    { label: 'Why it happened', value: 'His tool gave no festive demand warning. No WhatsApp alert. He checked the dashboard 3 days too late.' },
                    { label: 'The loss', value: '₹2.4L in missed Big Billion Days revenue. 6 weeks to recover Page 1 ranking.' },
                    { label: 'With Insydz (same scenario)', value: '14-day early WhatsApp alert. Reordered on time. Sold 650 units vs planned 400.', highlight: true },
                    { label: 'Incremental revenue captured', value: '₹5.2L incremental Big Billion Days revenue', highlight: true },
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
              The problem wasn't Arjun's product. The problem was that his tool wasn't watching Indian festive patterns and it didn't tell him fast enough, in a channel he actually checks.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Assessment */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            Where Each Tool Has a Clear Edge
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            We believe honest comparisons build more trust than one-sided sales pitches.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Insydz wins */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🇮🇳 Insydz is better if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell on Flipkart alongside Amazon India',
                  'Want alerts on WhatsApp, not email',
                  'Need pricing in INR with no currency risk',
                  'Have customers who write reviews in Hindi or Hinglish',
                  'Want festive demand forecasting (Diwali, BBD, Great Indian Festival)',
                  'Are a new or mid-size seller who needs value before volume',
                  'Want action-driven insights not just data to interpret',
                  'Are building a D2C brand on Indian marketplaces',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Helium 10 wins */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Helium 10 is better if you...</h3>
              <ul className="space-y-3">
                {[
                  'Sell primarily on Amazon.com (US marketplace)',
                  'Run advanced Amazon PPC campaigns and need Adtomic',
                  'Need deep listing optimization tools for the US market',
                  'Are already a large-scale Amazon US seller',
                  'Need the breadth of 20+ tools in a single platform',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gray-500 dark:text-gray-400 italic text-sm">
                If you're a purely Amazon US seller, Helium 10 remains a strong choice. But if India is your primary market, the tool you need was built here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Alerts */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white">
            The Alert Nobody Else Sends
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-14 max-w-3xl mx-auto">
            Email alerts require you to be at your desk, logged in, and checking. Indian sellers are on the road, at the warehouse, at a supplier meeting. Insydz sends alerts to where you already are.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: 'Price Alert',
                icon: <IndianRupee className="w-6 h-6" />,
                color: 'from-green-500 to-emerald-500',
                message: 'Competitor repriced your category. Their new price: ₹749 (was ₹849). Your price: ₹799. Suggested response: ₹769 — stays above your ₹720 margin floor.',
              },
              {
                type: 'Stockout Warning',
                icon: <Package className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
                message: '14 days of stock remaining for Wireless Earbuds (Black). Big Billion Days starts in 12 days. Recommended reorder: 420 units. Supplier lead time: 8 days.',
              },
              {
                type: 'Ranking Alert',
                icon: <TrendingDown className="w-6 h-6" />,
                color: 'from-red-500 to-rose-500',
                message: '"bluetooth earphones under 1000" dropped from #4 → #11. Competitor listing updated title 3 days ago. Suggested fix: add "under 1000" to your listing title.',
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
            FAQs Insydz vs Helium 10
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
          <h2 className="text-4xl font-black mb-4 text-white">
            Compare Clearly. Choose What Fits.
          </h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
            Start with the free plan no credit card, no 30-day expiry. See Insydz vs Helium 10 on your own products, with your own data, before spending a rupee.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icp: 'New Seller', headline: 'Just getting started on Amazon or Flipkart', cta: 'Start Free →', action: () => router.push('/signup') },
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
 

