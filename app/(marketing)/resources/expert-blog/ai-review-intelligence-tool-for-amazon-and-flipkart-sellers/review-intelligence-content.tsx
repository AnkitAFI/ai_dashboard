"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  MessageCircle,
  Package,
  Trophy,
  Zap,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ShoppingBag,
  Store,
  Briefcase,
  Users,
  Bell,
  Code,
  Globe,
  ArrowLeft,
  Flame,
  Presentation,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogImageSection from "../components/BlogImageSection";

export const dynamic = "force-static";

const schemaBlogReviewAI = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: {
        "@type": "ImageObject",
        url: "https://insydz.com/logo.png",
      },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
      description:
        "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers.",
    },
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
      url: "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
      name: "AI Review Intelligence Tool for Amazon & Flipkart Sellers",
      description:
        "Learn how AI tools analyze customer reviews and improve ecommerce performance.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      about: {
        "@id": "https://insydz.com/#organization",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: "https://insydz.com/resources",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Expert Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "AI Review Intelligence Tool",
          item: "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#article",
      headline: "AI Review Intelligence Tool for Amazon & Flipkart Sellers",
      description:
        "AI tools analyze customer reviews to identify sentiment, patterns, and improve conversions.",
      image: "https://insydz.com/assets/images/blog/ai-review-intelligence.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2025-01-01",
      dateModified: "2025-01-01",
      mainEntityOfPage: {
        "@id":
          "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
      },
      keywords: [
        "AI review intelligence tool",
        "Amazon review analysis",
        "Flipkart review analytics",
        "sentiment analysis ecommerce",
      ],
      articleSection: "Ecommerce Analytics",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id":
        "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#tool",
      name: "AI Review Intelligence Tool",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI tool that analyzes ecommerce reviews to detect sentiment and insights.",
      url: "https://insydz.com",
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      featureList: [
        "Review sentiment analysis",
        "Detect complaints and patterns",
        "Competitor review insights",
        "Product improvement insights",
        "Regional language analysis",
      ],
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is an AI review intelligence tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It analyzes customer reviews to extract sentiment and insights.",
          },
        },
        {
          "@type": "Question",
          name: "How does AI analyze reviews?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI processes large datasets to detect sentiment and patterns automatically.",
          },
        },
        {
          "@type": "Question",
          name: "Why is review analysis important?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It helps improve products, listings, and conversions.",
          },
        },
        {
          "@type": "Question",
          name: "Can AI detect patterns in reviews?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, it identifies recurring complaints and trends quickly.",
          },
        },
        {
          "@type": "Question",
          name: "Is it useful for competitor research?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, it reveals gaps and opportunities from competitor reviews.",
          },
        },
      ],
    },
  ],
};

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
    {
      name: "All Solutions (Overview)",
      icon: <ShoppingBag className="w-4 h-4" />,
      route: "/solutions",
    },
    {
      name: "For Amazon Sellers (India)",
      icon: <ShoppingBag className="w-4 h-4" />,
      route: "/solutions/amazon-sellers",
    },
    {
      name: "For Flipkart Sellers",
      icon: <Store className="w-4 h-4" />,
      route: "/solutions/flipkart-sellers",
    },
    {
      name: "For E-commerce Agencies",
      icon: <Briefcase className="w-4 h-4" />,
      route: "/solutions/ecommerce-agencies",
    },
    {
      name: "For Brand Managers",
      icon: <Users className="w-4 h-4" />,
      route: "/solutions/brand-managers",
    },
  ],
  "Use Cases": [
    {
      name: "All Use Cases",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/use-cases",
    },
    {
      name: "Track Competitor Prices",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/use-cases/track-competitor-prices",
    },
    {
      name: "Find Profitable Products",
      icon: <Target className="w-4 h-4" />,
      route: "/use-cases/find-profitable-products",
    },
    {
      name: "Analyze Customer Reviews",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/use-cases/analyze-customer-reviews",
    },
    {
      name: "Improve Amazon & Flipkart SEO",
      icon: <Search className="w-4 h-4" />,
      route: "/use-cases/improve-seo",
    },
    {
      name: "Avoid Stockouts & Missed Sales",
      icon: <Package className="w-4 h-4" />,
      route: "/use-cases/avoid-stockouts",
    },
  ],
  Features: [
    {
      name: "All Features",
      icon: <LayoutGrid className="w-4 h-4" />,
      route: "/features",
    },
    {
      name: "Competitor Price Tracking",
      icon: <DollarSign className="w-4 h-4" />,
      route: "/features/competitor-price-tracking-feature",
    },
    {
      name: "Review Analytics",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/features/review-analytics-feature",
    },
    {
      name: "Price Optimization",
      icon: <TrendingUp className="w-4 h-4" />,
      route: "/features/price-optimization-feature",
    },
    {
      name: "Keyword & Rank Tracking",
      icon: <Search className="w-4 h-4" />,
      route: "/features/keyword-rank-tracking-feature",
    },
    {
      name: "Product Research",
      icon: <Package className="w-4 h-4" />,
      route: "/features/product-research-feature",
    },
    {
      name: "AI Recommendations",
      icon: <Zap className="w-4 h-4" />,
      route: "/features/ai-recommendations-feature",
    },
    {
      name: "WhatsApp Alerts",
      icon: <Bell className="w-4 h-4" />,
      badge: "NEW",
      route: "/features/whatsapp-alerts-feature",
    },
    {
      name: "Festive Trend Intelligence",
      icon: <Flame className="w-4 h-4" />,
      badge: "UPCOMING",
      route: "/features/festive-trend-feature",
    },
  ],
  "Free Tools": [
    {
      name: "Free Amazon Product Analyzer",
      icon: <BarChart3 className="w-4 h-4" />,
      route: "/free-tools/free-amazon-product-analyzer",
    },
    {
      name: "Free Review Sentiment Checker",
      icon: <MessageCircle className="w-4 h-4" />,
      route: "/free-tools/free-review-sentiment-checker",
    },
    {
      name: "Free Competitor Price Checker",
      icon: <DollarSign className="w-4 h-4" />,
      route: "/free-tools/free-competitor-price-checker",
    },
    {
      name: "Free Keyword Rank Checker",
      icon: <Search className="w-4 h-4" />,
      badge: "NEW",
      route: "/free-tools/free-keyword-rank-checker",
    },
  ],
  Resources: [
    {
      name: "Expert Blog",
      icon: <BookOpen className="w-4 h-4" />,
      route: "/resources/expert-blog",
    },
  ],
  Integrations: [
    { name: "Amazon", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Flipkart", icon: <Store className="w-4 h-4" /> },
    { name: "Shopify", icon: <Globe className="w-4 h-4" /> },
    { name: "API Documentation", icon: <Code className="w-4 h-4" /> },
  ],
  Compare: [
    {
      name: "Insydz vs Helium 10",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvshelium",
    },
    {
      name: "Insydz vs Jungle Scout",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvsjunglescout",
    },
    {
      name: "Insydz vs Viral Launch",
      icon: <Trophy className="w-4 h-4" />,
      route: "/compare/insydzvsvirallaunch",
    },
  ],
  About: [
    {
      name: "Our Vision",
      icon: <Presentation className="w-4 h-4" />,
      route: "/about/our-vision",
    },
    {
      name: "Careers",
      icon: <Globe className="w-4 h-4" />,
      route: "/about/careers",
    },
    {
      name: "Contact Us",
      icon: <Users className="w-4 h-4" />,
      route: "/about/contact-us",
    },
  ],
};

