import { Metadata } from "next";
import PriceOptimizationContent from "./price-optimization-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Price Optimization Software for Amazon India & Flipkart | Insydz",
  description: "Maximise margins with Insydz AI price optimization software. Set dynamic pricing rules, win the Buy Box, and improve revenue automatically.",
  alternates: {
    canonical: "https://insydz.com/features/price-optimization-feature",
  },
};

const schemaSoftwarePrice = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#price-optimization",
  "name": "Insydz AI Price Optimization",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/price-optimization-feature",
  "description": "Maximise margins with Insydz AI price optimization software. Set dynamic pricing rules, win the Buy Box, and improve revenue.",
  "featureList": [
    "AI-recommended optimal price",
    "Buy Box probability scoring",
    "Margin floor protection",
    "Festive pricing intelligence",
    "Category benchmark pricing"
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

const schemaBreadcrumbPrice = {
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
      "name": "AI Price Optimization",
      "item": "https://insydz.com/features/price-optimization-feature"
    }
  ]
};

const schemaFAQPrice = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI price optimization work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz analyzes competitor prices, demand signals, and Buy Box probability to recommend optimal pricing while maintaining your margin."
      }
    },
    {
      "@type": "Question",
      "name": "Will I lose the Buy Box if prices are optimized?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Insydz maximizes Buy Box win probability and provides predictions for each recommended price."
      }
    },
    {
      "@type": "Question",
      "name": "Can I set minimum profit margins?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can define a margin floor and Insydz will never recommend pricing below it."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work for seasonal products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz accounts for Indian festive demand like Diwali and Big Billion Days in pricing recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Is price optimization available on the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Free plan includes basic AI pricing recommendations with limits on products."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from competitor price tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Price tracking shows competitor prices, while optimization recommends the best price based on demand, margins, and Buy Box probability."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwarePrice) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbPrice) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQPrice) }}
      />
      <PriceOptimizationContent />
    </>
  );
}
