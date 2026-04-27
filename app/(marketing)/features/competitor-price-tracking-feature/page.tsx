import { Metadata } from "next";
import CompetitorPriceTrackingContent from "./competitor-price-tracking-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Competitor Price Tracking for Amazon India & Flipkart | Insydz",
  description: "Monitor competitor prices in real time on Amazon & Flipkart with Insydz. Track price history, get instant WhatsApp alerts, and never lose the Buy Box again.",
  alternates: {
    canonical: "https://insydz.com/features/competitor-price-tracking-feature",
  },
};

const schemaSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Insydz Competitor Price Tracking",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/competitor-price-tracking-feature",
  "description": "Monitor competitor prices in real time on Amazon & Flipkart with Insydz. Track price history, get instant alerts, and never lose the Buy Box again.",
  "featureList": [
    "Real-time competitor price monitoring across all sellers on an ASIN",
    "Buy Box win probability scoring at any price point",
    "WhatsApp alerts when competitor drops below a price threshold",
    "30-day price trend analysis and seller price distribution",
    "Festive sale mode — heightened monitoring during Big Billion Days and Great Indian Festival",
    "Covers Amazon India, Flipkart, and Meesho"
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

const schemaBreadcrumb = {
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
      "name": "Competitor Price Tracking",
      "item": "https://insydz.com/features/competitor-price-tracking-feature"
    }
  ]
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Insydz competitor price tracking work on Flipkart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz tracks competitor prices on both Amazon India and Flipkart simultaneously from a single dashboard, with WhatsApp alerts for price changes on either marketplace. Most global price tracking tools cover Amazon only — Flipkart support is one of Insydz's core India-first advantages."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly does Insydz detect a competitor's price change?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz monitors competitor prices in real time. When a competing listing changes price, you receive a WhatsApp notification within minutes — including the AI-suggested reprice and confirmation that it stays above your margin floor. There's no waiting for a daily digest or checking a dashboard manually."
      }
    },
    {
      "@type": "Question",
      "name": "Can I set a minimum price so I never reprice below my margin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — this is one of Insydz's most important price tracking features. You set a floor price (your minimum acceptable margin) for each product. Every AI-suggested reprice automatically stays above that floor. Even during a competitor price war, Insydz will never suggest a reprice that puts you below cost. This prevents panic discounting during sale seasons."
      }
    },
    {
      "@type": "Question",
      "name": "Does Insydz track competitor prices on Amazon India specifically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — Insydz is built specifically for Amazon India (Amazon.in), not Amazon.com. Keyword volumes, demand data, fee calculations, and competitor pricing are all calibrated for the Indian marketplace. This is a key difference from global price tracking tools like Prisync or Competera, which are designed for Western markets."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free plan for competitor price tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz's free plan includes competitor price monitoring for up to 25 products — permanently, with no credit card required and no expiry date. You get real-time price alerts and the AI reprice suggestion feature. Paid plans (₹1,999/month and ₹2,999/month) expand the product limit and add Flipkart tracking."
      }
    },
    {
      "@type": "Question",
      "name": "How is Insydz different from other price tracking tools like Prisync?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Prisync is excellent for Western e-commerce retailers but designed for website-based price monitoring, not Indian marketplace sellers. Insydz is built for Amazon India and Flipkart: WhatsApp alerts (not email), INR reprice calculations with Amazon.in fee structures, Indian festive demand data in pricing suggestions, and dual-marketplace coverage from one dashboard."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }}
      />
      <CompetitorPriceTrackingContent />
    </>
  );
}