const TOC = [
  { id: "intro", label: "Why Review Intelligence Matters" },
  { id: "hinglish", label: "India-Specific Review Analysis" },
  { id: "competitor", label: "Competitor Review Mining" },
  { id: "how-it-works", label: "How the Tool Works" },
  { id: "signals", label: "7 Core Review Signals" },
  { id: "comparison", label: "Manual vs Tool vs AI Comparison" },
  { id: "mistakes", label: "5 Mistakes Sellers Make" },
  { id: "workflow", label: "Weekly Execution Model" },
  { id: "best-tools", label: "Best Tools for India 2026" },
  { id: "faq", label: "Frequently Asked Questions" },
];

const FAQS = [
  {
    q: "What is an Amazon review analysis tool and why do Indian sellers need one?",
    a: "An Amazon review analysis tool automatically reads and classifies customer reviews on your Amazon.in and Flipkart listings — and your competitors' listings — to surface patterns, sentiment signals, and product intelligence you couldn't extract manually. Indian sellers need one because: (a) the volume of reviews across 10 to 20 SKUs makes manual reading impractical; (b) patterns only become visible at scale — you can't spot that 22% of your negative reviews share a root cause by reading 5 reviews a week; and (c) global tools don't process the Hindi and Hinglish reviews that make up a significant share of Indian marketplace feedback.",
  },
  {
    q: "How is review sentiment analysis different from just reading the star rating?",
    a: "Star ratings tell you an aggregate satisfaction score. Sentiment analysis tells you why. A product at 4.1 stars with 25% of negative reviews mentioning a single fixable defect has a very different problem than a product at 4.1 stars with complaints spread across 10 unrelated issues. Sentiment analysis identifies specific complaint clusters, their share of negative reviews, and whether they're growing or shrinking — giving sellers an actionable fix, not just a score. For Indian sellers, India-calibrated sentiment analysis also detects negative and positive signals in Hindi and Hinglish.",
  },
  {
    q: "Can I analyse competitor reviews — not just my own?",
    a: "Yes — and this is where the highest-value intelligence typically lives. AI review analysis tools allow you to add competitor ASINs and Flipkart listings to your tracking dashboard. The tool processes their reviews the same way it processes yours, surfacing complaint clusters, positive themes, and feature gaps from their customer base. For Indian sellers in competitive categories, competitor review mining consistently surfaces the 2 to 3 product improvements or positioning angles that would have the highest impact on conversion.",
  },
  {
    q: "How long does it take to see results from acting on review intelligence?",
    a: "It depends on the type of action. Listing copy changes based on review vocabulary typically show measurable CTR and CVR improvement within 3 to 5 weeks. Product defect fixes, escalated to suppliers and reflected in new inventory, take 4 to 10 weeks to flow through to improved ratings. Competitor positioning counter-messaging in listings shows conversion lift within 2 to 4 weeks in most categories.",
  },
  {
    q: "Does review analysis work for Flipkart, or just Amazon?",
    a: "Most global review tools cover Amazon exclusively — and even then, their primary data quality is for Amazon.com rather than Amazon.in. India-first platforms like Insydz cover Amazon.in, Flipkart simultaneously. This matters because complaint patterns differ meaningfully across platforms: Flipkart buyers tend to focus on delivery and packaging issues; Amazon.in buyers engage more with product functionality and specification accuracy; buyers frequently flag value-for-money concerns.",
  },
  {
    q: "Is there a free option for review analysis for Indian sellers?",
    a: "Basic manual analysis is always possible — reading your top 20 negative reviews and your competitors' top 20 negative reviews gives a rough directional signal without any tool cost. For systematic, automated review intelligence, Insydz offers a forever-free plan that includes entry-level review sentiment tracking across Amazon.in and Flipkart. The Starter plan at ₹1,999/month covers full review analytics for sellers managing 5 to 10 SKUs — the most accessible entry point for Indian D2C sellers who want structured review intelligence without a significant tool budget.",
  },
];

function ArticleImg({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ margin: "24px 0 0" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f1f5f9",
          minHeight: 200,
        }}
      >
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
              backgroundSize: "200% 100%",
              animation: "imgShimmer 1.5s infinite",
            }}
          />
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity .3s",
          }}
        />
      </div>
      <p className="art-img-cap">{caption}</p>
    </div>
  );
}

const SCHEMAS = [schemaBlogReviewAI];

