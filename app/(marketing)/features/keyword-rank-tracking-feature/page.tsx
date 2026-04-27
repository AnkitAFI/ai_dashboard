import { Metadata } from "next";
import KeywordRankTrackingContent from "./keyword-rank-tracking-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Keyword & Rank Tracking for Amazon & Flipkart Sellers | Insydz",
  description: "Track keyword rankings on Amazon and Flipkart with Insydz. Monitor positions, find opportunities, and outrank competitors.",
  alternates: {
    canonical: "https://insydz.com/features/keyword-rank-tracking-feature",
  },
};

const schemaSoftwareKeyword = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#keyword-tracking",
  "name": "Insydz Keyword Rank Tracking",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/keyword-rank-tracking-feature",
  "description": "Track keyword rankings on Amazon and Flipkart with Insydz. Monitor positions, find opportunities, and outrank competitors.",
  "featureList": [
    "Daily keyword rank tracking",
    "Hindi and English keyword support",
    "WhatsApp rank drop alerts",
    "90-day rank history",
    "Keyword opportunity scoring",
    "Competitor keyword analysis",
    "Multi-keyword tracking"
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

const schemaBreadcrumbKeyword = {
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
      "name": "Keyword Rank Tracking",
      "item": "https://insydz.com/features/keyword-rank-tracking-feature"
    }
  ]
};

const schemaFAQKeyword = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How often are keyword rankings updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rankings are updated daily, with premium plans offering more frequent updates."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track competitor keywords too?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz identifies and tracks competitor keywords to help you find opportunities."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work for both Amazon and Flipkart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz supports keyword tracking for both Amazon India and Flipkart."
      }
    },
    {
      "@type": "Question",
      "name": "What if my product does not rank yet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz suggests relevant keywords based on search volume and competition to help you start ranking."
      }
    },
    {
      "@type": "Question",
      "name": "Is keyword tracking available on the free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Free plan includes limited keyword tracking with upgrade options."
      }
    },
    {
      "@type": "Question",
      "name": "How does this help improve sales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Better rankings increase visibility and organic traffic, leading to more sales."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareKeyword) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbKeyword) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQKeyword) }}
      />
      <KeywordRankTrackingContent />
    </>
  );
}
