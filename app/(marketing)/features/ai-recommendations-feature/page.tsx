import { Metadata } from "next";
import AIRecommendationsContent from "./ai-recommendations-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Recommendations for Amazon & Flipkart Sellers | Insydz",
  description: "Get smart, actionable AI recommendations for pricing, keywords, and product strategy. Stop drowning in data and start taking actions that grow your business.",
  alternates: {
    canonical: "https://insydz.com/features/ai-recommendations-feature",
  },
};

const schemaSoftwareAI = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#ai-recommendations",
  "name": "Insydz AI Recommendations",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/ai-recommendations-feature",
  "description": "AI-powered recommendations for pricing, keywords, and product strategy for Amazon and Flipkart sellers.",
  "featureList": [
    "Prioritized recommendations with revenue impact",
    "Cross-signal analysis (price, reviews, keywords)",
    "One-click implementation",
    "Daily AI updates",
    "India marketplace optimized"
  ],
  "offers": {
    "@type": "Offer",
    "price": "1999",
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "1999",
      "priceCurrency": "INR",
      "unitCode": "MON"
    }
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaBreadcrumbAI = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://insydz.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://insydz.com/features"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "AI Recommendations",
      "item": "https://insydz.com/features/ai-recommendations-feature"
    }
  ]
};

const schemaFAQAI = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI generate recommendations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz analyzes product data, competitor activity, and market trends to generate actionable recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Are recommendations updated automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Recommendations are updated daily based on market changes."
      }
    },
    {
      "@type": "Question",
      "name": "Can I implement recommendations with one click?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many recommendations can be applied directly, while others include step-by-step guidance."
      }
    },
    {
      "@type": "Question",
      "name": "What types of recommendations will I get?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You will get recommendations for pricing, keywords, inventory, listing optimization, and competitor strategy."
      }
    },
    {
      "@type": "Question",
      "name": "Is this available on the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Basic AI recommendations are included in the free plan."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate are the AI recommendations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Recommendations are data-driven and based on patterns from successful seller strategies."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareAI) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbAI) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQAI) }}
      />
      <AIRecommendationsContent />
    </>
  );
}
