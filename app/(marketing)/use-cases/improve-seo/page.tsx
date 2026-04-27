import { Metadata } from "next";
import ImproveSEOContent from "./improve-seo-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Improve Amazon & Flipkart SEO | Keyword Rank Tracking | Insydz",
  description: "Boost your search rankings on Amazon India and Flipkart with Insydz. Optimize your listings with the right keywords and track your organic rank improvements.",
  alternates: {
    canonical: "https://insydz.com/use-cases/improve-seo",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/use-cases/improve-seo#webpage",
    "url": "https://insydz.com/use-cases/improve-seo",
    "name": "Improve Amazon & Flipkart SEO | Keyword Rank Tracking | Insydz",
    "description": "Boost your search rankings on Amazon India and Flipkart with Insydz. Optimize your listings with the right keywords and track your organic rank improvements.",
    "breadcrumb": { "@id": "https://insydz.com/use-cases/improve-seo#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/use-cases/improve-seo#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Improve Amazon & Flipkart SEO", "item": "https://insydz.com/use-cases/improve-seo" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How can I improve my product ranking on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz helps you identify high-volume, low-competition keywords, optimize your titles and backend search terms, and track your ranking progress daily." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz track keyword rankings daily?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz tracks your organic rank for all your target keywords on both Amazon India and Flipkart with daily updates." }
      },
      {
        "@type": "Question",
        "name": "Can I see competitor keyword rankings?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can track any competitor's product to see which keywords they are ranking for and identify gaps in your own SEO strategy." }
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
      <ImproveSEOContent />
    </>
  );
}
