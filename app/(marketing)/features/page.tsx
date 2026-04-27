import { Metadata } from "next";
import FeaturesContent from "./features-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "All-in-One Amazon India & Flipkart Seller Tools | Insydz Features",
  description: "Explore Insydz features: Competitor price tracking, review analytics, keyword rank tracking, AI pricing, and WhatsApp alerts for Indian sellers.",
  alternates: {
    canonical: "https://insydz.com/features",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/features#webpage",
    "url": "https://insydz.com/features",
    "name": "All-in-One Amazon India & Flipkart Seller Tools | Insydz Features",
    "description": "Explore Insydz features: Competitor price tracking, review analytics, keyword rank tracking, AI pricing, and WhatsApp alerts for Indian sellers.",
    "breadcrumb": { "@id": "https://insydz.com/features#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/features#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://insydz.com/features" }
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
      <FeaturesContent />
    </>
  );
}
