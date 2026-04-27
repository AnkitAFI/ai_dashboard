import { Metadata } from "next";
import AnalyzeCustomerReviewsContent from "./analyze-customer-reviews-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Customer Review Analysis for Amazon & Flipkart | Insydz",
  description: "Analyse customer reviews at scale with Insydz. AI sentiment analysis for Amazon India and Flipkart reveals buyer pain points and product opportunities.",
  alternates: {
    canonical: "https://insydz.com/use-cases/analyze-customer-reviews",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/use-cases/analyze-customer-reviews#webpage",
    "url": "https://insydz.com/use-cases/analyze-customer-reviews",
    "name": "AI Customer Review Analysis for Amazon & Flipkart | Insydz",
    "description": "Analyse customer reviews at scale with Insydz. AI sentiment analysis for Amazon India and Flipkart reveals buyer pain points and product opportunities.",
    "breadcrumb": { "@id": "https://insydz.com/use-cases/analyze-customer-reviews#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/use-cases/analyze-customer-reviews#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Analyze Customer Reviews", "item": "https://insydz.com/use-cases/analyze-customer-reviews" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz analyse customer reviews on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's AI reads every customer review yours and any competitor's groups similar feedback into clusters ranked by frequency, and delivers: sentiment breakdown (positive/neutral/negative), top complaint themes with review counts, and top praise themes. Complete analysis in under 2 minutes." }
      },
      {
        "@type": "Question",
        "name": "Can I analyse competitor product reviews with Insydz?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Add any competitor ASIN or Flipkart listing and the AI analyses their reviews the same way it analyses yours. This is one of the most powerful ways new sellers use the tool before their first launch building competitor weaknesses into product advantages before day one." }
      },
      {
        "@type": "Question",
        "name": "How many reviews can Insydz analyse at once?",
        "acceptedAnswer": { "@type": "Answer", "text": "From 50 to 50,000+ reviews in under 2 minutes. The more reviews a product has, the more statistically reliable the complaint clusters become. Insydz processes over 250,000 reviews across Indian marketplaces daily." }
      }
    ]
  }
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMAS) }}
      />
      <AnalyzeCustomerReviewsContent />
    </>
  );
}
