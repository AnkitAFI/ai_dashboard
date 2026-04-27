import { Metadata } from "next";
import ReviewAnalyticsContent from "./review-analytics-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Review Analytics for Amazon India & Flipkart | Insydz",
  description: "Analyse Amazon & Flipkart reviews with Insydz. AI sentiment analysis reveals what customers really think so you improve products faster.",
  alternates: {
    canonical: "https://insydz.com/features/review-analytics-feature",
  },
};

const schemaSoftwareReview = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#review-analytics",
  "name": "Insydz Review Analytics",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/review-analytics-feature",
  "description": "Analyse Amazon & Flipkart reviews with Insydz. AI sentiment analysis reveals what customers really think so you improve products faster.",
  "featureList": [
    "Hindi + English review analysis",
    "Complaint theme extraction",
    "Sentiment score (0-100)",
    "WhatsApp alerts for negative reviews",
    "30/60/90-day sentiment trends",
    "Competitor sentiment comparison",
    "Feature-level sentiment mapping"
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

const schemaBreadcrumbReview = {
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
      "name": "Review Analytics",
      "item": "https://insydz.com/features/review-analytics-feature"
    }
  ]
};

const schemaFAQReview = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI analyze reviews?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Insydz analyzes Amazon India and Flipkart reviews in Hindi, Hinglish, and English using AI to detect sentiment, extract topics, and rank complaints."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track multiple products at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz tracks multiple products across Amazon India and Flipkart. Free plan supports up to 25 products."
      }
    },
    {
      "@type": "Question",
      "name": "Does it work for Amazon India and Flipkart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz supports both Amazon India and Flipkart from a single dashboard."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get alerts for negative trends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz sends WhatsApp alerts when negative sentiment or complaint frequency crosses your threshold."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Insydz offers a free plan with review analytics for up to 25 products."
      }
    },
    {
      "@type": "Question",
      "name": "Can I export insights?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can export reports including sentiment trends and complaint analysis as PDF or CSV."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareReview) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbReview) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQReview) }}
      />
      <ReviewAnalyticsContent />
    </>
  );
}
