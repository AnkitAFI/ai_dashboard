"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { 
  Sparkles, 
  Search, 
  Compass, 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  Calculator, 
  MessageSquare, 
  Star, 
  Bookmark, 
  Store, 
  Tag, 
  Users, 
  DollarSign, 
  History, 
  Shield, 
  Zap, 
  Settings, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Crown,
  Receipt,
  Home
} from "lucide-react";
import SmartSearchInput from "@/components/ui/smart-search-input";

interface FeatureInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mode: "explorer" | "seller" | "both";
  category: "GET STARTED" | "DISCOVER" | "BEAT COMPETITION" | "DECIDE & PRICE" | "TRACK & GROW" | "MY STORE" | "COMPETITORS" | "OPTIMIZE" | "SETTINGS";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  path: string;
  tip: string;
}

const FEATURE_CATALOG: FeatureInfo[] = [
  // Explorer Mode
  {
    id: "dashboard-explorer",
    title: "Market Dashboard",
    description: "Get a high-level bird's-eye view of your aggregate market stats, recent metrics, key charts, top-ranking products, and real-time AI recommendations.",
    icon: Home,
    mode: "explorer",
    category: "GET STARTED",
    difficulty: "Beginner",
    path: "/dashboard",
    tip: "Use the filter panel at the top to slice the entire dashboard by category, price range, brand, or time period."
  },
  {
    id: "browse-categories",
    title: "Browse Categories",
    description: "Deep dive into specific market segments. Analyze sales volume, average price trends, and search keyword distributions across primary product categories.",
    icon: BarChart3,
    mode: "explorer",
    category: "DISCOVER",
    difficulty: "Beginner",
    path: "/categories",
    tip: "Sort categories by sales growth to uncover high-demand, low-competition sub-niches."
  },
  {
    id: "top-selling",
    title: "Top Selling Products",
    description: "See the absolute best-performing products in real time. Track sales velocity, estimated monthly revenue, and rank improvements.",
    icon: TrendingUp,
    mode: "explorer",
    category: "DISCOVER",
    difficulty: "Beginner",
    path: "/sales",
    tip: "Use this page to validate product ideas before investing inventory capital."
  },
  {
    id: "opportunity-finder",
    title: "Opportunity Finder (White Space)",
    description: "Locate gaps in the active marketplace where buyer demand is high but available product quality or supply is low. Ideal for launching new SKUs.",
    icon: ShieldCheck,
    mode: "explorer",
    category: "BEAT COMPETITION",
    difficulty: "Advanced",
    path: "/explorer/white-space-finder",
    tip: "Filter by review ratings below 3.8 stars with high sales volume to find instant optimization gaps."
  },
  {
    id: "market-visibility",
    title: "Market Visibility (Share of Voice)",
    description: "Measure what percentage of search results, sponsored ads, and top-page real estate your brand owns compared to your direct competitors.",
    icon: BarChart3,
    mode: "explorer",
    category: "BEAT COMPETITION",
    difficulty: "Intermediate",
    path: "/share-of-voice",
    tip: "Check Share of Voice fluctuations after running ad campaigns to monitor marketing efficiency."
  },
  {
    id: "keyword-intelligence",
    title: "Keyword Intelligence",
    description: "Your master search database. Discover keywords buyers actually use, along with search volume, priority score, and competitor bids.",
    icon: Compass,
    mode: "explorer",
    category: "BEAT COMPETITION",
    difficulty: "Intermediate",
    path: "/keyword-intelligence",
    tip: "Target keywords with high search volume but low keyword difficulty to get fast, cost-effective organic rank."
  },
  {
    id: "product-radar",
    title: "Product Radar (AI Tracker)",
    description: "Add specific competitor items to your radar. The platform monitors price drops, stockouts, review spikes, and listing changes 24/7.",
    icon: Target,
    mode: "explorer",
    category: "DECIDE & PRICE",
    difficulty: "Intermediate",
    path: "/product-tracker",
    tip: "Set alert thresholds so you are notified immediately when a competitor lowers their price."
  },
  {
    id: "price-optimizer-explorer",
    title: "Price Optimizer & Calculator",
    description: "Simulate pricing changes and view live profit margin projections. Factors in shipping costs, FBA fees, and referral tariffs automatically.",
    icon: Calculator,
    mode: "explorer",
    category: "DECIDE & PRICE",
    difficulty: "Intermediate",
    path: "/explorer/profitability-optimizer",
    tip: "Use the sliding volume control to see how price drops can drive high sales velocity and boost net margins."
  },
  {
    id: "ai-advisor-explorer",
    title: "AI Advisor Expert",
    description: "Get personalized business growth playbooks generated by AI based specifically on your dashboard statistics, store category, and competition.",
    icon: Sparkles,
    mode: "explorer",
    category: "DECIDE & PRICE",
    difficulty: "Beginner",
    path: "/explorer/ai-advisor",
    tip: "Ask the AI Advisor 'How do I beat my top price competitor?' to get specific tactical ideas."
  },
  {
    id: "whatsapp-alerts-explorer",
    title: "WhatsApp Alerts Integration",
    description: "Connect your WhatsApp number to receive immediate push notifications whenever your monitored competitor listings change, stockout, or rank drops.",
    icon: MessageSquare,
    mode: "explorer",
    category: "TRACK & GROW",
    difficulty: "Beginner",
    path: "/explorer/whatsapp-alerts",
    tip: "Toggle 'Stock Alerts' on to ensure you are ready to restock or advertise when competitors go out of stock."
  },
  {
    id: "festive-trends",
    title: "Festive Trends Tracker",
    description: "Analyze historical demand spikes during major regional festivals (Diwali, Eid, Holi). Plan inventory levels and optimize ad spends weeks in advance.",
    icon: Star,
    mode: "explorer",
    category: "TRACK & GROW",
    difficulty: "Intermediate",
    path: "/explorer/festive-trends",
    tip: "Start ramping up organic keyword optimization at least 4 weeks before the festival begins."
  },
  {
    id: "my-watchlist",
    title: "My Watchlist",
    description: "A centralized dashboard compiling all items, categories, and keyword tracks you have bookmarked, for simple access.",
    icon: Bookmark,
    mode: "explorer",
    category: "TRACK & GROW",
    difficulty: "Beginner",
    path: "/explorer/my-watchlist",
    tip: "Clean up your watchlist regularly to focus only on highly active campaigns."
  },

  // Seller Mode
  {
    id: "dashboard-seller",
    title: "Seller Performance Dashboard",
    description: "Focus entirely on your business. Monitor store revenue, units sold, order trends, average order value, and global listing health scores.",
    icon: Store,
    mode: "seller",
    category: "MY STORE",
    difficulty: "Beginner",
    path: "/dashboard",
    tip: "Toggle the workspace mode switcher in the sidebar to switch between global Explorer market data and your Seller dashboard."
  },
  {
    id: "my-products",
    title: "My Store Catalog",
    description: "Analyze your active products, real-time inventory counts, unit profitability, margin metrics, and average ratings in one structured grid.",
    icon: Tag,
    mode: "seller",
    category: "MY STORE",
    difficulty: "Beginner",
    path: "/seller/my-products",
    tip: "Identify products with deteriorating profit margins and simulate adjustments in the Price Optimizer."
  },
  {
    id: "listing-audit",
    title: "Listing Optimization Audit",
    description: "An AI analyzer that audits your product detail pages. Scores image count, title keyword density, bullet description details, and reviews.",
    icon: Search,
    mode: "seller",
    category: "MY STORE",
    difficulty: "Intermediate",
    path: "/seller/listing-audit",
    tip: "Fix the red 'high impact' warnings first to get the biggest boost in search rankings."
  },
  {
    id: "price-comparison",
    title: "Competitor Price Matrix",
    description: "Track your product pricing side-by-side with your top 5 direct competitors. Colors highlight if you are underpriced or losing buy-box margins.",
    icon: DollarSign,
    mode: "seller",
    category: "COMPETITORS",
    difficulty: "Intermediate",
    path: "/seller/price-comparison",
    tip: "Match or stay 1% below the lowest competitor if you are aiming to capture high Buy Box visibility."
  },
  {
    id: "review-comparison",
    title: "Review & Sentiment Matrix",
    description: "AI-driven sentiment comparison. Analyzes customer reviews for your products versus competitors, highlighting top complaints and positive trends.",
    icon: Star,
    mode: "seller",
    category: "COMPETITORS",
    difficulty: "Intermediate",
    path: "/seller/review-comparison",
    tip: "Use competitor complaints identified in review comparisons to upgrade your own product and highlight it in ads."
  },
  {
    id: "keyword-gap",
    title: "Competitor Keyword Gap Analysis",
    description: "Reveals the precise high-traffic organic search keywords your top competitors rank Page 1 for that your listing does not target.",
    icon: History,
    mode: "seller",
    category: "COMPETITORS",
    difficulty: "Advanced",
    path: "/seller/keyword-gap",
    tip: "Add these missing keywords to your listing's backend search terms to index instantly."
  },
  {
    id: "competitor-analysis",
    title: "Storefront Competitor Scanner",
    description: "Search any competitor storefront to estimate their monthly unit sales, revenue, top traffic-driving products, and market share.",
    icon: Shield,
    mode: "seller",
    category: "COMPETITORS",
    difficulty: "Advanced",
    path: "/seller/competitor-analysis",
    tip: "Monitor high-growth competitors to reverse-engineer their pricing strategies and keyword setups."
  },
  {
    id: "price-optimizer-seller",
    title: "Automated Price Optimizer",
    description: "Simulate and apply dynamic pricing configurations. Set limits, target profit margins, and calculate fees.",
    icon: TrendingUp,
    mode: "seller",
    category: "OPTIMIZE",
    difficulty: "Advanced",
    path: "/seller/price-optimizer",
    tip: "Establish a 'minimum floor price' to ensure you never run campaigns at a net loss."
  },
  {
    id: "rank-tracker-seller",
    title: "Organic Keyword Rank Tracker",
    description: "Track organic rank and index positions of your key search terms on results pages. Plots trends over daily and weekly intervals.",
    icon: Target,
    mode: "seller",
    category: "OPTIMIZE",
    difficulty: "Intermediate",
    path: "/seller/rank-tracker",
    tip: "Track at least 15 core keywords to gauge search engine relevance after listing optimization."
  },

  // General Settings
  {
    id: "subscription-tiers",
    title: "Subscription Plans",
    description: "Upgrade or modify your account plan. Access higher limits, unlock the full Opportunity Finder, and track more competitive keywords.",
    icon: Crown,
    mode: "both",
    category: "SETTINGS",
    difficulty: "Beginner",
    path: "/subscription",
    tip: "Upgrading to Premium gives you unlimited AI Advisor prompts and instant WhatsApp alerts."
  },
  {
    id: "settings-general",
    title: "Account Settings",
    description: "Manage your user profile, change passwords, and configure API integrations.",
    icon: Settings,
    mode: "both",
    category: "SETTINGS",
    difficulty: "Beginner",
    path: "/settings",
    tip: "Ensure your contact email is verified to prevent delivery issues with email reports."
  }
];

