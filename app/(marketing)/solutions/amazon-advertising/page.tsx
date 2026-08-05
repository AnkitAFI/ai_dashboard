import { Metadata } from "next";
import AmazonAdvertisingContent from "./amazon-advertising-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Advertising & PPC Optimization Software India | Insydz",
  description: "Amazon PPC automation software for sellers in India. Reduce wasted ad spend, boost profitability, and scale your Amazon business with easy 1-click bid optimization.",
  keywords: [
    "Amazon PPC software India",
    "Amazon advertising tool",
    "Amazon seller analytics",
    "Amazon ACOS reduction",
    "Amazon Sponsored Products tool",
    "Amazon custom automation rules",
    "Amazon PPC optimization",
    "Amazon Dayparting India",
    "Amazon PPC recommendations India",
    "Amazon India seller tools",
    "Amazon ad management software",
    "ACOS reduction tool"
  ],
  alternates: {
    canonical: "https://insydz.com/solutions/amazon-advertising",
  },
  openGraph: {
    title: "Amazon Advertising & PPC Optimization Software India | Insydz",
    description: "Amazon PPC automation software for sellers in India. Reduce wasted ad spend, boost profitability, and scale your Amazon business with easy 1-click bid optimization.",
    url: "https://insydz.com/solutions/amazon-advertising",
    siteName: "Insydz",
    type: "website",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Amazon Advertising & PPC Optimizer",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "Aavapti Technologies (Insydz) provides an easy-to-use Amazon Advertising bid optimizer, smart ad scheduling, and custom automation rules for Amazon India sellers to maximize profits.",
    "url": "https://insydz.com/solutions/amazon-advertising",
    "provider": {
      "@type": "Organization",
      "name": "AAVAPTI TECHNOLOGIES PRIVATE LIMITED",
      "url": "https://insydz.com"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Amazon Advertising & PPC", "item": "https://insydz.com/solutions/amazon-advertising" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Insydz Amazon Advertising & PPC Optimization software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Insydz is an Amazon Advertising management platform developed by AAVAPTI TECHNOLOGIES PRIVATE LIMITED. It helps Amazon India sellers easily optimize their ad campaigns, stop wasting money on bad clicks, and automatically scale top-performing keywords to maximize profits."
        }
      },
      {
        "@type": "Question",
        "name": "Does Insydz blindly use AI to change my bids?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. To guarantee your budget is safe, Insydz calculates all keyword bids using smart, data-driven formulas based on your exact profit goals. This ensures your ad spend is always protected and optimized for real sales, not just clicks."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Smart Ad Scheduling work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Smart Scheduling feature allows you to automatically pause your ads during quiet night hours (e.g., 12 AM - 6 AM) when click fraud or low-converting traffic is highest. Your ads automatically wake up in the morning, ensuring your budget is saved for peak shopping hours."
        }
      },
      {
        "@type": "Question",
        "name": "What are Custom Automation Rules?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It is a simple tool that lets you create your own automation strategies without any coding. For example, you can tell the system: 'If a keyword is losing money, lower the bid automatically.' It runs 24/7 in the background to protect your margins."
        }
      },
      {
        "@type": "Question",
        "name": "Is Insydz officially integrated with Amazon?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Insydz uses Amazon's official Advertising network to securely optimize your Sponsored Products without needing access to your main Seller Central account."
        }
      }
    ]
  }
];

export default function AmazonAdvertisingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMAS) }}
      />
      <AmazonAdvertisingContent />
    </>
  );
}
