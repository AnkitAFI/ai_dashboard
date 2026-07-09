import React from 'react';
import { 
  Target, MessageCircle, TrendingUp, Bell, 
  TrendingDown, Search, Clock, ShoppingBag, 
  BarChart3, Smartphone, Zap, Star
} from "lucide-react";

export interface SolutionFeature {
  icon: string; // We'll map strings to actual components in the template
  title: string;
  desc: string;
  bullets: string[];
  scenario: string;
  link: string;
  linkLabel: string;
  color: string;
}

export interface ComparisonRow {
  feature: string;
  insydz: string;
  others: string;
}

export interface RoiRow {
  label: string;
  value: string;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface SolutionData {
  slug: string;
  badge: string;
  hero: {
    titlePrefix: string;
    gradientTitle: string;
    titleSuffix: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  heroVisual: {
    productName: string;
    alertTitle: string;
    alertDesc: string;
    alertSub: string;
    whatsappTitle: string;
    whatsappDesc: string;
    badgeLabel: string;
  };
  painPoints: {
    titlePrefix: string;
    redTitle: string;
    titleSuffix: string;
    description: string;
    items: { icon: string; title: string; color: string; }[];
    statLarge: string;
    statSub: string;
  };
  differentiation: {
    titlePrefix: string;
    redTitle: string;
    titleSuffix: string;
    description: string;
    table: ComparisonRow[];
    compareLink: string;
    compareLinkLabel: string;
  };
  coreFeatures: {
    titlePrefix: string;
    gradientTitle: string;
    titleSuffix: string;
    description: string;
    items: SolutionFeature[];
  };
  howItWorks: {
    titlePrefix: string;
    gradientTitle: string;
    titleSuffix: string;
    description: string;
    steps: { 
      step: string; 
      title: string; 
      desc?: string; 
      icon?: string; 
      color?: string; 
      bullets?: (string | { text: string; color: string; })[];
      bg?: string;
    }[];
  };
  statsBar?: {
    title: string;
    subtitle: string;
    items: { stat: string; label: string; icon: string; }[];
  };
  extraFeatures?: {
    title: string;
    description: string;
    items: { icon: string; title: string; desc: string; }[];
  };
  roi: {
    titlePrefix: string;
    orangeTitle: string;
    leakageTitle: string;
    recoveryTitle: string;
    leakageRows: RoiRow[];
    recoveryRows: RoiRow[];
    leakageTotal: string;
    recoveryTotal: string;
    netValue: string;
    netSub: string;
  };
  faqs: FAQItem[];
  finalCta: {
    title: string;
    description: string;
    cards: { label: string; desc: string; cta: string; href: string; }[];
    buttonText: string;
  };
  theme: {
    accent: "orange" | "blue" | "cyan" | "purple";
    gradient: string;
    border: string;
  };
}

export interface SolutionIndexData {
  hero: {
    badge: string;
    titlePrefix: string;
    gradientTitle: string;
    description: string;
    descriptionSecondary: string;
    primaryCta: string;
    secondaryCta: string;
    solutions: { title: string; sub: string; grad: string; icon: string; }[];
  };
  problems: {
    titlePrefix: string;
    orangeTitle: string;
    description: string;
    secondaryText: string;
    listTitle: string;
    items: string[];
    bottomStat: string;
    bottomSub: string;
  };
  solutionsGrid: {
    titlePrefix: string;
    gradientTitle: string;
    description: string;
    items: {
      id: string;
      title: string;
      subtitle: string;
      whoItsFor: string;
      pain: string;
      problems: string[];
      outcome: string;
      link: string;
      color: string;
      icon: string;
    }[];
  };
  caseStudies: {
    titlePrefix: string;
    gradientTitle: string;
    description: string;
    items: { type: string; problem: string; outcome: string; icon: string; color: string; }[];
  };
  advantages: {
    titlePrefix: string;
    gradientTitle: string;
    description: string;
    items: { icon: string; title: string; desc: string; color: string; }[];
    bottomText: string;
  };
  roi: {
    titlePrefix: string;
    orangeTitle: string;
    scenario: string;
    rows: { without: string; with: string; }[];
    summary: string;
    summaryBold: string;
  };
  quickGuide: {
    titlePrefix: string;
    orangeTitle: string;
    description: string;
    items: { condition: string; solution: string; link: string; }[];
  };
  faqs: { id: string; q: string; a: string; }[];
  finalCta: {
    titlePrefix: string;
    titleBold: string;
    description: string;
    cards: { label: string; desc: string; cta: string; href: string; }[];
    buttonText: string;
  };
}

export const SOLUTIONS_DATA: Record<string, SolutionData> = {
  "amazon-sellers": {
    slug: "amazon-sellers",
    badge: "Amazon Seller Analytics Tool",
    hero: {
      titlePrefix: "Stop Guessing on Amazon.",
      gradientTitle: "Sell Smarter",
      titleSuffix: "with Real-Time Seller Intelligence.",
      description: "Insydz is India's most comprehensive Amazon seller analytics tool built for sellers doing ₹5L to ₹50L a month. Track competitors, decode reviews, and fix keyword rankings without expensive foreign tools or manual Excel work.",
      primaryCta: "Start Free for Amazon Sellers",
      secondaryCta: "See How It Works →",
    },
    heroVisual: {
      productName: "Premium Wireless Earbuds",
      alertTitle: "Competitor Price Drop Alert!",
      alertDesc: "Top competitor reduced price by 12%",
      alertSub: "₹1,999 → ₹1,759",
      whatsappTitle: "WhatsApp Alert Sent",
      whatsappDesc: "Instant notification on your phone",
      badgeLabel: "Live Tracking",
    },
    painPoints: {
      titlePrefix: "Why Most Amazon Sellers",
      redTitle: "Lose Money",
      titleSuffix: "(Without Realising It)",
      description: "You're doing everything right running ads, maintaining inventory, writing listings. But a handful of invisible problems are quietly eating into your margins every single month.",
      items: [
        { icon: "TrendingDown", title: "You don't know when competitors change prices until it's too late", color: "from-red-500 to-orange-500" },
        { icon: "MessageCircle", title: "You discover bad reviews days after your sales have already dropped", color: "from-orange-500 to-yellow-500" },
        { icon: "Search", title: "You guess keywords instead of tracking where your rankings actually stand", color: "from-yellow-500 to-orange-500" },
        { icon: "Clock", title: "Manual tracking wastes 8–12 hours every week that should go toward growing", color: "from-orange-500 to-red-500" },
      ],
      statLarge: "Most Amazon sellers lose 15–30% of profit every month",
      statSub: "due to late pricing decisions, ignored review signals, and poor keyword visibility none of which show up in your Seller Central dashboard.",
    },
    differentiation: {
      titlePrefix: "Foreign Tools Were",
      redTitle: "Never Built for Indian Sellers",
      titleSuffix: "",
      description: "Tools like Helium 10 and Jungle Scout are excellent for Amazon.com. But if you're selling on Amazon India, you're paying for data that doesn't match your market, your categories, or your pricing reality.",
      table: [
        { feature: "Amazon India data accuracy", insydz: "✓ Native Amazon.in data", others: "⚠ Limited / inaccurate" },
        { feature: "INR pricing & Indian categories", insydz: "✓ Full INR support", others: "✗ USD-based only" },
        { feature: "WhatsApp alerts", insydz: "✓ Real-time WhatsApp", others: "✗ Email only" },
        { feature: "AI pricing recommendations", insydz: "✓ AI-driven", others: "⚠ Manual rules only" },
        { feature: "Review mining for Indian context", insydz: "✓ India-specific AI", others: "⚠ Generic analysis" },
        { feature: "Pricing", insydz: "✓ Free plan + INR tiers", others: "✗ $99–$399/month USD" },
      ],
      compareLink: "/compare/insydzvshelium",
      compareLinkLabel: "See full Helium 10 comparison →",
    },
    coreFeatures: {
      titlePrefix: "Your Amazon Seller Intelligence Brain",
      gradientTitle: "Built for India",
      titleSuffix: "",
      description: "Insydz is not another dashboard. It's an AI-powered decision engine. Instead of showing you numbers, it tells you exactly what to do and when to do it.",
      items: [
        {
          icon: "Target",
          title: "Automatic Competitor Tracking",
          desc: "Monitor 100+ competitors across your Amazon India category without lifting a finger. Insydz watches price changes, new entrants, and stock levels 24/7.",
          bullets: ["Real-time price drop detection (not delayed reports)", "Stock-out alerts for top competitors", "New competitor launch notifications", "Price history charts for any product on Amazon.in"],
          scenario: "Your competitor drops from ₹899 to ₹749 at 11pm. Insydz sends you a WhatsApp alert at 11:02pm. You reprice by morning — before your Buy Box rank slips.",
          link: "/features/competitor-price-tracking-feature",
          linkLabel: "See Amazon price tracker features →",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: "MessageCircle",
          title: "AI-Powered Review Insights",
          desc: "Stop reading 500 reviews one by one. Insydz's AI reads all your reviews and your competitors' reviews, then tells you what customers actually want and what's hurting your sales.",
          bullets: ["Surface top complaints before they become 1-star ratings", "See which product attributes drive 5-star scores", "Compare your review sentiment vs. top competitors", "Identify review patterns tied to returns or refund spikes"],
          scenario: "342 reviews mention 'packaging breaks in transit.' You fix it. Your returns drop 18% and ratings recover within 3 weeks.",
          link: "/features/review-analytics-feature",
          linkLabel: "Explore review intelligence →",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: "TrendingUp",
          title: "Pricing AI & SEO Recommendations",
          desc: "Insydz doesn't just show you prices it tells you the exact price to set based on competitor moves, your margin floor, and keyword ranking impact. Your all-in-one Amazon seller tool for pricing and SEO, combined.",
          bullets: ["AI calculates optimal price against your cost of goods", "Keyword rank tracking across Amazon India search pages", "Title and bullet point SEO suggestions in plain Hindi/English", "Ranking recovery playbook when positions drop"],
          scenario: "Keyword 'wireless earbuds under 1500' drops from rank #5 to #18. Insydz alerts you and recommends: lower price by ₹80, add keyword in bullet point 2. Rank recovers to #7 in 4 days.",
          link: "/features/keyword-rank-tracking-feature",
          linkLabel: "Explore Amazon keyword rank tracker →",
          color: "from-orange-500 to-red-500",
        },
        {
          icon: "Bell",
          title: "Instant WhatsApp Alerts",
          desc: "Email gets ignored. WhatsApp gets opened. Insydz sends real-time intelligence directly to your phone so you act in minutes, not days. This is the alert system Indian sellers have always needed.",
          bullets: ["Competitor price drops → instant WhatsApp alert", "Keyword rank slip → WhatsApp with recommended fix", "New negative review surge → alert + AI summary", "Configurable thresholds — no alert spam"],
          scenario: "You're at a trade fair in Surat. Competitor drops price. Your phone buzzes. You check Insydz, reprice from mobile. No lost sales, no panic.",
          link: "/features/whatsapp-alerts-feature",
          linkLabel: "See WhatsApp alerts feature →",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
    howItWorks: {
      titlePrefix: "How Insydz Works",
      gradientTitle: "for Amazon Sellers",
      titleSuffix: "",
      description: "You don't need a tech team. Setup takes 2 minutes. Intelligence starts flowing immediately.",
      steps: [
        { step: "1", title: "Connect Store", desc: "Connect your Amazon account or add ASINs. Insydz automatically begins tracking your entire category.", icon: "ShoppingBag", color: "bg-orange-100 text-orange-600" },
        { step: "2", title: "AI Analysis", desc: "Our AI scans prices, reviews, and rankings across Amazon India 24/7. No manual Excel work required.", icon: "BarChart3", color: "bg-purple-100 text-purple-600" },
        { step: "3", title: "Actionable Steps", desc: "Get direct, plain-language instructions on price changes, rank drops, and review issues on WhatsApp.", icon: "Zap", color: "bg-green-100 text-green-600" },
      ],
    },
    roi: {
      titlePrefix: "What Insydz Is Worth to a Seller",
      orangeTitle: "Doing ₹15L/Month",
      leakageTitle: "Monthly Profit Leakage",
      recoveryTitle: "Monthly Recovery",
      leakageRows: [
        { label: "Late repricing (avg 3-day lag)", value: "−₹45,000" },
        { label: "Missed review issues (1-star surge)", value: "−₹30,000" },
        { label: "Keyword rank drops (from #5 to #22)", value: "−₹38,000" },
        { label: "Manual tracking hours (12 hrs/week)", value: "−₹20,000" },
      ],
      recoveryRows: [
        { label: "Repricing within 15 minutes", value: "+₹38,000" },
        { label: "Review fixes before sales drop", value: "+₹24,000" },
        { label: "Keyword rank recovery", value: "+₹32,000" },
        { label: "Time saved → reinvested in growth", value: "+₹18,000" },
      ],
      leakageTotal: "−₹1,33,000",
      recoveryTotal: "+₹1,12,000",
      netValue: "₹2,45,000 / month",
      netSub: "Conservative estimate based on actual seller data from Amazon India",
    },
    faqs: [
      { id: "faq-1", q: "What is the best Amazon seller analytics tool in India?", a: "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly." },
      { id: "faq-2", q: "How does Insydz track competitor prices on Amazon India?", a: "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales." },
      { id: "faq-3", q: "Can Insydz help me improve my Amazon keyword rankings?", a: "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one." },
      { id: "faq-4", q: "Is Insydz suitable for small sellers or beginners on Amazon India?", a: "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs." },
      { id: "faq-5", q: "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?", a: "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts." },
      { id: "faq-6", q: "Does Insydz work for D2C brands and Amazon agencies in India?", a: "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features." },
      { id: "faq-7", q: "What makes Insydz's review analysis different from manual reading?", a: "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week." },
    ],
    finalCta: {
      title: "Ready to Stop Losing Money on Amazon?",
      description: "Join thousands of Indian sellers who use Insydz to recover profits and scale their Amazon business.",
      cards: [
        { label: "New Sellers", desc: "Just starting? Get free category insights.", cta: "Start Free", href: "/signup" },
        { label: "Growing Sellers", desc: "Scale with AI pricing and SEO.", cta: "View Pricing", href: "/pricing" },
        { label: "Agencies", desc: "Manage portfolios with ease.", cta: "Book Demo", href: "/demo" },
      ],
      buttonText: "Start Free for Amazon Sellers",
    },
    theme: {
      accent: "orange",
      gradient: "from-orange-500 via-red-500 to-orange-600",
      border: "border-orange-600",
    },
  },
  "flipkart-sellers": {
    slug: "flipkart-sellers",
    badge: "Flipkart Seller Analytics Tool",
    hero: {
      titlePrefix: "Dominate Flipkart.",
      gradientTitle: "Win with Data,",
      titleSuffix: "Not Guesswork.",
      description: "Insydz is India's most powerful Flipkart seller analytics tool built for full-time sellers doing ₹5L to ₹50L a month. Track competitors, decode reviews, and recover keyword rankings with AI-powered insights built for the Indian market.",
      primaryCta: "Start Free for Flipkart Sellers",
      secondaryCta: "See How It Works →",
    },
    heroVisual: {
      productName: "Smart LED Bulb Pack",
      alertTitle: "Competitor Price Drop Alert!",
      alertDesc: "Top seller reduced price by 15%",
      alertSub: "₹899 → ₹764",
      whatsappTitle: "WhatsApp Alert Sent",
      whatsappDesc: "Instant notification delivered",
      badgeLabel: "Live Tracking",
    },
    painPoints: {
      titlePrefix: "Why Flipkart Sellers",
      redTitle: "Leave Money on the Table",
      titleSuffix: "",
      description: "Without real-time intelligence, you're flying blind. The Flipkart marketplace moves fast competitor prices shift overnight, review scores drop silently, and rankings slip while you're busy managing operations.",
      items: [
        { icon: "TrendingDown", title: "Competitors change prices while you sleep and steal your sales rank", color: "from-red-500 to-orange-500" },
        { icon: "MessageCircle", title: "Bad reviews reveal problems too late after orders and ratings have already dropped", color: "from-orange-500 to-yellow-500" },
        { icon: "Search", title: "Keyword rankings drop unnoticed you only find out when traffic disappears", color: "from-blue-500 to-indigo-500" },
        { icon: "Clock", title: "Hours wasted on manual tracking that should be spent growing your business", color: "from-indigo-500 to-purple-500" },
      ],
      statLarge: "Flipkart sellers lose 15–30% of profit annually",
      statSub: "due to delayed pricing decisions, untracked reviews, and poor keyword visibility none of which your Flipkart Seller Hub shows you.",
    },
    differentiation: {
      titlePrefix: "Your Flipkart Seller Hub Shows Your Data.",
      redTitle: "Insydz Shows Your Competitors'.",
      titleSuffix: "",
      description: "Flipkart Seller Hub is great for tracking your own orders and returns. But it tells you nothing about what your competitors are doing or why your ranking is falling. That intelligence gap is costing you lakhs every month.",
      table: [
        { feature: "Competitor price tracking (real-time)", insydz: "✓", others: "✗" },
        { feature: "Keyword ranking on Flipkart search", insydz: "✓ Daily tracking", others: "✗ No data" },
        { feature: "Review analysis & sentiment AI", insydz: "✓ Root-cause", others: "⚠ Raw reviews only" },
        { feature: "AI pricing recommendations (INR)", insydz: "✓", others: "✗" },
        { feature: "WhatsApp alerts", insydz: "✓ Real-time", others: "✗" },
        { feature: "Competitive intelligence", insydz: "✓ Full market", others: "✗ Your store only" },
      ],
      compareLink: "/compare/insydzvshelium",
      compareLinkLabel: "See how Insydz compares to other Flipkart seller tools",
    },
    coreFeatures: {
      titlePrefix: "Meet Insydz",
      gradientTitle: "Flipkart Intelligence Partner",
      titleSuffix: "",
      description: "Insydz is not a reporting tool. It's an AI decision engine built specifically for Indian Flipkart sellers. We don't just track data we tell you exactly what actions to take to win.",
      items: [
        {
          icon: "Target",
          title: "1. Automated Competitor Monitoring",
          desc: "Track 100+ competitors in your Flipkart category effortlessly. Insydz watches every price change, stock movement, and new seller entry so your Flipkart seller dashboard always shows the full competitive picture.",
          bullets: ["Real-time competitor price drop detection on Flipkart", "Stock-out alerts capitalise when rivals run dry", "New seller entry notifications in your category", "Flipkart price history tracking for any product"],
          scenario: "A seller in Pune was losing sales every Monday morning. Insydz revealed a competitor was running a Sunday night flash price drop. He set a WhatsApp alert threshold and now reprices before dawn. Sales rank recovered within a week.",
          link: "/features/competitor-price-tracking-feature",
          linkLabel: "See Flipkart price tracker features →",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: "MessageCircle",
          title: "2. AI Review Intelligence",
          desc: "Stop scrolling through hundreds of Flipkart reviews manually. Insydz's AI reads every review yours and your competitors' and tells you exactly what's hurting your rating and what's driving purchases.",
          bullets: ["Surface recurring complaints before they become 1-star trends", "See what drives 5-star reviews in your category", "Compare sentiment scores vs. your top 5 competitors", "Link review patterns to return spikes and refund requests"],
          scenario: "189 Flipkart reviews for a seller's LED bulbs mentioned 'box damaged in delivery.' Insydz flagged it. The seller upgraded packaging. Returns dropped 22% in 30 days and rating climbed from 3.8 to 4.3.",
          link: "/features/review-analytics-feature",
          linkLabel: "Explore review intelligence →",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: "TrendingUp",
          title: "3. Smart Pricing & SEO Recommendations",
          desc: "Flipkart performance analytics go beyond dashboards with Insydz. The AI calculates the exact price you should set based on your margin floor, competitor moves, and keyword ranking impact then guides your listing SEO to recover lost visibility.",
          bullets: ["AI-recommended prices based on your cost of goods in INR", "Keyword rank tracking across Flipkart search results daily", "Listing title and bullet optimisation suggestions", "Flipkart product analysis showing which attributes win search"],
          scenario: "A home décor seller's keyword 'led strip lights for bedroom' slipped from rank #6 to #24 on Flipkart. Insydz sent an alert with two specific fixes a ₹60 price reduction and a title tweak. Rank recovered to #9 within 5 days.",
          link: "/features/keyword-rank-tracking-feature",
          linkLabel: "Explore Flipkart keyword rank tracker →",
          color: "from-orange-500 to-red-500",
        },
        {
          icon: "Bell",
          title: "4. WhatsApp Alerts Real-Time Notifications You'll Actually See",
          desc: "Indian sellers don't live in their email inbox. Insydz sends intelligence directly to your WhatsApp so you act on Flipkart market changes in minutes, not days. Configure your thresholds and let Insydz guard your business around the clock.",
          bullets: ["Competitor price drop → WhatsApp alert in seconds", "Keyword ranking slip → alert with recommended fix", "Negative review surge → instant AI summary on WhatsApp", "Stock-out opportunity alert for top competitors"],
          scenario: "A Mumbai seller was travelling when a competitor slashed prices on Flipkart Big Billion Days eve. Insydz WhatsApp alert arrived within 90 seconds. He repriced from his phone. Saved an estimated ₹80,000 in potential lost sales that weekend.",
          link: "/features/whatsapp-alerts-feature",
          linkLabel: "See WhatsApp alerts feature →",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
    howItWorks: {
      titlePrefix: "How Insydz Works",
      gradientTitle: "for Flipkart Sellers",
      titleSuffix: "",
      description: "No technical setup. No learning curve. Start getting Flipkart intelligence in under 2 minutes.",
      steps: [
        { step: "1", title: "Connect Your Flipkart Store", desc: "Link your Flipkart seller account or add your product listings. Insydz automatically maps your catalogue, identifies your top competitors, and begins category-level tracking instantly.", icon: "Store", color: "bg-blue-100 text-blue-600" },
        { step: "2", title: "AI Analyses Market Data", desc: "Our AI continuously scans Flipkart for pricing changes, review patterns, keyword ranking shifts, and competitor strategies 24/7, in real time. No manual work. No spreadsheets.", icon: "BarChart3", color: "bg-purple-100 text-purple-600" },
        { step: "3", title: "Get Actionable Insights", desc: "Instead of graphs and reports, you get plain-language actions delivered to your phone: Competitor price drops, ranking slips, and review summaries.", icon: "Zap", color: "bg-green-100 text-green-600" },
      ],
    },
    roi: {
      titlePrefix: "What Insydz Is Worth to a",
      orangeTitle: "Flipkart Seller Doing ₹12L/Month",
      leakageTitle: "Without Insydz — Monthly Profit Leakage",
      recoveryTitle: "With Insydz — Monthly Recovery",
      leakageRows: [
        { label: "Late repricing (avg 2–3 day lag)", value: "−₹36,000" },
        { label: "Untracked review drop (rating 4.1→3.6)", value: "−₹28,000" },
        { label: "Keyword rank slip (#4→#19)", value: "−₹34,000" },
        { label: "Manual tracking (10 hrs/week wasted)", value: "−₹16,000" },
      ],
      recoveryRows: [
        { label: "Repricing within 15 minutes of alert", value: "+₹30,000" },
        { label: "Review fixes before rating tanks", value: "+₹22,000" },
        { label: "Keyword rank recovery (AI-guided)", value: "+₹28,000" },
        { label: "Hours saved → growth reinvested", value: "+₹14,000" },
      ],
      leakageTotal: "−₹1,14,000",
      recoveryTotal: "+₹94,000",
      netValue: "₹2,08,000 / month",
      netSub: "A conservative breakdown of what Indian Flipkart sellers recover when they have real-time intelligence instead of guesswork.",
    },
    faqs: [
      { id: "faq-1", q: "What is the best Flipkart seller analytics tool in India?", a: "Insydz is India's most comprehensive Flipkart seller analytics tool, designed specifically for Flipkart.com sellers. It tracks competitor pricing in INR, analyses reviews with AI, monitors keyword rankings on Flipkart, and delivers instant WhatsApp alerts — giving you actionable intelligence that your Flipkart Seller Hub cannot provide." },
      { id: "faq-2", q: "How does Insydz help Flipkart sellers track competitor prices?", a: "Insydz monitors 100+ competitors in your Flipkart category continuously. The moment any competitor adjusts their price, you receive a WhatsApp alert with the exact before/after figures and a suggested response — so you act within minutes, before your sales rank is affected." },
      { id: "faq-3", q: "Can Insydz improve my keyword rankings on Flipkart?", a: "Yes. Insydz tracks your search keyword positions on Flipkart daily. When rankings slip, you get an alert and specific listing or pricing recommendations to recover visibility. It functions as both a Flipkart performance analytics tool and an SEO optimisation assistant in one place." },
      { id: "faq-4", q: "How is Insydz different from Flipkart Seller Hub analytics?", a: "Flipkart Seller Hub shows you what's happening inside your own store. Insydz shows you what's happening across your entire market — competitors' pricing, their review trends, their keyword positions. The Hub tells you what happened. Insydz tells you what to do next." },
      { id: "faq-5", q: "Is Insydz useful for small or new Flipkart sellers?", a: "Absolutely. The free plan requires no credit card and takes 2 minutes to activate. New sellers immediately gain access to competitor pricing data and product analysis for their category — intelligence that used to require hours of manual research or expensive tools." },
      { id: "faq-6", q: "Does Insydz work during Flipkart Big Billion Days and sale events?", a: "This is exactly where Insydz delivers the highest value. During high-velocity sale events, competitor prices can change dozens of times a day. Insydz monitors continuously and delivers WhatsApp alerts within seconds — so you're never caught off guard during your most important selling windows of the year." },
      { id: "faq-7", q: "What Flipkart-specific problems does Insydz solve?", a: "Insydz addresses four core Flipkart seller problems: slow response to competitor price drops, undetected review quality deterioration, invisible keyword ranking slippage, and time wasted on manual market tracking. All four are automated — delivered to your WhatsApp as clear, actionable alerts." },
    ],
    finalCta: {
      title: "Ready to Win on Flipkart?",
      description: "Join smart Flipkart sellers who use data, not guesswork, to grow their business whatever stage you're at.",
      cards: [
        { label: "For New Sellers", desc: "Just starting on Flipkart? Get competitor intelligence and product insights from day one. The free plan costs nothing and gives you an unfair data advantage over sellers still doing things manually.", cta: "Start Free No Card Needed", href: "/signup" },
        { label: "For Growing Sellers", desc: "Scaling to ₹5L–₹50L monthly? At your revenue level, every pricing delay and ranking drop is real money lost. The Growth Plan delivers full Flipkart competitor tracking, AI pricing, review intelligence, and WhatsApp alerts.", cta: "Try Growth Plan", href: "/pricing" },
        { label: "For Agencies", desc: "Managing multiple Flipkart brands? Multi-account tracking, portfolio-level intelligence, and white-label reporting built for agencies and brand managers running Flipkart operations at scale.", cta: "Book a Demo", href: "/solutions/ecommerce-agencies" },
      ],
      buttonText: "Start Free for Flipkart Sellers",
    },
    theme: {
      accent: "blue",
      gradient: "from-blue-600 via-indigo-600 to-blue-700",
      border: "border-blue-600",
    },
  },
  "ecommerce-agencies": {
    slug: "ecommerce-agencies",
    badge: "Ecommerce Analytics Platform for Agencies",
    hero: {
      titlePrefix: "Scale Your Agency.",
      gradientTitle: "Deliver Results",
      titleSuffix: "That Wow Clients.",
      description: "Insydz is India's most powerful ecommerce analytics platform for agencies built to manage multiple clients effortlessly. Deliver data-driven strategies that drive real ROI, automate competitive intelligence across Amazon and Flipkart, and keep clients coming back month after month.",
      primaryCta: "Start Free Agency Account",
      secondaryCta: "See How It Works →",
    },
    heroVisual: {
      productName: "Agency Dashboard",
      alertTitle: "Client Success Alert",
      alertDesc: 'Client "XYZ Brand" sales up 34% this month',
      alertSub: "Your optimisation strategy is working!",
      whatsappTitle: "White-Label Report Ready",
      whatsappDesc: "Monthly performance report generated — 1 click to send",
      badgeLabel: "Multi-Client",
    },
    painPoints: {
      titlePrefix: "Why E-commerce Agencies",
      redTitle: "Struggle to Scale",
      titleSuffix: "",
      description: "Managing multiple clients without the right tools is a recipe for burnout and client churn. Most Indian e-commerce agencies are stuck using a patchwork of spreadsheets, manual tracking, and generic tools that were never built for multi-client management.",
      items: [
        { icon: "Clock", title: "Hours wasted on manual reporting for each client every single month", color: "from-red-500 to-orange-500" },
        { icon: "Eye", title: "Can't track all clients' competitors in real time blind spots everywhere", color: "from-orange-500 to-yellow-500" },
        { icon: "Settings", title: "Switching between 5+ different tools per client kills team productivity", color: "from-cyan-500 to-blue-500" },
        { icon: "TrendingDown", title: "Client churn rises when results aren't communicated with data and proof", color: "from-blue-500 to-indigo-500" },
      ],
      statLarge: "Agencies waste 40–60 hours/month on manual work",
      statSub: "Time that could be spent acquiring new clients, optimising campaigns, or building strategies that actually move the needle.",
    },
    differentiation: {
      titlePrefix: "Generic Ecommerce Tools Were Built",
      redTitle: "for Brands, Not for Agencies",
      titleSuffix: "",
      description: "US-built platforms like Triple Whale or StoreHero were designed for single-brand DTC marketers in the West. They don't support the multi-client, multi-marketplace complexity of Indian e-commerce agencies managing accounts across Amazon.in and Flipkart with all data in INR.",
      table: [
        { feature: "Multi-client dashboard", insydz: "✓ Built-in", others: "✗ Single brand only" },
        { feature: "Indian marketplace data (Amazon.in + Flipkart)", insydz: "✓ Native INR data", others: "✗ US/EU only" },
        { feature: "White-label branded reports", insydz: "✓ Auto-generated", others: "⚠ Limited / paid add-on" },
        { feature: "Competitor intelligence per client", insydz: "✓ Per-client tracking", others: "✗ Not supported" },
        { feature: "Multichannel tracking", insydz: "✓ Amazon + Flipkart", others: "✗ Single channel" },
        { feature: "AI pricing & SEO recommendations", insydz: "✓ Included", others: "✗ Not available" },
        { feature: "Agency volume pricing", insydz: "✓ Volume discounts", others: "✗ Per-seat / per-brand" },
      ],
      compareLink: "/compare/insydzvshelium",
      compareLinkLabel: "Compare Insydz vs. other ecommerce agency software options →",
    },
    coreFeatures: {
      titlePrefix: "Meet Insydz",
      gradientTitle: "Your Agency Growth Engine",
      titleSuffix: "",
      description: "The only ecommerce analytics platform built specifically for Indian agencies managing multiple clients. Deliver premium intelligence without premium overhead and stop trading time for revenue.",
      items: [
        {
          icon: "Layout",
          title: "Unified Multi-Client Dashboard",
          desc: "Manage all client accounts from one central command hub no logging in and out, no switching tabs, no missed alerts. See every client's GMV, competitor movements, keyword rankings, and review trends at a glance.",
          bullets: ["Bird's-eye view of all 12+ client accounts simultaneously", "Client-level performance alerts delivered in one feed", "Filter by client, marketplace (Amazon/Flipkart), or metric", "Custom KPI dashboards per client to track what matters"],
          scenario: "A Delhi-based agency managing 15 Amazon sellers was spending 3 hours every Monday pulling weekly reports. With Insydz's unified dashboard, their account manager now reviews all 15 clients in 25 minutes and spends the rest of Monday building strategy.",
          link: "/features/agency-dashboard",
          linkLabel: "Learn more about this feature →",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: "FileText",
          title: "White-Label Client Reporting",
          desc: "Send clients professional, data-rich monthly reports with your agency's logo auto-generated in one click. No more weekends spent stitching screenshots into PowerPoint decks.",
          bullets: ["Auto-generated monthly and weekly branded reports", "Includes competitor movements, ranking changes, review summaries", "Customisable per client show only what's relevant", "One-click share via email or PDF 10x faster than manual"],
          scenario: "An agency in Bengaluru was losing clients after 3 months because clients couldn't 'see the work.' After switching to Insydz white-label reports, their average client tenure went from 4 months to 14 months. The reports did the retention work.",
          link: "/features/white-label-reporting",
          linkLabel: "Learn more about this feature →",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: "Workflow",
          title: "Automated Client Intelligence Workflows",
          desc: "Set it once, monitor across all accounts. Insydz automates the intelligence gathering your team previously did by hand across every client account, every day, automatically.",
          bullets: ["Automated competitor price alerts per client (WhatsApp + email)", "Keyword ranking reports generated without analyst input", "AI review summaries delivered daily per client account", "Automated pricing and SEO recommendations per product"],
          scenario: "A Mumbai agency cut their analyst headcount requirement from 3 to 1 after deploying Insydz. The same team now manages 22 clients instead of 8 without sacrificing report quality or response time for any account.",
          link: "/features/agency-tools",
          linkLabel: "Learn more about this feature →",
          color: "from-orange-500 to-red-500",
        },
        {
          icon: "Users",
          title: "Team Collaboration & Access Controls",
          desc: "Assign team members to specific clients with role-based permissions. Your account managers see only their clients. Senior staff see everything.",
          bullets: ["Role-based access: Admin, Manager, Analyst, Viewer", "Assign specific clients to specific team members", "Internal notes and task tracking per client", "API access to integrate Insydz data into your agency tech stack"],
          scenario: "A Hyderabad agency onboarded 6 new clients in one quarter without hiring. Using Insydz's team controls, they redistributed client ownership across existing analysts each with their own filtered dashboard view and maintained quality across all accounts.",
          link: "/features/multichannel-tracking",
          linkLabel: "Learn more about this feature →",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
    extraFeatures: {
      title: "Everything Your Agency Needs to Scale Without Limits",
      description: "Built for agencies, not adapted for them. Every feature exists to solve a real problem Indian e-commerce agencies face every day.",
      items: [
        { icon: "Layout", title: "Client Management Dashboard", desc: "Bird's-eye view of all accounts, alerts, and performance no tab-switching" },
        { icon: "FileText", title: "Branded White-Label Reports", desc: "Auto-generated monthly/weekly reports with your logo, one-click delivery" },
        { icon: "Users", title: "Team Access Controls", desc: "Role permissions (Admin, Manager, Analyst, Viewer), client assignment, separated data views" },
        { icon: "Target", title: "Custom Client KPIs", desc: "Unique success metrics per client tracked and reported automatically" },
        { icon: "Sparkles", title: "API Access", desc: "Integrate Insydz data into your existing agency tech stack seamlessly" },
        { icon: "IndianRupee", title: "Agency Pricing Tiers", desc: "Volume discounts and flexible billing as you scale no per-seat surprises" },
      ]
    },
    howItWorks: {
      titlePrefix: "How Insydz Works",
      gradientTitle: "for E-commerce Agencies",
      titleSuffix: "",
      description: "No technical setup. No learning curve. Start getting Flipkart intelligence in under 2 minutes.",
      steps: [
        { step: "1", title: "Onboard All Your Clients", desc: "Add unlimited clients to your agency dashboard. Each gets their own workspace with full tracking for Amazon, Flipkart, and competitor data. Onboarding a new client takes under 10 minutes.", icon: "Users", bg: "bg-cyan-100 dark:bg-cyan-900/20" },
        { step: "2", title: "Automated Intelligence Gathering", desc: "Insydz monitors all clients 24/7 tracking competitors, prices, reviews, keyword rankings, and market trends automatically. Your team stops collecting data and starts acting on it.", icon: "Brain", bg: "bg-blue-100 dark:bg-blue-900/20" },
        { step: "3", title: "Deliver White-Label Reports", bullets: ["One-click branded reports for clients", "Automated alerts on client performance", "Actionable AI recommendations to share"], bg: "bg-green-100 dark:bg-green-900/20" },
      ],
    },
    statsBar: {
      title: "Trusted by Growing Agencies",
      subtitle: "Real efficiency gains for real agencies",
      items: [
        { stat: "40–60hrs", label: "Saved Per Month on Manual Work", icon: "Clock" },
        { stat: "10x", label: "Faster Client Reporting Cycles", icon: "FileText" },
        { stat: "85%", label: "Client Retention Rate", icon: "Award" },
      ]
    },
    roi: {
      titlePrefix: "What Insydz Means for an Agency",
      orangeTitle: "Billing ₹8L/Month Retainer",
      leakageTitle: "Without Insydz — Monthly Cost Leakage",
      recoveryTitle: "With Insydz — Monthly Value Created",
      leakageRows: [
        { label: "Manual reporting (50 hrs × analyst cost)", value: "−₹50,000" },
        { label: "Client churn from missed alerts (1 client/quarter)", value: "−₹60,000" },
        { label: "Tool subscription patchwork (5+ tools)", value: "−₹35,000" },
        { label: "Lost new business (no capacity to pitch)", value: "−₹80,000" },
      ],
      recoveryRows: [
        { label: "Analyst hours freed → redeployed to strategy", value: "+₹50,000" },
        { label: "Higher retention (85% vs 60% industry avg)", value: "+₹60,000" },
        { label: "Tool consolidation saving", value: "+₹28,000" },
        { label: "2 new clients onboarded (capacity freed)", value: "+₹1,20,000" },
      ],
      leakageTotal: "−₹2,25,000",
      recoveryTotal: "+₹2,58,000",
      netValue: "+₹4,83,000/month",
      netSub: "Net monthly value unlocked estimate",
    },
    faqs: [
      { id: "faq-1", q: "What is the best ecommerce analytics platform for agencies in India?", a: "Insydz is India's most comprehensive ecommerce analytics platform built specifically for agencies managing Amazon and Flipkart clients. Unlike US tools like Triple Whale or StoreHero, Insydz covers Indian marketplace data natively in INR, supports multichannel tracking, and delivers white-label reports your clients will actually value — without per-seat pricing that makes scaling unaffordable." },
      { id: "faq-2", q: "How does Insydz help ecommerce agencies manage multiple clients?", a: "Insydz provides a unified multi-client dashboard where agencies monitor all client accounts, competitor movements, keyword rankings, and review trends from one place. Each client gets a separate workspace with full Amazon and Flipkart tracking. Onboarding a new client takes under 10 minutes." },
      { id: "faq-3", q: "Can Insydz generate white-label reports for my agency clients?", a: "Yes. Insydz auto-generates branded monthly and weekly performance reports with your agency's logo. Reports include competitor analysis, keyword rankings, pricing trends, and AI review summaries — compiled automatically. What used to take 4 hours per client now takes one click. Agencies report 10x faster client reporting cycles." },
      { id: "faq-4", q: "How many clients can an Indian agency manage on Insydz?", a: "Insydz agency plans support unlimited client accounts on paid tiers. Each workspace includes dedicated tracking, competitor monitoring across 100+ rivals, custom KPI dashboards, and automated reporting. Volume discounts are available for agencies managing 10+ clients." },
      { id: "faq-5", q: "Does Insydz support multichannel tracking across Amazon and Flipkart?", a: "Yes. Insydz is a true multichannel ecommerce software platform that simultaneously tracks performance across Amazon India and Flipkart for each client. Agencies get a consolidated ecommerce dashboard showing GMV, keyword rankings, competitor prices, and review trends across both marketplaces." },
      { id: "faq-6", q: "How does Insydz help Indian agencies reduce client churn?", a: "The biggest reason clients churn is that they can't see the work being done. Insydz solves this with branded monthly reports showing exactly what happened — competitors caught, rankings recovered, pricing wins made, reviews addressed. Insydz agency users report an 85% client retention rate." },
      { id: "faq-7", q: "Is Insydz suitable for small Indian agencies (under 5 clients)?", a: "Absolutely. The free agency account lets you start managing up to 3 clients with core tracking and reporting features — no credit card required. As your agency grows, paid plans unlock unlimited clients, full white-label reporting, team access controls, and API access." },
    ],
    finalCta: {
      title: "Ready to Scale Your Agency?",
      description: "Join e-commerce agencies delivering premium intelligence to clients without the premium overhead.",
      cards: [
        { label: "New Agencies (Free Account)", desc: "Just starting out with your first 3 clients? Get the full Insydz intelligence stack free. No credit card, no setup complexity.", cta: "Start Free Agency Account", href: "/signup" },
        { label: "Growing Agencies (5–20 clients)", desc: "You've outgrown spreadsheets. The Agency Growth Plan gives you unlimited clients, full white-label reporting, team access controls, and automated intelligence.", cta: "Try Agency Growth Plan", href: "/pricing" },
        { label: "High-Performance Agencies (20+ clients)", desc: "Custom needs? API access, custom KPIs, dedicated account manager, white-glove onboarding, and volume pricing everything you need to dominate at scale.", cta: "Book a Demo", href: "/demo" },
      ],
      buttonText: "Start Free",
    },
    theme: {
      accent: "cyan",
      gradient: "from-cyan-600 via-blue-600 to-cyan-700",
      border: "border-cyan-600",
    },
  },
  "brand-managers": {
    slug: "brand-managers",
    badge: "Brand Monitoring Tool",
    hero: {
      titlePrefix: "Make Confident",
      gradientTitle: "Data-Backed",
      titleSuffix: "Brand Decisions.",
      description: "Insydz is India's most powerful brand monitoring tool for brand managers on Amazon and Flipkart so you can protect market share, optimise pricing strategies, and outmanoeuvre competitors with complete marketplace intelligence, not delayed reports.",
      primaryCta: "Start Free for Brand Managers",
      secondaryCta: "See How It Works →",
    },
    heroVisual: {
      productName: "Premium Brand Portfolio",
      alertTitle: "Market Share Alert",
      alertDesc: "Competitor launched similar product at 23% lower price",
      alertSub: "Category: Premium Skincare",
      whatsappTitle: "AI Recommendation",
      whatsappDesc: "Optimise pricing on Brand X by 8–12%",
      badgeLabel: "Live Intelligence",
    },
    painPoints: {
      titlePrefix: "Why Brand Managers Struggle",
      redTitle: "Without Real-Time Intelligence",
      titleSuffix: "",
      description: "Managing brands on e-commerce without live data is like driving blind. Competitors move at speed, customer sentiment shifts overnight, and by the time your monthly report is ready the market has already moved against you.",
      items: [
        { icon: "Eye", title: "Competitors move faster than your reporting cycle", color: "from-red-500 to-orange-500" },
        { icon: "TrendingDown", title: "Market share erosion goes unnoticed for weeks", color: "from-orange-500 to-yellow-500" },
        { icon: "MessageCircle", title: "Customer feedback gets lost in spreadsheets", color: "from-purple-500 to-pink-500" },
        { icon: "Clock", title: "Manual analysis delays strategic decisions", color: "from-pink-500 to-red-500" },
      ],
      statLarge: "Brands lose 20–40% market share annually",
      statSub: "due to slow competitive response, delayed pricing decisions, and missed customer sentiment signals on the marketplaces that matter most to Indian consumers.",
    },
    differentiation: {
      titlePrefix: "Social Listening Tools Track What People Say.",
      redTitle: "Insydz Tracks What They Buy.",
      titleSuffix: "",
      description: "Brandwatch, BrandMentions, and Locobuzz excel at tracking social media chatter. But for brand managers selling on Amazon and Flipkart, the signals that actually move market share pricing moves, keyword rankings, review sentiment, competitor product launches happen on the marketplace, not on social media.",
      table: [
        { feature: "Market share tracking on Amazon & Flipkart", insydz: "✓", others: "✗" },
        { feature: "Competitor pricing intelligence (INR)", insydz: "✓", others: "✗ Doesn't track pricing" },
        { feature: "Review sentiment & root-cause AI", insydz: "✓ 250K+ reviews", others: "⚠ Social only" },
        { feature: "Keyword ranking on marketplace search", insydz: "✓", others: "✗" },
        { feature: "AI pricing recommendations", insydz: "✓", others: "✗" },
        { feature: "Competitive benchmarking on 20+ metrics", insydz: "✓", others: "⚠ Social metrics only" },
        { feature: "Multi-brand portfolio view in INR", insydz: "✓", others: "⚠ No revenue-level data" },
        { feature: "Executive-ready one-click reports", insydz: "✓", others: "⚠ Manual export required" },
      ],
      compareLink: "/compare/insydzvshelium",
      compareLinkLabel: "See how Insydz compares as a marketplace brand intelligence platform",
    },
    coreFeatures: {
      titlePrefix: "Meet Insydz",
      gradientTitle: "Strategic Brand Intelligence Platform",
      titleSuffix: "",
      description: "Built for brand managers who need to make fast, confident decisions. Get complete market visibility across Amazon and Flipkart in one unified dashboard with AI that tells you what to do, not just what happened.",
      items: [
        {
          icon: "Layers",
          title: "1. Multi-Brand Portfolio View",
          desc: "Monitor all your brand's product lines and competitors simultaneously from one real-time brand tracking dashboard. Whether you manage 2 brands or 12 SKU families, Insydz gives you the complete picture GMV trends, market share shifts, and competitive threats without toggling between tools.",
          bullets: ["Total portfolio GMV view in INR across Amazon & Flipkart", "Per-brand and per-SKU performance breakdowns", "Market share position tracking against 100+ category competitors", "Historical trend analysis for executive presentations"],
          scenario: "A skincare brand manager in Mumbai was tracking 4 sub-brands manually across two marketplaces. Category managers were presenting outdated data in Monday reviews. With Insydz, the entire portfolio ₹2.4Cr monthly GMV across 3 brands is visible in real time every morning before the standup.",
          link: "/features/portfolio-view",
          linkLabel: "Explore portfolio features →",
          color: "from-blue-500 to-cyan-500",
        },
        {
          icon: "Brain",
          title: "2. AI-Powered Market Intelligence",
          desc: "Stop receiving data. Start receiving decisions. Insydz's brand intelligence platform doesn't just surface competitor moves it tells you exactly how to respond. Get strategic recommendations, not just numbers, backed by marketplace AI trained on Indian category data.",
          bullets: ["Competitor product launch detection with price & positioning analysis", "AI-calculated optimal price range to protect share without margin erosion", "Market share shift alerts with attribution (price/review/ranking cause)", "Demand signal analysis where your category is growing or declining"],
          scenario: "A FMCG brand's premium hair care line started losing market share on Flipkart. Insydz identified the cause in 48 hours: a competitor had dropped price by 18% and gained 3 keyword positions simultaneously. The AI recommended a ₹45 price adjustment and two listing changes. Share recovered within 3 weeks.",
          link: "/features/market-intelligence",
          linkLabel: "See AI intelligence features →",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: "LineChart",
          title: "3. Executive Reporting & Custom Dashboards",
          desc: "One click. Board-ready. Insydz generates performance analytics reports formatted for leadership review market share trends, competitive landscape summaries, keyword position charts, and sentiment scores without a single hour of manual data compilation.",
          bullets: ["Executive summary reports generated weekly or monthly", "Custom dashboard views tailored to leadership KPIs", "GMV trends, competitor benchmarks, and sentiment in one view", "Shareable report links for cross-functional team alignment"],
          scenario: "A brand manager at a consumer electronics company spent 6 hours every month compiling competitor data for the CMO review deck. With Insydz, the same report auto-generates in 90 seconds. Six hours returned to strategy every month.",
          link: "/features/ai-recommendations-feature",
          linkLabel: "Explore performance analytics software →",
          color: "from-orange-500 to-red-500",
        },
        {
          icon: "Shield",
          title: "4. Competitive Defence Alerts",
          desc: "Real-time brand tracking means knowing about competitive threats the moment they happen not after your sales data confirms the damage. Insydz monitors the market 24/7 and delivers WhatsApp alerts for every significant competitive event that could affect your brand's position.",
          bullets: ["New competitor product launch alert with full pricing intel", "Market share erosion alert when position drops more than 5%", "Keyword ranking loss alert with AI-recommended recovery action", "Review sentiment deterioration alert before ratings visibly decline"],
          scenario: "A home appliances brand manager received an Insydz alert on a Tuesday afternoon: Competitor X launched a similar product at 23% lower price. By Thursday, she had approved a tactical pricing response and a review solicitation push. Market share held within 2% of pre-launch levels.",
          link: "/features/whatsapp-alerts-feature",
          linkLabel: "See competitive defence features →",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
    extraFeatures: {
      title: "Everything You Need to Manage Your Brand Portfolio",
      description: "Comprehensive tools built for strategic decision-making",
      items: [
        { icon: "PieChart", title: "Market Share Tracking", desc: "Real-time category position vs. all competitors across Amazon and Flipkart" },
        { icon: "TrendingUp", title: "Price Elasticity Analysis", desc: "AI models category price sensitivity never price blind again" },
        { icon: "MessageCircle", title: "Sentiment Analytics", desc: "AI-powered review analysis across 250K+ reviews; brand perception tracking" },
        { icon: "Target", title: "Competitive Benchmarking", desc: "20+ metrics: pricing, reviews, keyword rankings, GMV estimates" },
        { icon: "Sparkles", title: "Product Performance", desc: "Star performer vs. underperformer analysis across your portfolio" },
        { icon: "BarChart3", title: "Custom Dashboards", desc: "Executive views tailored to brand-specific KPIs and reporting needs" },
      ]
    },
    howItWorks: {
      titlePrefix: "How Insydz Works",
      gradientTitle: "for Brand Managers",
      titleSuffix: "",
      description: "No analyst required. No data team needed. Get brand intelligence flowing in under 5 minutes.",
      steps: [
        { step: "1", title: "Connect Your Brand Portfolio", desc: "Add your brands and key competitors across Amazon and Flipkart. Insydz automatically tracks pricing, reviews, rankings, and market trends across your entire product catalogue and category.", icon: "Layers", bg: "bg-purple-100 dark:bg-purple-900/20" },
        { step: "2", title: "AI Analyses Market Dynamics", desc: "Our AI continuously monitors market share shifts, pricing strategies, customer sentiment, and competitive positioning across your categories 24/7, in real time, in INR.", icon: "Brain", bg: "bg-pink-100 dark:bg-pink-900/20" },
        { step: "3", title: "Get Strategic Recommendations", desc: "Instead of raw data, you receive decision-ready intelligence:", bullets: [{ text: "Competitor X launched at 25% discount", color: "red" }, { text: "Brand Y market share up 12% this month", color: "orange" }, { text: "Recommend 10% price adjustment on SKU Z", color: "blue" }] },
      ],
    },
    roi: {
      titlePrefix: "What Insydz Means for a Brand",
      orangeTitle: "Doing ₹2Cr/Month on Indian Marketplaces",
      leakageTitle: "Without Insydz — Monthly Value at Risk",
      recoveryTitle: "With Insydz — Monthly Value Protected",
      leakageRows: [
        { label: "Slow response to competitor price drop (3-day lag)", value: "−₹60,000" },
        { label: "Undetected keyword ranking loss (top 5 → top 20)", value: "−₹80,000" },
        { label: "Review sentiment drop unaddressed for 6 weeks", value: "−₹45,000" },
        { label: "Manual reporting hours (brand manager + analyst)", value: "−₹35,000" },
        { label: "Missed market share window (new competitor launch)", value: "−₹90,000" },
      ],
      recoveryRows: [
        { label: "Price response within 2 hours of competitor move", value: "+₹55,000" },
        { label: "Keyword rankings recovered with AI guidance", value: "+₹70,000" },
        { label: "Review issues caught before ratings drop", value: "+₹38,000" },
        { label: "Reporting hours freed → returned to strategy", value: "+₹32,000" },
        { label: "Competitive launch defended (share held)", value: "+₹80,000" },
      ],
      leakageTotal: "−₹3,10,000",
      recoveryTotal: "+₹2,75,000",
      netValue: "+₹5,85,000/month",
      netSub: "Net monthly value protected estimate",
    },
    faqs: [
      { id: "faq-1", q: "What is the best brand monitoring tool for Amazon and Flipkart in India?", a: "Insydz is India's most comprehensive brand monitoring tool built for Amazon.in and Flipkart. Unlike Brandwatch or BrandMentions that track social media, Insydz tracks marketplace-specific signals — competitor pricing, keyword rankings, review sentiment, and market share — in real time, in INR, with AI-powered recommendations for brand managers." },
      { id: "faq-2", q: "How does Insydz help brand managers protect market share on Indian marketplaces?", a: "Insydz monitors your brand's market share position across Amazon and Flipkart in real time. When a competitor launches at a lower price, gains keyword ranking, or accumulates reviews faster, you receive an immediate alert with exact data and an AI recommendation. Threats that took weeks to discover are now visible within hours." },
      { id: "faq-3", q: "How is Insydz different from Brandwatch or BrandMentions for Indian brand managers?", a: "Brandwatch and BrandMentions track social media mentions — excellent for PR monitoring. Insydz tracks what happens on the marketplaces where your brand actually sells: pricing moves, keyword shifts, competitor launches, review sentiment, and market share data — all in INR, all India-specific, all tied to your actual revenue." },
      { id: "faq-4", q: "Can Insydz track brand sentiment through customer reviews on Amazon and Flipkart?", a: "Yes. Insydz's AI has analysed 250,000+ reviews on Indian marketplaces. It surfaces recurring positive and negative themes, tracks sentiment trends over time, compares your brand perception against competitors, and alerts you when a new negative pattern emerges — before it becomes a visible rating problem." },
      { id: "faq-5", q: "Does Insydz support multi-brand portfolio tracking?", a: "Yes. Insydz's multi-brand portfolio view lets brand managers monitor all product lines and competitors simultaneously. Track GMV trends, market share shifts, keyword rankings, and review sentiment across every SKU — with executive-ready reports generated automatically for leadership review." },
      { id: "faq-6", q: "What is price elasticity analysis and how does Insydz use it?", a: "Price elasticity analysis models how sales volume responds to price changes. Insydz's AI builds this model for your specific category on Amazon and Flipkart, then recommends the optimal price to hold market position without eroding margin. Brand managers can run pricing scenarios before making decisions that affect crores of revenue." },
      { id: "faq-7", q: "Can Insydz generate executive reports for brand leadership reviews?", a: "Yes. Insydz auto-generates executive-ready performance reports in one click — market share trend charts, competitive landscape summaries, keyword position movement, sentiment scores, and GMV performance. What previously took 6+ analyst hours takes 90 seconds with Insydz." },
    ],
    finalCta: {
      title: "Ready to Manage Your Brands with Confidence?",
      description: "Join brand managers who make strategic decisions backed by real-time market intelligence, not delayed reports.",
      cards: [
        { label: "For Emerging Brands", desc: "Building your brand on Indian marketplaces? Get competitor intelligence and market positioning data from day one. The free plan requires no credit card and gives new brand managers the visibility they need before making their first major strategic decision.", cta: "Start Free No Card Needed", href: "/signup" },
        { label: "For Growing Brands", desc: "Managing ₹50L–₹5Cr/month GMV? At your brand's scale, every market share point is worth lakhs. The Growth Plan gives you full real-time brand tracking, AI-powered competitive intelligence, price elasticity analysis, and executive reporting.", cta: "Try Brand Growth Plan", href: "/pricing" },
        { label: "For Enterprise", desc: "Managing a multi-brand portfolio? Custom dashboards, dedicated account manager, white-glove onboarding, API access, and enterprise pricing built for brand leaders managing complex multi-category portfolios across Indian marketplaces.", cta: "Book a Strategic Demo", href: "/solutions/ecommerce-agencies" },
      ],
      buttonText: "Start Free for Brand Managers",
    },
    theme: {
      accent: "purple",
      gradient: "from-purple-600 via-pink-600 to-purple-700",
      border: "border-purple-600",
    },
  },
};

export const SOLUTIONS_INDEX_DATA: SolutionIndexData = {
  hero: {
    badge: "Ecommerce analytics platform",
    titlePrefix: "The Ecommerce Analytics Platform Built for",
    gradientTitle: "Indian Sellers",
    description: "Whether you sell on Amazon, Flipkart Insydz gives you the exact intelligence you need to price smarter, rank higher, and grow faster.",
    descriptionSecondary: "Most analytics tools were built for US markets, enterprise teams, or data scientists. Insydz was built for you the Indian seller doing ₹5L to ₹50L a month who needs clear signals, not complicated dashboards.",
    primaryCta: "Start Free",
    secondaryCta: "Find My Solution →",
    solutions: [
      { title: 'Amazon Seller Solution', sub: 'Price tracking • Review insights • Buy Box AI', grad: 'from-orange-500 to-red-500', icon: 'ShoppingBag' },
      { title: 'Flipkart Seller Solution', sub: 'SEO monitoring • Competitor tracking', grad: 'from-blue-500 to-cyan-500', icon: 'Store' },
      { title: 'Ecommerce Agencies Solution', sub: 'Market validation • Positioning', grad: 'from-yellow-500 to-orange-500', icon: 'TrendingUp' },
      { title: 'Brand Managers Solution', sub: 'Market validation • Positioning', grad: 'from-green-500 to-teal-500', icon: 'TrendingUp' },
    ],
  },
  problems: {
    titlePrefix: "Why Indian Sellers Struggle",
    orangeTitle: "and Why Generic Tools Make It Worse",
    description: "You're not just \"an ecommerce seller.\" You're managing price wars at midnight, losing the Buy Box to a seller who undercut you by ₹11, watching your Flipkart listing drop three pages with no idea why.",
    secondaryText: "The problem isn't effort. It's intelligence.",
    listTitle: "Here's what most Amazon seller tools don't tell you:",
    items: [
      'The metrics Amazon shows you are trailing indicators, you need leading ones.',
      "Your data lives in 6 tabs across 3 different tools, that's not intelligence that's chaos.",
      'Global tools are optimized for US/EU sellers, Indian marketplace logic is completely different.',
      'Automation tools without intelligence just automate your mistakes faster.',
    ],
    bottomStat: "Insydz is the ecommerce analytics solution designed around exactly these problems",
    bottomSub: "and built the right way to solve them",
  },
  solutionsGrid: {
    titlePrefix: "Different Sellers. Different Problems.",
    gradientTitle: "One Marketplace Software Platform.",
    description: "No two sellers are the same, that's why Insydz applies real AI-powered intelligence to your unique marketplace software needs, giving you targeted insights instead of generic dashboards.",
    items: [
      {
        id: 'amazon-sellers',
        icon: 'ShoppingBag',
        title: 'Amazon Sellers',
        subtitle: 'For Amazon Sellers (India)',
        whoItsFor: 'Private label & reseller sellers on Amazon India',
        pain: 'Competing with 40+ sellers on the same ASIN with ₹180 per unit margin one wrong price move wipes the week.',
        problems: [
          'Real-time competitor price alerts never lose the Buy Box blindly',
          'Keyword & rank visibility for your top ASINs',
          'AI-powered review mining across your category',
          'Pricing AI to protect margin without losing rank'
        ],
        outcome: 'Sell smarter, react faster, protect your margins.',
        link: '/solutions/amazon-sellers',
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'flipkart-sellers',
        icon: 'Store',
        title: 'Flipkart Sellers',
        subtitle: 'For Flipkart Sellers',
        whoItsFor: 'Sellers primarily operating on Flipkart',
        pain: 'Your listing drops from 200 to 60 daily views nothing changed, or so you think.',
        problems: [
          'SEO and visibility gap analysis find out exactly why your listing dropped',
          'Price war alerts on high-converting listings',
          'Competitor monitoring new entrants, flash sales, stock-out patterns'
        ],
        outcome: 'Better visibility and faster reactions on Flipkart.',
        link: '/solutions/flipkart-sellers',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'ecommerce-agencies',
        icon: 'Briefcase',
        title: 'E-commerce Agencies',
        subtitle: 'For E-commerce Agencies',
        whoItsFor: 'Agencies managing multiple seller accounts',
        pain: 'Managing 8 seller accounts with 8 separate Excel trackers 30% of every week on reporting instead of strategy.',
        problems: [
          'Centralised multi-client reporting one dashboard, all clients and no manual pulls',
          'Aggregated competitor data, keyword trends and review signals across accounts',
          'Data-backed reports clients can actually understand'
        ],
        outcome: 'Save time, scale clients, show impact.',
        link: '/solutions/ecommerce-agencies',
        color: 'from-green-500 to-emerald-500'
      },
      {
        id: 'brand-managers',
        icon: 'Target',
        title: 'Brand Managers',
        subtitle: 'For Brand Managers & Category Teams',
        whoItsFor: 'Category managers, growth & brand teams',
        pain: 'Leadership wants data-backed decisions you\'re working off last quarter\'s research and a gut feel.',
        problems: [
          'Real-time market intelligence dashboards not stale reports',
          'Competitive positioning vs key rivals on price, rating and visibility',
          'Performance tracking over time for listings and strategies'
        ],
        outcome: 'Better strategic decisions with data.',
        link: '/solutions/brand-managers',
        color: 'from-yellow-500 to-orange-500'
      }
    ],
  },
  caseStudies: {
    titlePrefix: "Real Indian Sellers.",
    gradientTitle: "Real Problems. Real Outcomes.",
    description: "Real sellers use Insydz differently based on how they sell. Here are common examples.",
    items: [
      {
        type: 'Amazon Reseller',
        problem: 'Lost Buy Box due to sudden competitor price drops with no visibility',
        outcome: 'Reacted faster with alerts protected margins',
        icon: 'ShoppingBag',
        color: 'from-orange-500 to-red-500'
      },
      {
        type: 'E-commerce Agency',
        problem: 'Manual reporting across multiple client accounts consuming the team',
        outcome: 'Centralised insights saved hours every week',
        icon: 'Briefcase',
        color: 'from-green-500 to-emerald-500'
      }
    ],
  },
  advantages: {
    titlePrefix: "What Makes Insydz Different as",
    gradientTitle: "Marketplace Software. Built for India, Not Adapted for It",
    description: "Most ecommerce analytics tools are built for the US or EU seller. Insydz is the only marketplace software that starts with Indian marketplace logic, regional languages, category-specific insights, and local fulfillment data, not as an afterthought, but as the foundation.",
    items: [
      { icon: 'ShoppingBag', title: 'Amazon India-native', desc: 'We track Indian ASINs, Indian seller behaviour, and India-specific pricing dynamics not US market proxies.', color: 'from-orange-500 to-red-500' },
      { icon: 'Store', title: 'Flipkart SEO Intelligence', desc: "One of the few AI ecommerce analytics software platforms that deeply maps Flipkart's search ranking signals.", color: 'from-blue-500 to-cyan-500' },
      { icon: 'IndianRupee', title: '₹-denominated ROI', desc: 'Every insight is framed around your margin in rupees, not abstract percentages.', color: 'from-green-500 to-emerald-500' },
      { icon: 'Users', title: 'Tier 1 to Tier 3', desc: 'Whether you\'re based in Mumbai or Meerut, the tool works for your catalogue size, category, and growth stage.', color: 'from-purple-500 to-pink-500' }
    ],
    bottomText: "Same intelligence engine. Role-specific insights. One platform that adapts to how you sell not the other way around.",
  },
  roi: {
    titlePrefix: "What Does a Real Ecommerce Optimization Platform",
    orangeTitle: "Actually Mean for Your Business?",
    scenario: "Scenario: Amazon seller, ₹20L/month GMV, electronics accessories category",
    rows: [
      { without: 'Checks competitor price manually, once a day', with: 'Real-time alerts responds within the hour' },
      { without: 'Loses Buy Box 5–6x per week', with: 'Stabilises Buy Box wins it back faster' },
      { without: 'Reviews product reviews manually once a month', with: 'AI surfaces recurring quality complaints weekly' },
      { without: 'Launches new SKUs on intuition', with: 'Validates demand before buying inventory' },
      { without: 'Spends 10 hrs/week on market research', with: 'Gets same intelligence in 20 minutes' },
    ],
    summary: "If recovering the Buy Box just 3 extra times per week adds ₹15,000 to your monthly revenue",
    summaryBold: "Insydz pays for itself in days, not months.",
  },
  quickGuide: {
    titlePrefix: "Not Sure Which Amazon Seller",
    orangeTitle: "Tool or Plan Fits You?",
    description: "Here's a quick guide to help you choose:",
    items: [
      { condition: 'Selling on Amazon India', solution: 'Amazon Seller Solution', link: '/solutions/amazon-sellers' },
      { condition: 'Selling on Flipkart', solution: 'Flipkart Seller Solution', link: '/solutions/flipkart-sellers' },
      { condition: 'Managing multiple client accounts', solution: 'Agency Solution', link: '/solutions/ecommerce-agencies' },
      { condition: 'Category manager or brand team', solution: 'Brand Manager Solution', link: '/solutions/brand-managers' },
    ],
  },
  faqs: [
    { id: 'faq-1', q: 'Can I switch between solutions later?', a: 'Yes. Insydz is designed to adapt as your business grows. You can switch your solution type inside the product dashboard at any time no data loss, no restart required.' },
    { id: 'faq-2', q: 'Do the solutions work across multiple platforms Amazon, Flipkart?', a: 'Yes. Insydz supports multi-platform intelligence from a single dashboard. The same data engine powers insights for Amazon India, Flipkart, with platform-specific signals surfaced based on your solution type.' },
    { id: 'faq-3', q: 'Is pricing different for each solution?', a: 'No. All solutions are powered by the same Insydz platform. Pricing is based on your plan tier, not the solution type you choose. See the Pricing page for current plans.' },
    { id: 'faq-4', q: 'Can agencies access multiple solutions for different clients?', a: 'Yes. The Agency solution includes multi-account access, allowing you to manage different client profiles each with their own solution type, marketplace focus, and reporting view from a single Insydz workspace.' },
    { id: 'faq-5', q: 'Is the free plan available for all solutions?', a: 'Yes. You can start free on any solution type. No credit card required. The free plan gives you access to core intelligence features so you can evaluate Insydz before upgrading.' },
    { id: 'faq-6', q: 'Which solution is best for Amazon vs Flipkart sellers?', a: 'Amazon sellers benefit most from Insydz\'s pricing AI, Buy Box tracking, and review mining features. Flipkart sellers get the most value from keyword visibility, SEO gap analysis, and competitor monitoring tools. Both are available on the same platform.' },
    { id: 'faq-7', q: 'Can I use more than one solution at the same time?', a: 'Yes. If you sell on both Amazon and Flipkart, or run both a D2C brand and a marketplace store, Insydz can be configured to surface insights across all your active channels simultaneously.' },
    { id: 'faq-8', q: 'What is the best ecommerce analytics solution for Indian sellers?', a: 'Insydz is purpose-built for Indian marketplace sellers covering Amazon India, Flipkart. Unlike global analytics tools, Insydz provides India-specific pricing intelligence, Flipkart SEO tracking, regional trend analysis, and AI-powered review mining all in one platform built for sellers doing ₹5L to ₹50L+ per month.' },
  ],
  finalCta: {
    titlePrefix: "Whatever You Sell. However You Sell.",
    titleBold: "Insydz Fits.",
    description: "Start free choose your solution inside the product.",
    cards: [
      { label: 'New Seller?', desc: 'Get your first competitive intelligence report in minutes.', cta: 'Start Free No Credit Card Required', href: '/signup' },
      { label: 'Growing Seller (₹5L–₹50L/month)?', desc: 'You need pricing AI, rank tracking, and review signals all working together.', cta: 'Try the Growth Plan', href: '/pricing#growth' },
      { label: 'Running an Agency?', desc: 'See how Insydz centralises intelligence across all your clients.', cta: 'Book a Demo', href: '/demo' },
    ],
    buttonText: "Start a Free Trial",
  },
};