interface TourStep {
  title: string;
  description: string;
  badge: string;
  actionInstruction: string;
  selector?: string; // Target selector to draw highlight cutout
  expectedMode?: "explorer" | "seller";
  placement?: "bottom" | "top" | "left" | "right" | "auto";
  triggerType?: "click" | "route" | "mode";
  triggerValue?: string;
  successMessage: string;
  videoPath?: string; // Optional MP4 tutorial video path for the step
}

// =========================================================================
// Specialized Tour Steps 1: Expanded Explorer Mode Tour (Covers all sidebars!)
// =========================================================================
const EXPLORER_TOUR_STEPS: TourStep[] = [
  {
    title: "Explorer Workspace Guide",
    description: "Welcome! I will guide you through the Explorer Workspace, which is designed for product discovery, category insights, and beating global market competition.",
    badge: "Welcome",
    actionInstruction: "Click 'Start Live Guide' below to launch your hands-on tour!",
    placement: "auto",
    successMessage: "Explorer onboarding initiated!",
    // videoPath: "/videos/Insydz Introduction.mp4"
  },
  {
    title: "Workspace Switcher",
    description: "Toggles between Explorer (global retail analytics) and Seller (your private store metrics). Click 'Seller' inside the highlighted switcher now to see the workspace options toggle!",
    badge: "Mode Switch",
    selector: "#tour-mode-switcher",
    actionInstruction: "Click 'Seller' in the highlighted switcher to see the sidebar options toggle!",
    expectedMode: "explorer",
    triggerType: "mode",
    triggerValue: "seller",
    placement: "auto",
    successMessage: "Sidebar workspace toggled to Seller!"
  },
  {
    title: "Dashboard Filters",
    description: "Filters let you select source platforms (Amazon vs Flipkart), pricing thresholds, and categories. Click the highlighted 'Filters' button in the header now to reveal the panel!",
    badge: "Filters",
    selector: "#tour-filters-btn",
    actionInstruction: "Click 'Filters' in the top header now to reveal the panel!",
    expectedMode: "explorer",
    triggerType: "click",
    placement: "auto",
    successMessage: "Filters panel toggled successfully!"
  },
  {
    title: "Explorer Dashboard Overview",
    description: "Your primary command center. Return here anytime to inspect global market trends, high-level metrics, and live product statistics.",
    badge: "Dashboard",
    selector: 'a[href="/dashboard"]',
    actionInstruction: "Click 'Dashboard' under GET STARTED in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/dashboard",
    placement: "right",
    successMessage: "Explorer Dashboard loaded successfully!",
    // videoPath: "/videos/Insydz -  Complete Navigation Guide.mp4"
  },
  {
    title: "Browse Categories Catalog",
    description: "Deep dive into specific market segments. Analyze sales volume, average price trends, and search keyword distributions across primary product categories.",
    badge: "Categories",
    selector: 'a[href="/categories"]',
    actionInstruction: "Click 'Browse Categories' under DISCOVER in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/categories",
    placement: "right",
    successMessage: "Category Browser loaded successfully!",
    videoPath:""
  },
  {
    title: "Top Selling Products Niches",
    description: "See the absolute best-performing products in real time. Track sales velocity, estimated monthly revenue, and rank improvements inside specific category paths.",
    badge: "Top Sellers",
    selector: 'a[href="/sales"]',
    actionInstruction: "Click 'Top Selling Products' under DISCOVER in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/sales",
    placement: "right",
    successMessage: "Top Selling Products loaded successfully!",
    videoPath:""
  },
  {
    title: "Opportunity Finder (White Space)",
    description: "Locate gaps in the active marketplace where buyer demand is high but available product quality or supply is low. Ideal for launching new SKUs.",
    badge: "Opportunities",
    selector: 'a[href="/explorer/white-space-finder"]',
    actionInstruction: "Click 'Opportunity Finder' under BEAT COMPETITION in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/white-space-finder",
    placement: "right",
    successMessage: "Opportunity Finder loaded successfully!",
    // videoPath: "/videos/Insydz Feature - Opportunity Finder.mp4"
  },
  {
    title: "Market Visibility Share",
    description: "Measure what percentage of search results, sponsored ads, and top-page real estate your brand owns compared to your direct competitors.",
    badge: "Visibility",
    selector: 'a[href="/share-of-voice"]',
    actionInstruction: "Click 'Market Visibility' under BEAT COMPETITION in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/share-of-voice",
    placement: "right",
    successMessage: "Market Visibility loaded successfully!",
    // videoPath: "/videos/Insydz’s Market Visibility.mp4"
  },
  {
    title: "Keyword Intelligence Search",
    description: "Your master search database. Discover keywords buyers actually use, along with search volume, priority score, and competitor bids.",
    badge: "Keywords",
    selector: 'a[href="/keyword-intelligence"]',
    actionInstruction: "Click 'Keyword Intelligence' under BEAT COMPETITION in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/keyword-intelligence",
    placement: "right",
    successMessage: "Keyword Intelligence loaded successfully!",
    videoPath:""
  },
  {
    title: "Product Radar (AI Tracker)",
    description: "Add specific competitor items to your radar. The platform monitors price drops, stockouts, review spikes, and listing changes 24/7.",
    badge: "Radars",
    selector: 'a[href="/product-tracker"]',
    actionInstruction: "Click 'Product Radar' under DECIDE & PRICE in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/product-tracker",
    placement: "right",
    successMessage: "Product Radar loaded successfully!",
    videoPath:""
  },
  {
    title: "Price Optimizer margin simulator",
    description: "Simulate pricing changes and view live profit margin projections. Factors in shipping costs, FBA fees, and referral tariffs automatically.",
    badge: "Pricing",
    selector: 'a[href="/explorer/profitability-optimizer"]',
    actionInstruction: "Click 'Price Optimizer' under DECIDE & PRICE in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/profitability-optimizer",
    placement: "right",
    successMessage: "Price Optimizer loaded successfully!",
    videoPath: ""
  },
  {
    title: "AI Advisor Growth Playbooks",
    description: "Get personalized business growth playbooks generated by AI based specifically on your dashboard statistics, store category, and competition.",
    badge: "AI Advisor",
    selector: 'a[href="/explorer/ai-advisor"]',
    actionInstruction: "Click 'AI Advisor' under DECIDE & PRICE in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/ai-advisor",
    placement: "right",
    successMessage: "AI Advisor loaded successfully!",
    videoPath: ""
  },
  {
    title: "WhatsApp Alerts Integration",
    description: "Connect your WhatsApp number to receive immediate push notifications whenever your monitored competitor listings change, stockout, or rank drops.",
    badge: "WhatsApp",
    selector: 'a[href="/explorer/whatsapp-alerts"]',
    actionInstruction: "Click 'WhatsApp Alerts' under TRACK & GROW in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/whatsapp-alerts",
    placement: "right",
    successMessage: "WhatsApp Alerts loaded successfully!"
  },
  {
    title: "Festive Trends Tracker",
    description: "Analyze historical demand spikes during major regional festivals (Diwali, Eid, Holi). Plan inventory levels and optimize ad spends weeks in advance.",
    badge: "Festive",
    selector: 'a[href="/explorer/festive-trends"]',
    actionInstruction: "Click 'Festive Trends' under TRACK & GROW in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/festive-trends",
    placement: "right",
    successMessage: "Festive Trends loaded successfully!",
    videoPath: ""
  },
  {
    title: "My Watchlist Bookmarks",
    description: "A centralized dashboard compiling all items, categories, and keyword tracks you have bookmarked, for simple access.",
    badge: "Watchlist",
    selector: 'a[href="/explorer/my-watchlist"]',
    actionInstruction: "Click 'My Watchlist' under TRACK & GROW in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/explorer/my-watchlist",
    placement: "right",
    successMessage: "My Watchlist loaded successfully!",
    videoPath: ""
  },
  {
    title: "Subscription Tier Plan",
    description: "Compare plans or upgrade your workspace to premium to unlock unrestricted AI advisor chats, infinite WhatsApp reports, and deeper search metrics.",
    badge: "Subscription",
    selector: 'a[href="/subscription"]',
    actionInstruction: "Click 'Subscription' under SETTINGS in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/subscription",
    placement: "right",
    successMessage: "Subscription levels loaded successfully!"
  },
  {
    title: "About Platform Information",
    description: "Access official release notes, system metrics, update frequency schedules, and direct developer help logs.",
    badge: "About Info",
    selector: 'a[href="/about"]',
    actionInstruction: "Click 'About' under SETTINGS in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/about",
    placement: "right",
    successMessage: "About documentation loaded successfully!"
  },
  {
    title: "Payment Invoice History",
    description: "Manage historical plan receipts, audit billing frequencies, and download printable PDFs for your organization's accounting.",
    badge: "Order History",
    selector: 'a[href="/order-history"]',
    actionInstruction: "Click 'Order History' under SETTINGS in the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/order-history",
    placement: "right",
    successMessage: "Order History records loaded successfully!"
  },
  {
    title: "Account Profile Settings",
    description: "Adjust your profile data, email configurations, avatar, API integrations, and secure authentication keys.",
    badge: "Settings Profile",
    selector: 'a[href="/settings"]',
    actionInstruction: "Click the Settings gear icon next to your profile card at the bottom of the sidebar now!",
    expectedMode: "explorer",
    triggerType: "route",
    triggerValue: "/settings",
    placement: "right",
    successMessage: "Account Settings profile loaded successfully!"
  },
  {
    title: "Explorer Onboarding Complete!",
    description: "You have mastered each and every tool in the Explorer workspace! Toggle your workspace mode switcher to Seller to configure your private store audits.",
    badge: "Success",
    actionInstruction: "Click 'Finish' to start using your premium analytics dashboard.",
    placement: "auto",
    successMessage: "All steps completed!"
  }
];