export default function AmazonReviewAnalysisToolIndia() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("intro");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    SCHEMAS.forEach((schema, i) => {
      const id = `insydz-blog6-schema-${i}`;

      if (document.getElementById(id)) return;

      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);

      document.head.appendChild(script);
    });

    return () => {
      SCHEMAS.forEach((_, i) => {
        document.getElementById(`insydz-blog6-schema-${i}`)?.remove();
      });
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };
  const handleMenuItemClick = (item: MenuItemWithBadge) => {
    if (item.route) {
      router.push(item.route);
      setActiveDropdown(null);
      setIsMenuOpen(false);
    }
  };
  const toggleMobileMenu = (name: string) =>
    setMobileActiveMenu((p) => (p === name ? null : name));

  const DesktopDropdown = ({
    label,
    menuKey,
    accent = "purple",
  }: {
    label: string;
    menuKey: keyof NavigationMenu;
    accent?: "purple" | "orange";
  }) => {
    const items = navigationMenu[menuKey];
    const isActive = activeDropdown === label;
    const ac = accent === "orange";
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setActiveDropdown(label)}
          className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${isActive ? (ac ? "text-orange-600 font-semibold" : "text-purple-600 font-semibold") : ac ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50" : "text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
        >
          {label}
          <ChevronDown
            className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
          />
        </button>
        {isActive && (
          <div
            onMouseLeave={() => setActiveDropdown(null)}
            className="absolute top-full left-0 mt-2 w-64 xl:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 group ${ac ? "hover:bg-orange-50" : "hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
              >
                <span
                  className={`flex-shrink-0 ${ac ? "text-orange-600" : "text-purple-600 dark:text-purple-400"}`}
                >
                  {item.icon}
                </span>
                <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const reviewSignals = [
    {
      signal: "Durability Complaints",
      detect: "Products flagged as breaking, malfunctioning, or failing early",
      action:
        "Source stronger materials; update listing to address objection proactively",
      impact: "Reduces return rate 8–15%",
    },
    {
      signal: "Size / Fit Inaccuracy",
      detect: "'Smaller than expected', 'not as described', 'sizing wrong'",
      action:
        "Update size chart; add dimensions callout image; revise bullet points",
      impact: "Cuts negative reviews 20–30%",
    },
    {
      signal: "Packaging Damage",
      detect:
        "Reviews mentioning damaged on arrival, poor packing, crushed box",
      action: "Flag to logistics team; upgrade packaging materials",
      impact: "Protects 4-star average",
    },
    {
      signal: "Missing Feature Mentions",
      detect: "Buyers asking for a feature a competitor offers",
      action:
        "Product roadmap input; or highlight existing feature they missed in listing copy",
      impact: "Conversion rate uplift 5–12%",
    },
    {
      signal: "Competitor Pain Points",
      detect: "Your rival's reviews: what their customers hate most",
      action:
        "Your counter-messaging in listing; or source a better version of that product",
      impact: "Category market share gain",
    },
    {
      signal: "Positive Theme Clusters",
      detect: "What buyers love most — in their exact words",
      action: "Mirror that language in title, bullets, A+ content",
      impact: "CTR and CVR improvement",
    },
    {
      signal: "Review Velocity Drops",
      detect: "Sudden slowdown in new review rate",
      action:
        "Trigger review request campaign; check if reviews are being suppressed",
      impact: "Maintains ranking momentum",
    },
  ];

  const compRows = [
    {
      cap: "Amazon.in Review Data",
      manual: "Manual only",
      global: "Limited India data",
      insydz: "Native Amazon.in",
    },
    {
      cap: "Flipkart Review Analysis",
      manual: "Manual only",
      global: "Not supported",
      insydz: "Full coverage",
    },
    {
      cap: "Sentiment Scoring",
      manual: "No — subjective",
      global: "English only",
      insydz: "Hindi + Hinglish + English",
    },
    {
      cap: "Competitor Review Mining",
      manual: "1–2 hrs/product",
      global: "Amazon.com focused",
      insydz: "Automated, all 3 platforms",
    },
    {
      cap: "Feature Gap Detection",
      manual: "No systematic method",
      global: "Basic topic clusters",
      insydz: "AI-tagged issue categories",
    },
    {
      cap: "Negative Feedback Alerts",
      manual: "Not available",
      global: "Email only",
      insydz: "WhatsApp within 60 min",
    },
    {
      cap: "Recurring Complaint Trends",
      manual: "Manual reading only",
      global: "Limited",
      insydz: "Weekly digest, auto-flagged",
    },
    {
      cap: "Listing Copy Suggestions",
      manual: "Not available",
      global: "Not available",
      insydz: "Bullet rewrites from reviews",
    },
    {
      cap: "Review Velocity Tracking",
      manual: "Not available",
      global: "Amazon.com only",
      insydz: "Daily, WhatsApp alerts",
    },
    {
      cap: "Language of Insights",
      manual: "Your language only",
      global: "English only",
      insydz: "Hindi / English / Hinglish",
    },
    {
      cap: "Pricing",
      manual: "Your time (4–6 hrs/wk)",
      global: "₹3,300–8,300/month",
      insydz: "₹1,999–2,999/mo (free tier)",
    },
  ];

  const toolRows = [
    {
      tool: "Manual Excel",
      review: "None",
      platforms: "Any (manual)",
      hinglish: "No",
      wa: "No",
      price: "Free (your time)",
    },
    {
      tool: "Helium 10 (Review Insights)",
      review: "Amazon.com only",
      platforms: "Amazon only",
      hinglish: "No",
      wa: "No",
      price: "₹3,300–8,300",
    },
    {
      tool: "Jungle Scout",
      review: "Limited",
      platforms: "Amazon only",
      hinglish: "No",
      wa: "No",
      price: "₹3,800–8,000",
    },
    {
      tool: "Trustpilot / Bazaarvoice",
      review: "Website reviews",
      platforms: "Not marketplace-native",
      hinglish: "No",
      wa: "No",
      price: "₹8,000–25,000",
    },
    {
      tool: "Insydz",
      review: "AI-powered",
      platforms: "Amazon.in + Flipkart",
      hinglish: "Yes",
      wa: "Yes",
      price: "₹1,999–2,999",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        @keyframes imgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Read progress bar ── */
        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#db2777,#7c3aed);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

       .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        @media(min-width:1024px){.toc-sidebar{top:80px;padding:22px}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}

        /* ── Mobile TOC toggle ── */
        .mobile-toc-btn{display:flex;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:14px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(min-width:768px){.mobile-toc-btn{display:none}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:20px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}

        /* ── Article body typography ── */
        .article-body{font-family:'Lora',serif;font-size:15px;line-height:1.78;color:#1E293B}
        @media(min-width:640px){.article-body{font-size:15.5px}}
        @media(min-width:1024px){.article-body{font-size:16px}}
        .dark .article-body{color:#d1d5db}

        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0D1B2A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #e5e7eb;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px;scroll-margin-top:80px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px;scroll-margin-top:84px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}

        .article-body h3{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0D1B2A;margin:24px 0 8px;letter-spacing:-.2px;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h3{font-size:16px;margin:28px 0 10px}}
        @media(min-width:1024px){.article-body h3{font-size:17px;margin:32px 0 10px;scroll-margin-top:84px}}
        .dark .article-body h3{color:#f3f4f6}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body ul,ol{margin:4px 0 16px 18px}
        @media(min-width:640px){.article-body ul,ol{margin:4px 0 18px 22px}}
        .article-body li{font-size:14px;line-height:1.72;margin-bottom:7px}
        @media(min-width:640px){.article-body li{font-size:15px;margin-bottom:8px}}
        .article-body li::marker{color:#F97316}
        .article-body strong{font-weight:700;color:#0D1B2A}
        .dark .article-body strong{color:#f9fafb}

        .art-img-cap{font-size:11px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:24px;padding:6px 10px}
        @media(min-width:640px){.art-img-cap{font-size:12px;margin-bottom:28px;padding:8px 12px}}

        /* ── Callout boxes ── */
        .box{border-radius:10px;padding:16px 18px;margin:18px 0}
        @media(min-width:640px){.box{padding:20px 22px;margin:24px 0}}
        .box-label{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.box-label{font-size:11px}}
        .box p{margin:0;font-size:13.5px;line-height:1.72;font-family:'Lora',serif}
        @media(min-width:640px){.box p{font-size:14.5px}}
        .box p+p{margin-top:10px}
        .box-teal{background:#F0FDFA;border-left:4px solid #0D9488}
        .box-teal .box-label{color:#0D9488}
        .box-amber{background:#FFFBEB;border-left:4px solid #D97706}
        .box-amber .box-label{color:#D97706}
        .box-green{background:#F0FDF4;border-left:4px solid #16A34A}
        .box-green .box-label{color:#16A34A}
        .box-pink{background:#FDF2F8;border-left:4px solid #DB2777}
        .box-pink .box-label{color:#DB2777}
        .box-indigo{background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px}
        .box-indigo .box-label{color:#4F46E5}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-pink{background:#500724;border-color:#9d174d}
        .dark .box-indigo{background:#1e1b4b;border-color:#3730a3}

        /* ── Steps ── */
        .steps{display:flex;flex-direction:column;gap:10px;margin:16px 0 22px}
        @media(min-width:640px){.steps{gap:12px;margin:20px 0 28px}}
        .step{display:flex;gap:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{background:#111827;border-color:#1f2937}
        .step-n{flex-shrink:0;width:30px;height:30px;background:#F97316;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-n{width:34px;height:34px;font-size:15px}}
        .step-body strong{display:block;font-size:13px;color:#0D1B2A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body strong{font-size:14.5px}}
        .dark .step-body strong{color:#f9fafb}
        .step-body p{margin:0;font-size:12.5px;color:#64748B;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body p{font-size:13.5px}}

        /* ── Tables ── */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:18px 0 24px}
        @media(min-width:640px){.tbl-wrap{margin:24px 0 32px}}
        table.dt{width:100%;border-collapse:collapse;font-size:11.5px;font-family:'Sora',sans-serif;min-width:480px}
        @media(min-width:640px){table.dt{font-size:13px;min-width:560px}}
        table.dt thead tr{background:#0D1B2A}
        table.dt th{padding:10px 12px;color:white;font-weight:700;text-align:left;font-size:10.5px;letter-spacing:.2px;white-space:nowrap}
        @media(min-width:640px){table.dt th{padding:13px 16px;font-size:12px}}
        table.dt tbody tr{border-bottom:1px solid #E2E8F0;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F8FAFC}
        table.dt tbody tr:hover td{background:#FFF7ED}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}
        table.dt tr.hl td{background:#FFF7ED!important;border-left:3px solid #F97316}
        table.dt tr.hl td:first-child{font-weight:700;color:#F97316}
        .bg{background:#DCFCE7;color:#15803D;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bg{padding:2px 8px;font-size:11.5px}}
        .br{background:#FEE2E2;color:#B91C1C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.br{padding:2px 8px;font-size:11.5px}}
        .bo{background:#FFF7ED;color:#C2410C;font-weight:700;padding:1px 6px;border-radius:20px;font-size:10.5px;display:inline-block}
        @media(min-width:640px){.bo{padding:2px 8px;font-size:11.5px}}

        /* ── Mistakes ── */
        .mistakes{display:flex;flex-direction:column;gap:8px;margin:16px 0 22px}
        @media(min-width:640px){.mistakes{gap:10px;margin:20px 0 28px}}
        .mistake{border:1px solid #E2E8F0;border-radius:10px;display:flex;overflow:hidden}
        .dark .mistake{border-color:#1f2937}
        .mistake-n{flex-shrink:0;width:38px;background:#0D1B2A;color:white;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-n{width:46px;font-size:17px}}
        .mistake-body{padding:12px 14px}
        @media(min-width:640px){.mistake-body{padding:16px 18px}}
        .mistake-body strong{display:block;font-size:13px;color:#0D1B2A;margin-bottom:4px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body strong{font-size:14.5px;margin-bottom:5px}}
        .dark .mistake-body strong{color:#f9fafb}
        .mistake-body p{margin:0;font-size:12px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mistake-body p{font-size:13.5px}}

        /* ── Mid CTA ── */
        .mid-cta{background:linear-gradient(135deg,#0D1B2A 0%,#1A2E42 100%);border-radius:10px;padding:20px 22px;margin:32px 0;display:flex;flex-direction:column;gap:16px}
        @media(min-width:640px){.mid-cta{padding:24px 28px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:40px 0;gap:20px}}
        @media(min-width:1024px){.mid-cta{padding:28px 32px}}
        .mid-cta h3{font-size:16px;font-weight:800;color:white;margin-bottom:5px;letter-spacing:-.2px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta h3{font-size:18px;margin-bottom:6px}}
        .mid-cta p{color:#94A3B8;font-size:12.5px;margin:0;font-family:'Sora',sans-serif}
        @media(min-width:640px){.mid-cta p{font-size:13.5px}}

        /* ── FAQ ── */
        .faq-item{border:1px solid #E2E8F0;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        @media(min-width:640px){.faq-item{margin-bottom:10px}}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#F97316}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0D1B2A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px;gap:12px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F8FAFC}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#FFEDD5;color:#F97316;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        @media(min-width:640px){.faq-icon{width:22px;height:22px;font-size:16px}}
        .faq-icon.open{transform:rotate(45deg);background:#F97316;color:white}
        .faq-a{padding:0 16px 14px;font-size:13px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        @media(min-width:640px){.faq-a{padding:0 20px 16px;font-size:14px}}
        .dark .faq-a{color:#9ca3af}

        /* ── Related grid ── */
        .related-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:480px){.related-grid{grid-template-columns:1fr 1fr;gap:14px}}
        @media(min-width:768px){.related-grid{grid-template-columns:repeat(3,1fr);gap:16px}}
        .rel-card{border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;aspect-ratio:2.4/1;overflow:hidden;background:#0A0F1A;display:flex;align-items:center;justify-content:center}
        .rel-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#F97316;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-tag{font-size:10.5px;margin-bottom:6px}}
        .rel-title{font-size:12px;font-weight:700;color:#0D1B2A;line-height:1.4;font-family:'Sora',sans-serif}
        @media(min-width:640px){.rel-title{font-size:13px}}
        .dark .rel-title{color:#f9fafb}

        /* ── TOC links ── */
        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#F97316;background:#FFF7ED;border-left-color:#F97316}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#431407;color:#fb923c}

        /* ── Stat strip ── */
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E2E8F0;text-align:center;border-bottom:1px solid #E2E8F0}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}
        @media(max-width:639px){.stat-item:nth-child(2){border-right:none}.stat-item:nth-child(3){border-right:1px solid #E2E8F0}.stat-item:nth-child(4){border-right:none;border-bottom:none}.stat-item:nth-child(3){border-bottom:none}}

        /* ── Takeaway box ── */
        .takeaway-box{background:#0D1B2A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        @media(min-width:640px){.takeaway-item{gap:10px;margin-bottom:10px}}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#F97316;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        /* ── Metrics grid ── */
        .metrics{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 22px}
        @media(min-width:480px){.metrics{grid-template-columns:1fr 1fr;gap:12px}}
        @media(min-width:640px){.metrics{gap:14px;margin:20px 0 28px}}
        .metric{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;display:flex;gap:10px;align-items:flex-start}
        @media(min-width:640px){.metric{padding:18px;gap:14px}}
        .dark .metric{background:#111827;border-color:#1f2937}
        .metric-icon{flex-shrink:0;width:32px;height:32px;border-radius:8px;background:#FFEDD5;display:flex;align-items:center;justify-content:center;font-size:16px}
        @media(min-width:640px){.metric-icon{width:38px;height:38px;border-radius:9px;font-size:18px}}
        .metric-t{font-size:12.5px;font-weight:700;color:#0D1B2A;margin-bottom:3px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-t{font-size:13.5px}}
        .dark .metric-t{color:#f9fafb}
        .metric-d{font-size:11.5px;color:#64748B;line-height:1.5;font-family:'Sora',sans-serif}
        @media(min-width:640px){.metric-d{font-size:12.5px}}

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }

        /* ── Verdict banner ── */
        .verdict-banner{background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:2px solid #FED7AA;border-radius:12px;padding:16px;margin:22px 0;display:flex;gap:12px;align-items:flex-start}
        @media(min-width:640px){.verdict-banner{padding:22px 24px;margin:28px 0;gap:16px}}
        .dark .verdict-banner{background:#431407;border-color:#78350f}

        /* ── Breadcrumb ── */
        .breadcrumb{background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:8px 0}
        @media(min-width:640px){.breadcrumb{padding:10px 0}}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* ── Hero header area ── */
        .article-hero{max-width:1240px;margin:0 auto;padding:28px 16px 0}
        @media(min-width:640px){.article-hero{padding:36px 20px 0}}
        @media(min-width:1024px){.article-hero{padding:48px 24px 0}}

        /* ── Sidebar CTA card text ── */
        .sidebar-cta-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:white;margin-bottom:8px;line-height:1.35}
        @media(min-width:1024px){.sidebar-cta-title{font-size:16px}}
        .sidebar-cta-body{font-size:11.5px;color:#94A3B8;margin-bottom:14px;line-height:1.6;font-family:'Sora',sans-serif}
        @media(min-width:1024px){.sidebar-cta-body{font-size:12.5px;margin-bottom:16px}}

        /* Prevent horizontal scroll globally */
        body{overflow-x:hidden}
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ═══ NAV ════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background opacity-100 dark:bg-gray-900/95 backdrop-blur-none shadow-lg" : "bg-background dark:bg-gray-900/80 backdrop-blur-none"}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-1 group cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Insydz Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3 object-contain"
                />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1 sm:ml-2">
                Insydz
              </span>
            </div>

            {/* Desktop Nav */}
            <div
              className="hidden lg:flex items-center space-x-0.5 xl:space-x-1"
              ref={dropdownRef}
            >
              <DesktopDropdown label="Solutions" menuKey="Solutions" />
              <DesktopDropdown label="Use Cases" menuKey="Use Cases" />
              <DesktopDropdown label="Features" menuKey="Features" />
              <button
                onClick={() => router.push("/pricing")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Pricing
              </button>
              <DesktopDropdown label="Free Tools" menuKey="Free Tools" />
              <DesktopDropdown label="Compare" menuKey="Compare" />
              <DesktopDropdown
                label="Resources"
                menuKey="Resources"
                accent="orange"
              />
              <DesktopDropdown label="About" menuKey="About" />
              <Button
                onClick={() => router.push("/login")}
                onMouseEnter={() => setActiveDropdown(null)}
                className="ml-1 text-xs xl:text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-4 xl:px-5 py-2 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Login
              </Button>
              <button
                className="ml-1 p-1.5 xl:p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-gray-800" />
                )}
              </button>
            </div>

            {/* Mobile right controls */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <button
                className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                )}
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
              <button
                onClick={() => {
                  router.push("/resources/expert-blog");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Back to Blog
              </button>
              {(
                [
                  ["Solutions", "Solutions", "purple"],
                  ["Use Cases", "Use Cases", "purple"],
                  ["Features", "Features", "purple"],
                  ["Free Tools", "Free Tools", "purple"],
                  ["Compare", "Compare", "purple"],
                  ["Resources", "Resources", "orange"],
                  ["About", "About", "purple"],
                ] as [string, keyof NavigationMenu, string][]
              ).map(([label, key, accent]) => (
                <div key={label}>
                  <button
                    onClick={() => toggleMobileMenu(label)}
                    className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 rounded-lg font-medium text-sm ${accent === "orange" ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}
                  >
                    {label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileActiveMenu === label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileActiveMenu === label && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-0.5">
                      {navigationMenu[key].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleMenuItemClick(item)}
                          className="flex items-center gap-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-left flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  router.push("/pricing");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg font-medium text-sm"
              >
                Pricing
              </button>
              <Button
                onClick={() => {
                  router.push("/login");
                  setIsMenuOpen(false);
                }}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-sm py-2"
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb" style={{ marginTop: 64 }}>
        <div className="breadcrumb-inner">
          <button
            onClick={() => router.push("/")}
            style={{
              color: "#64748B",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "inherit",
            }}
          >
            Home
          </button>
          <span>›</span>
          <button
            onClick={() => router.push("/resources/expert-blog")}
            style={{
              color: "#64748B",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "inherit",
            }}
          >
            Blog
          </button>
          <span>›</span>
          <span style={{ color: "#94A3B8" }}>
            Amazon Review Analysis Tool India
          </span>
        </div>
      </div>

      {/* HERO */}
      <div className="article-hero">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#F0FDF4",
            color: "#16A34A",
            fontSize: "clamp(10px,2vw,11.5px)",
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase" as const,
            padding: "4px 12px",
            borderRadius: 20,
            marginBottom: 14,
          }}
        >
          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Review Intelligence Pillar
        </div>
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "clamp(22px,4vw,40px)",
            fontWeight: 800,
            lineHeight: 1.18,
            color: "#0D1B2A",
            letterSpacing: "-.5px",
            maxWidth: 820,
          }}
          className="dark:text-white"
        >
          AI <span style={{ color: "#16A34A" }}>Review Intelligence Tool </span>{" "}
          for Amazon &amp; Flipkart Sellers: The Complete Guide (2026)
        </h1>
        <p
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "clamp(14px,2.5vw,17px)",
            color: "#475569",
            lineHeight: 1.75,
            maxWidth: 800,
            paddingTop: 10,
            marginBottom: 20,
          }}
          className="dark:text-gray-400"
        >
          Your customers are already telling you exactly what's broken and why
          they're switching to a competitor — inside every review. Learn how
          India's fastest-growing D2C brands use AI review analysis to cut
          returns, fix listings, and grow revenue.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: "4px 14px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "clamp(11px,2vw,13px)",
              color: "#64748B",
            }}
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <strong
              className="text-[#0D1B2A] hover:text-orange-500 transition-colors cursor-pointer"
              onClick={() => router.push("/author/vikrant-singh")}
            >
              Vikrant Singh
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "clamp(11px,2vw,13px)",
              color: "#64748B",
            }}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            January 2026
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "clamp(11px,2vw,13px)",
              color: "#64748B",
            }}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <strong>13 min read</strong>
          </div>
          <span
            style={{
              background: "#FFEDD5",
              color: "#F97316",
              fontSize: "clamp(9px,2vw,11px)",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
            }}
          >
            Updated for 2026
          </span>
          <span
            style={{
              background: "#F0FDF4",
              color: "#16A34A",
              fontSize: "clamp(9px,2vw,11px)",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
            }}
          >
            BOFU Guide
          </span>
        </div>

        <div className="stat-strip" style={{ marginBottom: 24 }}>
          {[
            ["500–2,000", "New Reviews/Month for a Mid-Sized 20-SKU Seller"],
            ["6–10 hrs", "Per Week Wasted Reading Reviews Manually"],
            ["44%", "Organic Sales Growth Driven by Review Intelligence"],
            ["₹1,999/mo", "Insydz Starter — Full Review Analytics"],
          ].map(([num, lbl]) => (
            <div className="stat-item" key={num}>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(20px,4vw,26px)",
                  fontWeight: 800,
                  color: "#16A34A",
                  fontFamily: "'Sora',sans-serif",
                  lineHeight: 1,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(10px,2vw,11.5px)",
                  color: "#64748B",
                  marginTop: 4,
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div
        style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }}
        className="sm:px-5 lg:px-6"
      >
        <BlogImageSection
          imageSrc="/AI Review Intelligence Tool.png"
          altText="AI review analysis tool for Amazon India and Flipkart sellers — sentiment dashboard"
          caption="Insydz AI review intelligence — automatically surfaces complaint clusters, competitor gaps, and listing opportunities across Amazon.in, Flipkart"
        />
      </div>

      {/* KEY TAKEAWAYS */}
      <div
        style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px 28px" }}
        className="sm:px-5 lg:px-6"
      >
        <div className="takeaway-box">
          <h3>✅ Key Takeaways</h3>
          {[
            "Reviews are your most underused intelligence asset. Every 1-star review is a paid customer telling you precisely what went wrong. Every competitor's 2-star review is a product opportunity waiting to be acted on.",
            "Sentiment analysis for Indian e-commerce requires Hinglish processing. A tool that only reads English reviews is missing a large share of what Indian buyers on Amazon.in and Flipkart are actually saying.",
            "Competitor review mining is the highest-ROI use of review analysis — and the most consistently overlooked. Your rivals' negative reviews tell you exactly what product improvements and positioning angles will resonate right now.",
            "Patterns beat individual reviews every time. Reacting to individual 1-star reviews is customer service. Detecting that 28% of your negative reviews share a single fixable root cause is product strategy.",
            "Review language is keyword data. The words buyers use in 5-star reviews are the exact phrases your next buyer will search for. Putting that vocabulary into your listing title and bullets improves CTR and CVR simultaneously.",
            "A 4.1-star average is not a health metric. Complaint cluster percentage and trend direction are the signals that predict whether your rating rises or falls over the next 90 days.",
            "WhatsApp delivery of review alerts converts to action significantly faster than email — for Indian SMB sellers who check WhatsApp 50+ times a day, the alert channel determines whether intelligence becomes action or history.",
          ].map((t) => (
            <div className="takeaway-item" key={t}>
              <div className="takeaway-dot">✓</div>
              <div className="takeaway-text">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* SIDEBAR — hidden on mobile, shown md+ */}
        <aside className="toc-sidebar">
          <h4
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: 1,
              color: "#94A3B8",
              marginBottom: 12,
            }}
          >
            Table of Contents
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {TOC.map((t) => (
              <li key={t.id}>
                <button
                  className={`toc-link${activeSection === t.id ? " active" : ""}`}
                  onClick={() => go(t.id)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          {/* Mobile TOC toggle */}
          <button
            className="mobile-toc-btn"
            onClick={() => setTocOpen(!tocOpen)}
          >
            📋 Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
            {TOC.map((t) => (
              <button
                key={t.id}
                className="toc-link"
                style={{ display: "block", marginBottom: 3 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            {/* In Simple Terms */}
            <div className="box box-indigo" style={{ margin: "0 0 28px" }}>
              <div className="box-label">In Simple Terms</div>
              <p>
                An Amazon review analysis tool reads every customer review on
                your listings and your competitors' listings — then tells you in
                plain language: what buyers consistently love, what they
                consistently complain about, which product features are causing
                returns, and what your rivals' customers wish was better. It
                turns 10,000 reviews you'd never have time to read into 5
                specific actions you can take this week.
              </p>
            </div>

            <h2 id="intro">
              Why Review Intelligence Matters More Than Ever for Indian Sellers
            </h2>
            <h3>Your Reviews Are Talking. Most Sellers Aren't Listening.</h3>
            <p>
              Amazon.in and Flipkart together process hundreds of millions of
              product reviews across categories from electronics to kirana
              goods. A mid-sized seller with 20 SKUs might accumulate{" "}
              <strong>500 to 2,000 new reviews per month</strong> across all
              listings. Reading them manually takes 6 to 10 hours a week.
              Pattern-detecting across them takes skills most sellers don't have
              and time most sellers can't spare.
            </p>
            <p>
              The result: most Indian sellers operate on a lagging,
              impressionistic understanding of what their customers think. They
              notice when a product drops to 3.8 stars. They don't notice that
              34% of their 2-star reviews in the past 30 days mention 'packaging
              damaged' — a supply chain fix that would cost ₹12 per unit to
              solve and recover 0.4 rating points over 90 days.
            </p>

            <h2 id="hinglish">
              Indian Buyers Review Differently — And That Requires
              India-Specific Analysis
            </h2>
            <p>
              Indian buyers write reviews in a mix of Hindi, English, and
              Hinglish — often in the same sentence. 'Product achha hai but
              quality thodi weak lagti hai' is a negative signal. A US-trained
              sentiment engine will either mistranslate it or simply not process
              it. An India-first review tool understands that 'bilkul bakwas'
              means the customer is furious and 'ekdum mast product hai' means
              they're delighted — and classifies accordingly.
            </p>
            <p>
              Beyond language, Indian buyers review specific concerns that
              global databases don't capture well: courier partner complaints
              common on Flipkart, festive gifting suitability, size accuracy for
              Indian body types in apparel, and compatibility with Indian
              electrical standards in electronics. Review intelligence built for
              India flags these patterns — global tools built for Amazon.com do
              not.
            </p>

            <h2 id="competitor">
              Competitor Review Mining: The Biggest Untapped Advantage
            </h2>
            <p>
              Most sellers track their own reviews. Almost none systematically
              mine competitor reviews for product and positioning intelligence.
              This is a significant missed opportunity — because your
              competitors' reviews are telling you exactly what problems exist
              in your category that no current product is solving well.
            </p>
            <p>
              A competitor with 800 reviews and a 3.9-star rating isn't your
              enemy. They're <strong>a free focus group</strong> that has
              already told 800 real buyers what's wrong with the current
              category standard. If 22% of those reviews mention 'cable too
              short' and your product has a longer cable, you have a positioning
              advantage sitting in plain sight — waiting for someone to put it
              in their listing title.
            </p>

            <div className="box box-amber">
              <div className="box-label">
                Real Seller: Hyderabad Kitchen Appliances Seller
              </div>
              <p>
                A Hyderabad-based seller of electric kettles was doing ₹3.8
                lakh/month on Amazon.in with a 4.1-star average. After running
                an AI review analysis on her top-selling ASIN and 3 closest
                competitors, three patterns emerged: (1) Her own reviews flagged
                'lid doesn't seal properly' in 19% of 1-star reviews. (2)
                Competitor A's reviews mentioned 'auto-shutoff doesn't work' in
                28% of negative reviews — she added 'reliable auto-shutoff with
                safety certification' to her listing title. (3) Competitor B's
                buyers repeatedly mentioned 'wish it had a temperature display'
                — she sourced a temperature-display variant and launched it as a
                new SKU.
              </p>
              <p>
                Within 12 weeks: her primary listing's rating recovered from 4.1
                to 4.5 stars. The 'auto-shutoff' positioning upgrade lifted
                conversion rate by 11%. The temperature-display variant became
                her highest-margin SKU within 60 days.{" "}
                <strong>
                  Total revenue moved from ₹3.8 lakh to ₹5.6 lakh/month.
                </strong>
              </p>
            </div>

            <div className="box box-indigo">
              <div className="box-label">AI Overview Summary</div>
              <p>
                AI review analysis tools for Amazon.in and Flipkart
                automatically process customer reviews to surface sentiment
                patterns, product defect signals, competitor weaknesses, and
                listing optimisation opportunities. For Indian D2C and growth
                sellers, tools built specifically for the Indian market process
                Hindi, Hinglish, and English reviews — delivering actionable
                intelligence in plain language via WhatsApp, not complex
                dashboards.
              </p>
            </div>

            <h2 id="how-it-works">How an AI Review Analysis Tool Works</h2>
            <p>
              Modern review intelligence tools have replaced the 'read and hope
              you notice a pattern' workflow with a five-step automated
              intelligence loop:
            </p>

            <BlogImageSection
              imageSrc="/twenty two.png"
              altText="Hinglish and Hindi review sentiment processing for Amazon India sellers"
              caption="India-first review intelligence processes Hindi, Hinglish, and English reviews — not just English translations"
            />

            <div className="steps">
              {[
                {
                  n: 1,
                  t: "Ingest & Language Detection",
                  d: "Reviews are pulled from Amazon.in, Flipkart listings — yours and your competitors'. Each review is language-detected and processed natively in Hindi, Hinglish, or English. No forced translation that loses meaning before analysis begins.",
                },
                {
                  n: 2,
                  t: "Sentiment Classification",
                  d: "Each review is scored positive, neutral, or negative — with sub-sentiment tags like 'delivery complaint', 'feature praise', 'value-for-money concern', and 'return intent'. The scoring model is calibrated for Indian marketplace language, not Western retail vocabulary.",
                },
                {
                  n: 3,
                  t: "Complaint Cluster Detection",
                  d: "Reviews are automatically sorted into issue clusters: Packaging, Durability, Value for Money, Size Accuracy, Delivery, Customer Service, Feature Request. You see exactly which cluster is driving your 1-star and 2-star reviews.",
                },
                {
                  n: 4,
                  t: "Trend & Velocity Scoring",
                  d: "The tool runs the same process on your top 3 to 5 competitors. You see their recurring complaint patterns — the exact pain points their customers are experiencing. This is where product opportunity lives.",
                },
                {
                  n: 5,
                  t: "Actionable Recommendations",
                  d: "New negative reviews — yours or a competitor's — are flagged via WhatsApp within 60 minutes. Weekly digest: top 3 sentiment shifts across all tracked products, with specific action recommendations.",
                },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <div className="step-body">
                    <strong>{s.t}</strong>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-green">
              <div className="box-label">Reading vs Analysing</div>
              <p>
                Reading reviews tells you what one buyer said. AI analysis tells
                you that 34% of your negative reviews share the same root cause
                — and that fixing it will measurably improve your rating within
                8 weeks.
              </p>
            </div>

            <h2 id="signals">
              Core Review Signals Indian Sellers Should Be Tracking
            </h2>
            <p>
              Not all review data is equally actionable. Here are the seven
              signals that consistently drive the highest-impact decisions for
              Amazon.in and Flipkart sellers:
            </p>

            <BlogImageSection
              imageSrc="/twenty one.png"
              altText="5-step AI review analysis pipeline for Amazon India and Flipkart sellers"
              caption="The 5-step automated review intelligence pipeline — from raw reviews to WhatsApp-delivered action recommendations"
            />

            <div className="tbl-wrap">
              <table className="dt">
                <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Review Signal
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">
                      What the AI Detects
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">
                      What You Do With It
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base text-left leading-relaxed">
                      Revenue Impact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviewSignals.map((r, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          fontWeight: 700,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {r.signal}
                      </td>
                      <td style={{ color: "#475569" }}>{r.detect}</td>
                      <td style={{ color: "#475569" }}>{r.action}</td>
                      <td>
                        <span className="bg">{r.impact}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="comparison">
              Manual vs. Tool vs. India-First AI: How the Options Compare
            </h2>
            <div className="tbl-wrap">
              <table className="dt">
                <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Capability
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Manual Review Reading
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Global Tools (US)
                    </th>
                    <th style={{ background: "#16A34A" }}>
                      Insydz AI Review Intelligence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, background: "#F8FAFC" }}>
                        {r.cap}
                      </td>
                      <td style={{ color: "#94A3B8" }}>{r.manual}</td>
                      <td style={{ color: "#94A3B8" }}>{r.global}</td>
                      <td style={{ fontWeight: 700, color: "#15803D" }}>
                        {r.insydz}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="mistakes">
              5 Mistakes Indian Sellers Make With Customer Review Data
            </h2>
            <div className="mistakes">
              {[
                {
                  n: 1,
                  t: "Using Star Rating as a Proxy for Product Health",
                  b: "A 4.1-star average tells you nothing actionable. The number that matters isn't your average rating — it's the percentage of reviews in your worst issue category, and whether that percentage is growing. A product at 4.2 stars with 28% of negative reviews mentioning a single fixable defect is a product with a very clear, solvable problem. You can't tell the difference by looking at the number alone.",
                },
                {
                  n: 2,
                  t: "Only Reading Your Own Reviews and Ignoring Competitors'",
                  b: "Indian sellers consistently overlook the richest source of free product intelligence: their competitors' negative reviews. Every 1-star and 2-star review on a competing product is a buyer telling the market what they wish was different. Sellers who read those reviews systematically can position against known pain points, source improved product variants, and write listing copy that directly addresses the category's most common complaints.",
                },
                {
                  n: 3,
                  t: "Reacting to Individual Reviews Instead of Patterns",
                  b: "A single 1-star review saying 'stopped working after 3 days' is one data point — possibly an outlier. Thirty reviews in 90 days saying variants of 'stopped working early' is a product defect signal that requires supply chain intervention. Sellers who track patterns spend energy on the root causes that generate those responses in the first place.",
                },
                {
                  n: 4,
                  t: "Not Connecting Review Intelligence to Listing Copy",
                  b: "The most direct application of review analysis is consistently under-used: mining your positive reviews for the exact language your buyers use to describe what they love, then putting that language back into your listing title, bullet points, and A+ content. Global tools built for Amazon.com miss this entirely for Indian sellers — because they don't process Hinglish review language.",
                },
                {
                  n: 5,
                  t: "Treating Review Analysis as a One-Time Audit",
                  b: "Many sellers who engage with review data do a one-time audit — clean up their worst issues, update their listing, and move on. This misses the compounding value of continuous tracking. Competitor products change. New sellers enter with different defect patterns. Seasonal usage creates new complaint clusters: monsoon-related issues in apparel, AC compatibility in electronics, gifting suitability during Diwali season.",
                },
              ].map((m) => (
                <div className="mistake" key={m.n}>
                  <div className="mistake-n">{m.n}</div>
                  <div className="mistake-body">
                    <strong>{m.t}</strong>
                    <p>{m.b}</p>
                  </div>
                </div>
              ))}
            </div>

            <BlogImageSection
              imageSrc="/twenty.png"
              altText="Review signal categories and complaint clusters in Insydz review intelligence dashboard"
              caption="Seven review signal categories automatically detected and prioritised by Insydz AI — with action recommendations per cluster"
            />

            <div className="verdict-banner">
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Lora',serif",
                  fontSize: "clamp(13px,2vw,15px)",
                  color: "#92400E",
                  lineHeight: 1.7,
                }}
                className="dark:text-amber-300"
              >
                The goal of review analysis isn't to respond to buyers faster.{" "}
                <strong>
                  It's to eliminate the reasons they write negative reviews at
                  all.
                </strong>
              </p>
            </div>

            <h2 id="workflow">
              Best Practices: Weekly Review Intelligence Execution Model
            </h2>

            <BlogImageSection
              imageSrc="/nineteen.png"
              altText="Weekly review intelligence execution model for Amazon India and Flipkart sellers"
              caption="Three-phase review intelligence workflow — one-time setup, weekly monitoring, and monthly strategic review"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 12,
                margin: "16px 0 24px",
              }}
            >
              {[
                {
                  phase: "One-Time Setup (Do This First — 2 Hours)",
                  color: "#4F46E5",
                  items: [
                    "Connect your Amazon.in and Flipkart seller accounts and add your top 10 SKUs for review monitoring",
                    "Add your top 3 to 5 direct competitors per product — their ASINs and Flipkart listing URLs",
                    "Configure WhatsApp alerts for: any new 1-star or 2-star review on your listings; new negative reviews mentioning keywords like 'broken', 'stopped working', 'wrong size'",
                    "Run an initial review audit on your top 3 SKUs — identify your top 2 complaint clusters per product",
                    "Run the same audit on your top competitors — identify their top 2 complaint clusters",
                  ],
                },
                {
                  phase: "Weekly (20-Minute Review Session)",
                  color: "#0D9488",
                  items: [
                    "Review your weekly sentiment digest — flag any complaint category that increased by more than 3 percentage points",
                    "Check competitor review velocity — is any rival accumulating reviews unusually fast? A new product launch or viral moment incoming",
                    "Review any 1-star and 2-star reviews on your listings that came in this week — is there a new pattern emerging?",
                    "Update your listing copy if a new positive theme cluster emerged — mirror the buyer vocabulary back into your bullets",
                  ],
                },
                {
                  phase: "Monthly (Strategic Review — 45 Minutes)",
                  color: "#DB2777",
                  items: [
                    "Full competitor review analysis: have their complaint clusters shifted? Have they fixed the issues you were counter-positioning against?",
                    "Identify the single highest-impact product improvement from this month's review data — escalate to supplier or in-house team",
                    "Compare your listing copy against your current top positive review themes — are they aligned, or has buyer language drifted?",
                    "Plan listing updates for the upcoming festive season based on review language trends — what did buyers say after last Diwali, Big Billion Days, or Republic Day Sale?",
                  ],
                },
              ].map((section, si) => (
                <div
                  key={si}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: section.color,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        flexShrink: 0,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {si + 1}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontSize: "clamp(12px,2.5vw,14px)",
                        fontWeight: 700,
                        color: "#0D1B2A",
                      }}
                    >
                      {section.phase}
                    </span>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: 6,
                    }}
                  >
                    {section.items.map((item, ii) => (
                      <li
                        key={ii}
                        style={{
                          fontFamily: "'Sora',sans-serif",
                          fontSize: "clamp(11.5px,2vw,13px)",
                          color: "#475569",
                          lineHeight: 1.6,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 7,
                        }}
                      >
                        <span
                          style={{
                            color: section.color,
                            fontWeight: 800,
                            fontSize: 11,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h3>Key Metrics to Track</h3>
            <div className="metrics">
              {[
                {
                  t: "Negative Review Rate by Category",
                  d: "Percentage of 1–2 star reviews mentioning each issue cluster (target: below 8% per cluster)",
                },
                {
                  t: "Complaint Cluster Trend",
                  d: "Is your top complaint category growing or shrinking month-over-month?",
                },
                {
                  t: "Competitor Pain Point Coverage",
                  d: "What percentage of your competitors' top complaints does your listing directly address?",
                },
                {
                  t: "Review Vocabulary Adoption",
                  d: "How much of your 5-star review language appears in your listing title and bullets?",
                },
                {
                  t: "Rating Trend (Weekly)",
                  d: "Not the absolute number, but the direction. A product at 4.1 trending to 4.3 is healthier than one at 4.4 trending to 4.2.",
                },
                {
                  t: "Review Velocity per SKU",
                  d: "Sudden drops in review rate may indicate suppression — trigger a review request campaign immediately.",
                },
              ].map((m) => (
                <div className="metric" key={m.t}>
                  <div>
                    <div className="metric-t">{m.t}</div>
                    <div className="metric-d">{m.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mid-cta">
              <div>
                <h3>Start Mining Reviews Like a Pro — Free</h3>
                <p>
                  AI review intelligence for Amazon.in, Flipkart &amp;. WhatsApp
                  alerts. Hinglish-ready. Setup in under 30 minutes.
                </p>
              </div>
              <button
                onClick={() => router.push("/login")}
                style={{
                  flexShrink: 0,
                  background: "#16A34A",
                  color: "white",
                  padding: "11px 22px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "clamp(13px,2vw,14.5px)",
                  whiteSpace: "nowrap" as const,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "'Sora',sans-serif",
                  width: "100%",
                }}
                className="sm:w-auto"
              >
                Try Insydz Free →
              </button>
            </div>

            <h2 id="best-tools">
              Best Review Analysis Tools for Indian Sellers in 2026
            </h2>
            <h3>Global Tools: What They Offer and Where They Stop</h3>
            <p>
              Several established platforms offer review analysis as part of
              their broader Amazon intelligence suites — Helium 10's Review
              Insights, Jungle Scout's Review Automation, and dedicated
              sentiment platforms like Bazaarvoice and Trustpilot. For Indian
              sellers, an honest assessment:
            </p>

            <div className="tbl-wrap">
              <table className="dt">
                <thead className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-white">
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Tool
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Review Analysis
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      India Platforms
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      Hinglish Support
                    </th>
                    <th className="bg-gradient-to-r from-[#0b0f1a] to-[#111827] text-left px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-base leading-relaxed">
                      WhatsApp Alerts
                    </th>
                    <th style={{ background: "#16A34A" }}>Price (INR/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  {toolRows.map((r, i) => (
                    <tr key={i} className={r.tool === "Insydz" ? "hl" : ""}>
                      <td
                        style={{ fontWeight: r.tool === "Insydz" ? 800 : 600 }}
                      >
                        {r.tool}
                      </td>
                      <td>{r.review}</td>
                      <td>{r.platforms}</td>
                      <td>
                        {r.hinglish === "Yes" ? (
                          <span className="bg">Yes</span>
                        ) : (
                          <span className="br">No</span>
                        )}
                      </td>
                      <td>
                        {r.wa === "Yes" ? (
                          <span className="bg">Yes</span>
                        ) : (
                          <span className="br">No</span>
                        )}
                      </td>
                      <td
                        style={{
                          fontWeight: r.tool === "Insydz" ? 700 : 400,
                          color: r.tool === "Insydz" ? "#15803D" : "inherit",
                        }}
                      >
                        {r.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>
              Insydz: Review Intelligence Built for Amazon.in and Flipkart
            </h3>
            <p>
              Insydz approaches review analysis as a connected intelligence
              function — not an isolated feature. Review signals feed into the
              same platform as competitor pricing, keyword rankings, and market
              trends, so sellers see the full picture in one place rather than
              triangulating across tools.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 8,
                margin: "14px 0 24px",
              }}
            >
              {[
                {
                  title: "Hindi, Hinglish, and English review processing",
                  body: "Reviews are understood in the language they were written, not force-translated into English before analysis.",
                },
                {
                  title: "Issue cluster detection across all 3 platforms",
                  body: "Platform-specific complaint patterns are tracked separately — what buyers complain about on Flipkart often differs from Amazon.in.",
                },
                {
                  title: "Competitor review mining — automated",
                  body: "Automated analysis of your top competitors' reviews, with gap identification and counter-positioning recommendations.",
                },
                {
                  title: "WhatsApp alerts for critical negative reviews",
                  body: "Your own 1-star and 2-star reviews are flagged within 60 minutes — not buried in an email digest opened three days later.",
                },
                {
                  title: "Listing copy recommendations from review data",
                  body: "Specific bullet point rewrites based on positive review language and competitor complaint counter-messaging.",
                },
                {
                  title: "Festive trend tracking",
                  body: "Review sentiment analysis contextualised for Indian seasonal patterns: post-Diwali product reviews, Big Billion Days delivery feedback, Republic Day Sale return rates.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "12px 14px",
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "clamp(12px,2vw,14px)",
                        color: "#0D1B2A",
                        marginBottom: 2,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.title}
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "clamp(11.5px,2vw,13.5px)",
                        color: "#374151",
                        lineHeight: 1.6,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="box box-pink">
              <div className="box-label">No Aggressive Pitch Here</div>
              <p>
                A review intelligence tool is only valuable if it processes the
                language your buyers actually write in and covers the platforms
                they actually buy from. For Indian sellers, that test eliminates
                most global options immediately.
              </p>
            </div>

            <h2 id="faq">Frequently Asked Questions</h2>
            <div style={{ marginTop: 16 }}>
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className={`faq-item${openFaq === i ? " open" : ""}`}
                >
                  <div
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span className={`faq-icon${openFaq === i ? " open" : ""}`}>
                      +
                    </span>
                  </div>
                  {openFaq === i && (
                    <div className="faq-a">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 28,
                borderTop: "2px solid #E2E8F0",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(16px,3vw,20px)",
                  fontWeight: 800,
                  color: "#0D1B2A",
                  margin: "0 0 18px",
                  border: "none",
                  padding: 0,
                  fontFamily: "'Sora',sans-serif",
                }}
                className="dark:text-white"
              >
                Related Guides
              </h2>
              <div className="related-grid">
                {[
                  {
                    t: "Best Competitor Price Tracking Tools for Indian Sellers: The 2026 Guide",
                    tag: "Price Tracking",
                    image: "/Best_Price_Tracer-blog2_image1.png?v=1",
                    r: "/resources/expert-blog/best-competitor-price-tracking-tools-india",
                  },
                  {
                    t: "Insydz vs Helium 10: Which is the Right Tool for Indian Sellers?",
                    tag: "Compare",
                    image: "/thirteen.png",
                    r: "/resources/expert-blog/insydz-vs-helium-10-india",
                  },
                  {
                    t: "Amazon SEO Tool India: The Complete 2026 Guide for Indian Sellers",
                    tag: "SEO Guide",
                    image: "/Amazon_SEO_Tool-Blog3_image1.png",
                    r: "/resources/expert-blog/amazon-seo-tool-india",
                  },
                ].map((rc) => (
                  <div
                    key={rc.t}
                    className="rel-card"
                    onClick={() => router.push(rc.r)}
                  >
                    <div className="rel-thumb">
                      <img src={rc.image} alt={rc.t} />
                    </div>
                    <div className="rel-body">
                      <div className="rel-tag">{rc.tag}</div>
                      <div className="rel-title">{rc.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div className="final-cta-block">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          Your Reviews Are Already Telling You What to Fix. <br /> You Just
          Haven't Listened at Scale.
        </h2>
        <p
          className="text-blue-100 mb-6 text-sm sm:text-base md:text-lg"
          style={{
            fontFamily: "'Lora', serif",
            maxWidth: 520,
            margin: "0 auto 24px",
          }}
        >
          Insydz processes reviews across Amazon.in and Flipkart in Hindi,
          Hinglish, and English — and delivers specific, actionable insights
          straight to your WhatsApp.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "6px 20px",
            marginBottom: 20,
          }}
        >
          {[
            "Free",
            "Hindi + Hinglish + English",
            "WhatsApp alerts in 60 min",
          ].map((t) => (
            <div
              key={t}
              className="text-blue-100"
              style={{
                fontSize: "clamp(11px,2vw,13.5px)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              <span className="text-white" style={{ fontWeight: 800 }}>
                ✓
              </span>{" "}
              {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        >
          Get Your Review Report →
        </button>
        <p className="text-blue-200 text-xs mt-4">
          Free · Hindi + Hinglish + English · WhatsApp alerts in 60 min
        </p>
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
