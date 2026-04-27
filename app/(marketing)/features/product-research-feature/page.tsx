import { Metadata } from "next";
import ProductResearchContent from "./product-research-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Product Research Tool for Amazon India & Flipkart | Insydz",
  description: "Find profitable products with Insydz's AI research tool. Analyse demand, competition, and margins on Amazon & Flipkart.",
  alternates: {
    canonical: "https://insydz.com/features/product-research-feature",
  },
};

const schemaSoftwareProductResearch = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#product-research",
  "name": "Insydz Product Research Tool",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/product-research-feature",
  "description": "Find profitable products with Insydz's AI research tool. Analyse demand, competition, and margins on Amazon & Flipkart.",
  "featureList": [
    "Product opportunity score (0-100) calibrated for Amazon India",
    "Demand trend — monthly search volume and festive spike forecasting",
    "Competition density analysis — seller count and quality",
    "True margin calculator with actual Amazon India fee structures in INR",
    "Festive season opportunity scoring — Diwali, Big Billion Days timing",
    "Category entry timing recommendations"
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

const schemaBreadcrumbProductResearch = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://insydz.com/features" },
    { "@type": "ListItem", "position": 3, "name": "Product Research", "item": "https://insydz.com/features/product-research-feature" }
  ]
};

const schemaFAQProductResearch = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI product research work?",
      "acceptedAnswer": { "@type": "Answer", "text": "Insydz AI analyzes millions of products across Amazon & Flipkart, evaluating demand, competition, pricing trends, and profit margins." }
    },
    {
      "@type": "Question",
      "name": "Will I find products that aren't already saturated?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Our AI identifies emerging trends and underserved niches before they become oversaturated." }
    },
    {
      "@type": "Question",
      "name": "Can I filter by specific criteria?",
      "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Filter by category, price range, competition level, profit margin, search volume, and more." }
    },
    {
      "@type": "Question",
      "name": "Does this work for private label sellers?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Perfect for private label sellers to discover new winning products." }
    },
    {
      "@type": "Question",
      "name": "Is product research available on the free plan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes! Limited product research queries are included in the free plan." }
    },
    {
      "@type": "Question",
      "name": "How is this different from manual research?",
      "acceptedAnswer": { "@type": "Answer", "text": "Manual research takes weeks; AI analyzes thousands of data points in seconds to reveal hidden opportunities." }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareProductResearch) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbProductResearch) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQProductResearch) }}
      />
      <ProductResearchContent />
    </>
  );
}