// =========================================================================
// Specialized Tour Steps 2: Expanded Seller Mode Tour (Covers all sidebars!)
// =========================================================================
const SELLER_TOUR_STEPS: TourStep[] = [
  {
    title: "Seller Workspace Guide",
    description: "Welcome! I will guide you through the Seller Workspace, which is built to audit your store listing SEO, track organic search ranks, and analyze competitor pricing matrices.",
    badge: "Welcome",
    actionInstruction: "Click 'Start Live Guide' below to launch your hands-on tour!",
    placement: "auto",
    successMessage: "Seller onboarding initiated!",
    // videoPath: "/videos/Insydz Introduction.mp4"
  },
  {
    title: "Workspace Switcher",
    description: "Toggles between Explorer (global retail analytics) and Seller (your private store metrics). Click 'Explorer' inside the highlighted switcher now to see the sidebar options toggle!",
    badge: "Mode Switch",
    selector: "#tour-mode-switcher",
    actionInstruction: "Click 'Explorer' in the highlighted switcher to switch back, or click Next Step.",
    expectedMode: "seller",
    triggerType: "mode",
    triggerValue: "explorer",
    placement: "auto",
    successMessage: "Workspace successfully toggled back to Explorer!"
  },
  {
    title: "Seller Dashboard Performance",
    description: "Your storefront command center. Monitors your private store's total revenue, units sold, recent sales trends, and global listing health scores.",
    badge: "Dashboard",
    selector: 'a[href="/dashboard"]',
    actionInstruction: "Click 'Dashboard' under MY STORE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/dashboard",
    placement: "right",
    successMessage: "Seller Dashboard loaded successfully!",
    // videoPath: "/videos/Insydz -  Complete Navigation Guide.mp4"
  },
  {
    title: "My Store Product Catalog",
    description: "Analyze your active products, real-time inventory counts, unit profitability, margin metrics, and average ratings in one structured grid.",
    badge: "My Products",
    selector: 'a[href="/seller/my-products"]',
    actionInstruction: "Click 'My Products' under MY STORE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/my-products",
    placement: "right",
    successMessage: "My Products SKU catalog loaded!",
    videoPath: ""
  },
  {
    title: "Listing Optimization Audit",
    description: "An AI analyzer that audits your product detail pages. Scores image count, title keyword density, bullet description details, and reviews.",
    badge: "Listing SEO",
    selector: 'a[href="/seller/listing-audit"]',
    actionInstruction: "Click 'Listing Audit' under MY STORE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/listing-audit",
    placement: "right",
    successMessage: "Listing Audit loaded successfully!",
    videoPath: ""
  },
  {
    title: "Competitor Market Sectors",
    description: "Analyze how direct competitors categorize their items, compare category trends, and review sub-category market distribution stats.",
    badge: "Categories",
    selector: 'a[href="/categories"]',
    actionInstruction: "Click 'Browse Categories' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/categories",
    placement: "right",
    successMessage: "Browse Categories loaded successfully!",
    videoPath: ""
  },
  {
    title: "Competitor Price Comparison",
    description: "Track your product pricing side-by-side with your top 5 direct competitors. Colors highlight if you are underpriced or losing buy-box margins.",
    badge: "Price Spy",
    selector: 'a[href="/seller/price-comparison"]',
    actionInstruction: "Click 'Price Comparison' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/price-comparison",
    placement: "right",
    successMessage: "Price Comparison loaded successfully!",
    // videoPath: "/videos/Seller-Price-Comparison.mp4"
  },
  {
    title: "Review & Sentiment Matrix",
    description: "AI-driven sentiment comparison. Analyzes customer reviews for your products versus competitors, highlighting top complaints and positive trends.",
    badge: "Review Sentiment",
    selector: 'a[href="/seller/review-comparison"]',
    actionInstruction: "Click 'Review Comparison' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/review-comparison",
    placement: "right",
    successMessage: "Review Comparison loaded successfully!",
    // videoPath: "/videos/Insydz Review Comp.mp4"
  },
  {
    title: "Competitor Keyword Gap Analysis",
    description: "Reveals exactly which keywords your competitors are ranking for on Page 1 that your product listing is not targeting at all.",
    badge: "Keyword Gaps",
    selector: 'a[href="/seller/keyword-gap"]',
    actionInstruction: "Click 'Keyword Gap Analysis' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/keyword-gap",
    placement: "right",
    successMessage: "Keyword Gap Analysis loaded successfully!",
    videoPath: ""
  },
  {
    title: "Competitor Top Sellers",
    description: "Scan the highest volume competitive products to extract successful pricing strategies, product designs, and listing layouts.",
    badge: "Top Sellers",
    selector: 'a[href="/sales"]',
    actionInstruction: "Click 'Top Selling Products' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/sales",
    placement: "right",
    successMessage: "Top Selling Products loaded successfully!"
  },
  {
    title: "Storefront Competitor Scanner",
    description: "Search any competitor storefront to estimate their monthly unit sales, revenue, top traffic-driving products, and market share.",
    badge: "Scanner",
    selector: 'a[href="/seller/competitor-analysis"]',
    actionInstruction: "Click 'Competitor Analysis' under COMPETITORS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/competitor-analysis",
    placement: "right",
    successMessage: "Competitor analysis loaded successfully!",
    videoPath: ""
  },
  {
    title: "Automated Price Optimizer",
    description: "Simulate and apply dynamic pricing configurations. Set limits, target profit margins, and calculate fees.",
    badge: "Dynamic Price",
    selector: 'a[href="/seller/price-optimizer"]',
    actionInstruction: "Click 'Price Optimizer' under OPTIMIZE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/price-optimizer",
    placement: "right",
    successMessage: "Price Optimizer loaded successfully!",
    videoPath: ""
  },
  {
    title: "Organic Keyword Rank Tracker",
    description: "Track organic rank and index positions of your key search terms on results pages. Plots trends over daily and weekly intervals.",
    badge: "Rank Tracker",
    selector: 'a[href="/seller/rank-tracker"]',
    actionInstruction: "Click 'Rank Tracker' under OPTIMIZE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/rank-tracker",
    placement: "right",
    successMessage: "Rank Tracker loaded successfully!",
    videoPath: ""
  },
  {
    title: "AI Advisor Listing Copywriter",
    description: "Consult your virtual store co-pilot. Writes Listing Descriptions, bullet points, and ad campaign drafts on the fly.",
    badge: "AI Advisor",
    selector: 'a[href="/seller/ai-advisor"]',
    actionInstruction: "Click 'AI Advisor' under OPTIMIZE in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/ai-advisor",
    placement: "right",
    successMessage: "AI Advisor loaded successfully!",
    videoPath: ""
  },
  {
    title: "Market Visibility Share (SOV)",
    description: "Track your brand's prominence and search results real-estate compared to competitors in real-time.",
    badge: "Visibility SOV",
    selector: 'a[href="/share-of-voice"]',
    actionInstruction: "Click 'Market Visibility' under TRACK & GROW in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/share-of-voice",
    placement: "right",
    successMessage: "Market Visibility loaded successfully!",
    // videoPath: "/videos/Insydz’s Market Visibility.mp4"
  },
  {
    title: "WhatsApp Live Alerts Integration",
    description: "Connect your WhatsApp number to receive immediate push notifications whenever your monitored competitor listings change, stockout, or rank drops.",
    badge: "WhatsApp Alerts",
    selector: 'a[href="/seller/whatsapp-alerts"]',
    actionInstruction: "Click 'WhatsApp Alerts' under TRACK & GROW in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/seller/whatsapp-alerts",
    placement: "right",
    successMessage: "WhatsApp Alerts loaded successfully!",
    videoPath: ""
  },
  {
    title: "Festive Trends (Disabled Feature)",
    description: "Analyze historical demand spikes during major regional festivals (Diwali, Eid, Holi) to plan listings. Note: This feature is disabled on the basic seller tier.",
    badge: "Festive Trends",
    selector: 'a.cursor-not-allowed',
    actionInstruction: "Examine the disabled 'Festive Trends' sidebar item. Since it is locked, click 'Next Step' or 'Next' to continue!",
    expectedMode: "seller",
    placement: "right",
    successMessage: "Unlocked in Premium!"
  },
  {
    title: "Premium Subscription Plan",
    description: "Upgrade or modify your account plan tier to access higher monitoring limits, unlock full opportunity search maps, and advanced tracking indexes.",
    badge: "Subscription",
    selector: 'a[href="/subscription"]',
    actionInstruction: "Click 'Subscription' under SETTINGS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/subscription",
    placement: "right",
    successMessage: "Subscription levels loaded successfully!"
  },
  {
    title: "About Platform Information",
    description: "Access official release notes, system metrics, update frequency schedules, and direct developer help logs.",
    badge: "About Info",
    selector: 'a[href="/about"]',
    actionInstruction: "Click 'About' under SETTINGS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/about",
    placement: "right",
    successMessage: "About documentation loaded successfully!"
  },
  {
    title: "Payment Invoice History",
    description: "Manage historical plan receipts, audit billing frequencies, and download printable PDFs for your organization's accounting.",
    badge: "Order History",
    selector: 'a[href="/order-history"]',
    actionInstruction: "Click 'Order History' under SETTINGS in the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/order-history",
    placement: "right",
    successMessage: "Order History records loaded successfully!"
  },
  {
    title: "Account Profile Settings",
    description: "Adjust your profile data, email configurations, avatar, API integrations, and secure authentication keys.",
    badge: "Settings Profile",
    selector: 'a[href="/settings"]',
    actionInstruction: "Click the Settings gear icon next to your profile card at the bottom of the sidebar now!",
    expectedMode: "seller",
    triggerType: "route",
    triggerValue: "/settings",
    placement: "right",
    successMessage: "Account Settings profile loaded successfully!"
  },
  {
    title: "Seller Onboarding Complete!",
    description: "You have mastered each and every tool in the Seller workspace! Run listings audits and keyword gap comparisons regularly to drive listing relevance.",
    badge: "Success",
    actionInstruction: "Click 'Finish' to start using your premium analytics dashboard.",
    placement: "auto",
    successMessage: "All steps completed!"
  }
];


