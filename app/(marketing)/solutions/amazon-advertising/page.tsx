import { Metadata } from "next";
import AmazonAdvertisingContent from "./amazon-advertising-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Advertising & PPC Optimization Software India | Insydz",
  description: "Amazon PPC software and advertising analytics for sellers in India. Find profitable keywords, reduce ACOS, and track true bottom-line TACoS with 100% seller control.",
  keywords: [
    "Amazon PPC software India",
    "Amazon advertising tool",
    "Amazon seller analytics",
    "Amazon ACOS reduction",
    "Amazon Sponsored Products tool",
    "Amazon keyword finder",
    "Amazon PPC optimization",
    "Amazon PPC recommendations India",
    "Amazon TACoS tracker",
    "Amazon India seller tools",
    "Amazon ad management software",
    "ACOS reduction tool"
  ],
  alternates: {
    canonical: "https://insydz.com/solutions/amazon-advertising",
  },
  openGraph: {
    title: "Amazon Advertising & PPC Optimization Software India | Insydz",
    description: "Amazon PPC software and advertising analytics for sellers in India. Find profitable keywords, reduce ACOS, and track true bottom-line TACoS with 100% seller control.",
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
    "description": "Aavapti Technologies (Insydz) provides a rule-based Amazon Advertising analytics, search term recommendation, and PPC bid checklist dashboard for Amazon sellers and brands. 100% seller control with zero AI auto-pilot.",
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
          "text": "Insydz is a comprehensive Amazon Advertising and PPC management SaaS platform developed by AAVAPTI TECHNOLOGIES PRIVATE LIMITED. It combines deterministic Target-ACOS bid optimization math, automated search term harvesting rules, and natural language AI explanations to help Amazon sellers lower wasted ad spend and scale profitable campaigns."
        }
      },
      {
        "@type": "Question",
        "name": "How does the automated Search Term Harvester work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Insydz continuously reads your daily Amazon Ads Search Term Reports. When a customer search query generates multiple profitable sales below your Target ACOS, our rule engine automatically suggests promoting it as an Exact Match keyword in your manual campaign while adding a Negative Exact match in the auto campaign to prevent bidding against yourself. Similarly, it identifies zero-sale bleeders and flags them for immediate negative targeting."
        }
      },
      {
        "@type": "Question",
        "name": "Does Insydz use AI to calculate PPC keyword bids?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. To guarantee 100% financial precision and prevent AI hallucinations, Insydz calculates all keyword bids and budget caps using strict deterministic mathematical formulas based on your Target ACOS. AI is used solely to provide human-readable explanations of why a bid changed and to summarize your daily campaign performance."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between Suggestions Mode and Auto-Pilot Mode?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In Suggestions Mode (default), Insydz generates a daily checklist of recommended bid changes and keyword harvesting actions. You review the recommendations and apply them in 1-click. In Auto-Pilot Mode, approved mathematical rules execute hands-free overnight via the Amazon Ads API, protected by strict custom safety caps such as maximum bid ceilings and daily budget variation limits."
        }
      },
      {
        "@type": "Question",
        "name": "Is Insydz officially integrated with Amazon Advertising and Selling Partner APIs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Insydz is an official product of AAVAPTI TECHNOLOGIES PRIVATE LIMITED, integrated with both the Amazon Selling Partner API (SP-API) and the Amazon Ads API to provide real-time multi-marketplace analytics, TACoS tracking, and campaign management."
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