export default function SaaSTourGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tour" | "catalog">("tour");
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("All");
  
  // Real-time Active Tour Mode ('explorer' or 'seller')
  const [activeTourMode, setActiveTourMode] = useState<"explorer" | "seller">("explorer");

  // Spotlight coordinates state
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Floating dialog position state
  const [dialogStyle, setDialogStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDir, setArrowDir] = useState<"up" | "down" | "left" | "right" | null>(null);


  const [showWelcomeCard, setShowWelcomeCard] = useState(false);

  // Interactive Live States
  const [isActionCompleted, setIsActionCompleted] = useState(false);
  const clickListenerAttached = useRef<string | null>(null);

  const [isExplorerCompleted, setIsExplorerCompleted] = useState(false);
  const [isSellerCompleted, setIsSellerCompleted] = useState(false);

  // Sync tour completion state from database on user load
  useEffect(() => {
    if (user) {
      setIsExplorerCompleted(!!user.explorerTourCompleted);
      setIsSellerCompleted(!!user.sellerTourCompleted);
    }
  }, [user]);

  // Listen to open-saas-guide triggers to replay or reactivate the assistant
  useEffect(() => {
    const handleOpenGuide = async () => {
      const payload: { [key: string]: boolean } = {};
      if (activeTourMode === "seller") {
        setIsSellerCompleted(false);
        payload.seller_tour_completed = false;
      } else {
        setIsExplorerCompleted(false);
        payload.explorer_tour_completed = false;
      }
      setIsOpen(true);
      setActiveTab("tour");
      setCurrentStep(0);
      setIsActionCompleted(false);

      if (user) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/tour-completion`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          refreshUser();
        } catch (err) {
          console.error("Error resetting tour completion status:", err);
        }
      }
    };
    window.addEventListener("open-saas-guide", handleOpenGuide);
    return () => window.removeEventListener("open-saas-guide", handleOpenGuide);
  }, [activeTourMode, user, refreshUser]);

  // Synchronize active tour steps mode with user's sidebar mode in real-time
  useEffect(() => {
    const handleModeSync = () => {
      if (typeof window !== "undefined") {
        const activeMode = localStorage.getItem("sidebar-mode") || "explorer";
        setActiveTourMode(activeMode === "seller" ? "seller" : "explorer");
      }
    };

    handleModeSync();
    window.addEventListener("sidebar-mode-changed", handleModeSync);
    return () => {
      window.removeEventListener("sidebar-mode-changed", handleModeSync);
    };
  }, []);

  // Determine active steps catalog based on current tour mode
  const activeSteps = useMemo(() => {
    return activeTourMode === "seller" ? SELLER_TOUR_STEPS : EXPLORER_TOUR_STEPS;
  }, [activeTourMode]);

  // Compute active completion status dynamically
  const isTourCompleted = useMemo(() => {
    return activeTourMode === "seller" ? isSellerCompleted : isExplorerCompleted;
  }, [activeTourMode, isExplorerCompleted, isSellerCompleted]);

  // Reset tour step position to 0 whenever the active tour step configuration list changes
  useEffect(() => {
    setCurrentStep(0);
    setIsActionCompleted(false);
  }, [activeTourMode]);


  // Mode Auto Sync logic (pre-emptively opens target sidebar workspaces)
  useEffect(() => {
    const step = activeSteps[currentStep];
    if (isOpen && activeTab === "tour" && step && step.expectedMode) {
      const currentMode = localStorage.getItem("sidebar-mode") || "explorer";
      if (currentMode !== step.expectedMode) {
        localStorage.setItem("sidebar-mode", step.expectedMode);
        window.dispatchEvent(new Event("sidebar-mode-changed"));
      }
    }
  }, [currentStep, isOpen, activeTab, activeSteps]);

  // Spotlight Position Calculator loop (tracks scroll, resizes, and animations)
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || activeTab !== "tour") {
        setSpotlightRect(null);
        return;
      }
      
      const step = activeSteps[currentStep];
      if (!step?.selector) {
        setSpotlightRect(null);
        return;
      }

      const element = document.querySelector(step.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect((prev) => {
          if (
            prev &&
            prev.top === rect.top &&
            prev.left === rect.left &&
            prev.width === rect.width &&
            prev.height === rect.height
          ) {
            return prev;
          }
          return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          };
        });
      } else {
        setSpotlightRect(null);
      }
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    
    const interval = setInterval(updatePosition, 200);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearInterval(interval);
    };
  }, [currentStep, isOpen, activeTab, activeSteps]);

  // Compute Tooltip Dialog placement coordinates
  useEffect(() => {
    if (!isOpen) return;

    const step = activeSteps[currentStep];
    const hasVideo = !!step?.videoPath;
    const width = 330; // Polished, compact Card width
    const height = hasVideo ? 410 : 330; // Dynamic height based on video presence
    const offsetTop = hasVideo ? 120 : 80; // Dynamic arrow centering vertical offset

    // Center card if no active spotlight
    if (!spotlightRect || !step?.selector) {
      setDialogStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        pointerEvents: "auto"
      });
      setArrowDir(null);
      return;
    }

    const pad = 12;
    const sTop = spotlightRect.top;
    const sLeft = spotlightRect.left;
    const sWidth = spotlightRect.width;
    const sHeight = spotlightRect.height;

    let finalTop = 0;
    let finalLeft = 0;
    let dir: "up" | "down" | "left" | "right" = "up";

    // Handle mobile layout bounds
    if (window.innerWidth < 640) {
      setDialogStyle({
        position: "fixed",
        bottom: "16px",
        left: "16px",
        right: "16px",
        zIndex: 9999,
        width: "auto",
        pointerEvents: "auto"
      });
      setArrowDir(null);
      return;
    }

    const preferredPlacement = step.placement || "auto";

    if (preferredPlacement === "right") {
      finalTop = sTop + (sHeight / 2) - offsetTop;
      finalLeft = sLeft + sWidth + pad;
      dir = "left";
    } else if (preferredPlacement === "left") {
      finalTop = sTop + (sHeight / 2) - offsetTop;
      finalLeft = sLeft - width - pad;
      dir = "right";
    } else {
      const spaceBelow = window.innerHeight - (sTop + sHeight);
      const spaceAbove = sTop;

      if (spaceBelow > height + 10) {
        finalTop = sTop + sHeight + pad;
        finalLeft = sLeft + (sWidth / 2) - (width / 2);
        dir = "up";
      } else if (spaceAbove > height + 10) {
        finalTop = sTop - height - pad;
        finalLeft = sLeft + (sWidth / 2) - (width / 2);
        dir = "down";
      } else {
        finalTop = sTop + (sHeight / 2) - offsetTop;
        finalLeft = sLeft + sWidth + pad;
        dir = "left";
      }
    }

    // Viewport clamping guards
    finalLeft = Math.max(pad, Math.min(finalLeft, window.innerWidth - width - pad));
    finalTop = Math.max(pad, Math.min(finalTop, window.innerHeight - height - pad));

    const targetCenterX = sLeft + (sWidth / 2);
    const arrowX = targetCenterX - finalLeft;
    
    const targetCenterY = sTop + (sHeight / 2);
    const arrowY = targetCenterY - finalTop;

    setDialogStyle({
      position: "fixed",
      top: `${finalTop}px`,
      left: `${finalLeft}px`,
      width: `${width}px`,
      zIndex: 9999,
      pointerEvents: "auto"
    });

    setArrowDir(dir);

    if (dir === "up" || dir === "down") {
      setArrowStyle({
        left: `${Math.max(12, Math.min(arrowX, width - 20))}px`
      });
    } else {
      setArrowStyle({
        top: `${Math.max(12, Math.min(arrowY, height - 20))}px`
      });
    }

  }, [spotlightRect, currentStep, isOpen, activeTab, activeSteps]);

  // Trigger Complete animation and advance step automatically
  const triggerSuccessTransition = () => {
    setIsActionCompleted(true);
    setTimeout(() => {
      setIsActionCompleted(false);
      handleNextStep();
    }, 900);
  };

  // =========================================================================
  // Live Event Detection: 1. Click Listener Hook
  // =========================================================================
  useEffect(() => {
    if (!isOpen || activeTab !== "tour") return;

    const step = activeSteps[currentStep];
    if (step?.triggerType !== "click" || !step?.selector) return;

    const element = document.querySelector(step.selector);
    if (!element) return;

    const listenerKey = `${currentStep}-${step.selector}`;
    if (clickListenerAttached.current === listenerKey) return;

    const handleTargetClick = () => {
      triggerSuccessTransition();
    };

    element.addEventListener("click", handleTargetClick);
    clickListenerAttached.current = listenerKey;

    return () => {
      element.removeEventListener("click", handleTargetClick);
      clickListenerAttached.current = null;
    };
  }, [currentStep, isOpen, activeTab, spotlightRect, activeSteps]);

  // =========================================================================
  // Live Event Detection: 2. URL Path Tracker
  // =========================================================================
  useEffect(() => {
    if (!isOpen || activeTab !== "tour") return;

    const step = activeSteps[currentStep];
    if (step?.triggerType === "route" && step?.triggerValue) {
      if (pathname === step.triggerValue) {
        triggerSuccessTransition();
      }
    }
  }, [pathname, currentStep, isOpen, activeTab, activeSteps]);

  // =========================================================================
  // Live Event Detection: 3. Sidebar Workspace Mode Tracker
  // =========================================================================
  useEffect(() => {
    if (!isOpen || activeTab !== "tour") return;

    const step = activeSteps[currentStep];
    if (step?.triggerType !== "mode" || !step?.triggerValue) return;

    const handleModeChange = () => {
      const activeMode = localStorage.getItem("sidebar-mode") || "explorer";
      if (activeMode === step.triggerValue) {
        triggerSuccessTransition();
      }
    };

    window.addEventListener("sidebar-mode-changed", handleModeChange);
    return () => {
      window.removeEventListener("sidebar-mode-changed", handleModeChange);
    };
  }, [currentStep, isOpen, activeTab, activeSteps]);

  // =========================================================================
  // Smoothly scroll the highlighted target element into the viewport center
  // =========================================================================
  useEffect(() => {
    if (isOpen && activeTab === "tour") {
      const step = activeSteps[currentStep];
      const selector = step?.selector;
      if (selector) {
        const timer = setTimeout(() => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
          }
        }, 180);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, isOpen, activeTab, activeSteps]);


  const handleStartTour = () => {
    setShowWelcomeCard(false);
    setIsOpen(true);
    setActiveTab("tour");
    setCurrentStep(0);
    setIsActionCompleted(false);
  };

  const handleDismissWelcome = async () => {
    setShowWelcomeCard(false);
    if (user) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/tour-completion`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ welcome_card_dismissed: true }),
        });
        refreshUser();
      } catch (err) {
        console.error("Error updating welcome card dismissal status:", err);
      }
    }
  };

  const markTourAsCompleted = async () => {
    const payload: { [key: string]: boolean } = {};
    if (activeTourMode === "seller") {
      setIsSellerCompleted(true);
      payload.seller_tour_completed = true;
    } else {
      setIsExplorerCompleted(true);
      payload.explorer_tour_completed = true;
    }
    setIsOpen(false);

    if (user) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/tour-completion`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, welcome_card_dismissed: true }),
        });
        refreshUser();
      } catch (err) {
        console.error("Error updating tour completion status:", err);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      markTourAsCompleted();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipTour = () => {
    markTourAsCompleted();
  };

  const handleFeatureNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const clipPathStyle = useMemo(() => {
    if (!spotlightRect || !isOpen || activeTab !== "tour") return {};

    const left = spotlightRect.left - 6;
    const top = spotlightRect.top - 6;
    const right = spotlightRect.left + spotlightRect.width + 6;
    const bottom = spotlightRect.top + spotlightRect.height + 6;

    return {
      clipPath: `polygon(
        0% 0%, 
        100% 0%, 
        100% 100%, 
        0% 100%, 
        0% 0%, 
        ${left}px ${top}px, 
        ${left}px ${bottom}px, 
        ${right}px ${bottom}px, 
        ${right}px ${top}px, 
        ${left}px ${top}px
      )`
    };
  }, [spotlightRect, isOpen, activeTab]);

  const filteredFeatures = useMemo(() => {
    return FEATURE_CATALOG.filter(feature => {
      const matchesSearch = 
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = 
        selectedDifficulty === "All" || 
        feature.difficulty === selectedDifficulty;
      
      const matchesMode = 
        selectedModeFilter === "All" ||
        feature.mode === selectedModeFilter.toLowerCase() ||
        feature.mode === "both";

      return matchesSearch && matchesDifficulty && matchesMode;
    });
  }, [searchQuery, selectedDifficulty, selectedModeFilter]);

  if (isTourCompleted && !isOpen) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Pulsing Floating Action Beacon Button (Bottom Right) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end pointer-events-none">
        
        {/* Onboarding Welcome Card (Auto-opens on first visit) */}
        {showWelcomeCard && (
          <div className="pointer-events-auto mb-4 w-76 rounded-xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-500 relative">
            <button 
              onClick={handleDismissWelcome}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
              aria-label="Close welcome card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse animate-spin-slow" />
              <h4 className="font-extrabold text-[11px] tracking-wide text-sky-300 uppercase">
                Interactive Onboarding
              </h4>
            </div>
            
            <h3 className="text-[13px] font-extrabold mb-1 leading-snug">
              Tour {activeTourMode === "seller" ? "Seller" : "Explorer"} workspace live!
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              I will highlight exact buttons and sidebar options on your screen for hands-on, live training.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleStartTour}
                className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-[10px] font-extrabold transition duration-300 shadow-md flex items-center justify-center space-x-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Live Guide</span>
              </button>
              <button
                onClick={() => {
                  setShowWelcomeCard(false);
                  setIsOpen(true);
                  setActiveTab("catalog");
                }}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition duration-300 text-slate-300 border border-white/5"
              >
                Catalog
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (showWelcomeCard) setShowWelcomeCard(false);
          }}
          className="pointer-events-auto group relative flex items-center justify-center p-3 rounded-full bg-gradient-to-tr from-[#003366] to-[#0072ff] hover:from-[#002244] hover:to-[#0055cc] text-white shadow-xl shadow-sky-500/20 hover:scale-105 transition-all duration-300 focus:outline-none"
          title="Guided Onboarding Assistant"
        >
          <span className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping duration-1000 pointer-events-none" />
          {isOpen ? (
            <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <HelpCircle className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Interactive Spotlight Mask (Prevents clicking outside, lets target click through) */}
      {/* ========================================================================= */}
      {isOpen && activeTab === "tour" && spotlightRect && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/70 z-[9985] transition-all duration-300"
            style={clipPathStyle}
          />
          <div 
            className="fixed rounded-xl border-2 border-dashed border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] pointer-events-none z-[9986] transition-all duration-300"
            style={{
              top: spotlightRect.top - 6,
              left: spotlightRect.left - 6,
              width: spotlightRect.width + 12,
              height: spotlightRect.height + 12,
            }}
          />
        </>
      )}

      {/* Background Mask */}
      {isOpen && (activeTab !== "tour" || !spotlightRect) && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[9980]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. Interactive Floating Tooltip Dialog Balloon */}
      {/* ========================================================================= */}
      {isOpen && (
        <div 
          style={dialogStyle}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 text-slate-100 rounded-xl shadow-2xl p-4 flex flex-col scale-in duration-200 transition-all z-[9999] relative overflow-hidden"
        >
          {/* SATISFYING GAMIFIED COMPLETION FLASH OVERLAY */}
          {isActionCompleted && (
            <div className="absolute inset-0 bg-[#091a14]/95 border border-emerald-500/10 flex flex-col items-center justify-center text-center space-y-2 z-[20] rounded-xl animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
              <div>
                <p className="font-extrabold text-xs text-emerald-300 tracking-wide">Action Completed!</p>
                <p className="text-[9px] text-emerald-400/70 font-medium tracking-wide uppercase mt-0.5">
                  {activeSteps[currentStep]?.successMessage || "Step Completed!"}
                </p>
              </div>
            </div>
          )}

          {/* Stepper pointer arrow */}
          {arrowDir && (
            <div 
              style={arrowStyle}
              className={`absolute w-2.5 h-2.5 bg-slate-900 border-white/10 rotate-45 pointer-events-none transition-all ${
                arrowDir === "up" ? "-top-[5px] border-t border-l" :
                arrowDir === "down" ? "-bottom-[5px] border-b border-r" :
                arrowDir === "left" ? "-left-[5px] border-b border-l" :
                " -right-[5px] border-t border-r"
              }`}
            />
          )}

          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse animate-spin-slow" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-sky-300">
                Guide ({currentStep + 1}/{activeSteps.length})
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  setActiveTab(activeTab === "tour" ? "catalog" : "tour");
                  setSearchQuery("");
                }}
                className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md text-slate-300 font-bold transition flex items-center space-x-1"
              >
                {activeTab === "tour" ? (
                  <>
                    <BookOpen className="w-3 h-3" />
                    <span>Catalog</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Dynamic CONTENT 1: Guided Tour Balloon */}
          {/* ========================================================================= */}
          {activeTab === "tour" && (
            <div className="flex flex-col flex-1 min-h-0">
              
              {/* Scrollable Body Container to prevent tall cards from going off-screen */}
              <div className={`overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0 ${activeSteps[currentStep]?.videoPath ? "max-h-[250px]" : "max-h-[190px]"}`}>
                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-[13px] text-white leading-snug">
                    {activeSteps[currentStep]?.title || ""}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {activeSteps[currentStep]?.description || ""}
                  </p>
                </div>

                {/* Optional tutorial video player */}
                {activeSteps[currentStep]?.videoPath && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40 shadow-inner group/video mt-2">
                    <video
                      key={activeSteps[currentStep].videoPath}
                      src={activeSteps[currentStep].videoPath}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* LIVE USER ACTION GUIDANCE BOX (ACCENT LEFT BORDER) */}
                <div className="border-l-2 border-sky-400 pl-3 bg-white/5 py-1.5 pr-2 rounded-r-lg text-[10.5px] leading-relaxed text-sky-200">
                  <span className="font-bold text-sky-300 mr-1">Action:</span>
                  {activeSteps[currentStep]?.actionInstruction || ""}
                </div>
              </div>

              {/* Control Buttons Footer (Pinned at the bottom) */}
              <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={handleSkipTour}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition"
                >
                  Skip Tour
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className={`p-1.5 rounded-lg border border-white/5 text-[10px] font-bold flex items-center transition ${
                      currentStep === 0 
                        ? "opacity-30 cursor-not-allowed bg-slate-900/20 text-slate-600" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-[10px] font-extrabold text-white shadow-md transition duration-200 flex items-center space-x-1"
                  >
                    <span>
                      {currentStep === activeSteps.length - 1 ? "Finish" : "Next"}
                    </span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* Dynamic CONTENT 2: Searchable Feature Directory Catalog */}
          {/* ========================================================================= */}
          {activeTab === "catalog" && (
            <div className="flex flex-col max-h-[260px] overflow-y-auto pr-1">
              
              {/* Search Inputs */}
              <div className="space-y-2.5 pb-2.5 border-b border-white/5 mb-2.5">
                <SmartSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search SaaS features..."
                  inputClassName="bg-slate-950 border border-white/10 rounded-lg py-1 text-[10.5px] text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
                  dictionary={FEATURE_CATALOG.map(f => f.title)}
                  maxSuggestions={5}
                />

                <div className="flex items-center justify-between text-[8px] gap-2">
                  <div className="flex bg-slate-950 p-0.5 rounded border border-white/5">
                    {["All", "Explorer", "Seller"].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setSelectedModeFilter(m)}
                        className={`px-1.5 py-0.5 rounded font-bold transition ${selectedModeFilter === m ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-slate-950 p-0.5 rounded border border-white/5">
                    {["All", "Beginner", "Advanced"].map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedDifficulty(d === "Advanced" ? "Advanced" : d === "Beginner" ? "Beginner" : "All")}
                        className={`px-1.5 py-0.5 rounded font-bold transition ${
                          (d === "All" && selectedDifficulty === "All") || 
                          (d === "Beginner" && selectedDifficulty === "Beginner") ||
                          (d === "Advanced" && selectedDifficulty === "Advanced")
                            ? 'bg-slate-900 text-white' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Catalog list container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[170px] custom-scrollbar">
                {filteredFeatures.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">No matching features found.</p>
                ) : (
                  filteredFeatures.map(feat => {
                    const FeatIcon = feat.icon;
                    return (
                      <div 
                        key={feat.id}
                        className="group rounded-lg border border-white/5 bg-slate-950/20 p-2.5 hover:bg-slate-950/40 transition-all duration-200 space-y-1.5 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FeatIcon className="w-3.5 h-3.5 text-sky-400" />
                            <h4 className="font-extrabold text-[11px] text-white group-hover:text-sky-300 transition duration-200">
                              {feat.title}
                            </h4>
                          </div>
                          <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">
                            {feat.mode}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-normal">
                          {feat.description}
                        </p>

                        <div className="p-1 bg-slate-950 border-l border-indigo-400 rounded text-[8.5px] text-slate-400 italic">
                          <strong>💡 Tip: </strong>{feat.tip}
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleFeatureNavigate(feat.path)}
                            className="text-[9px] font-extrabold text-sky-400 hover:text-sky-300 flex items-center space-x-0.5 group/btn"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </>
  );
}
