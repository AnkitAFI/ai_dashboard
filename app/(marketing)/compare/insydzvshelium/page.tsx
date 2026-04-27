import { Metadata } from "next";
import InsydzVsHeliumContent from "./insydzvshelium-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz vs Helium 10: Best Amazon India Seller Tool | Insydz",
  description: "Compare Insydz vs Helium 10 for Amazon India sellers. See why Insydz's Flipkart support, WhatsApp alerts, and INR pricing make it the better fit for India.",
  alternates: {
    canonical: "https://insydz.com/compare/insydzvshelium",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/compare/insydzvshelium#webpage",
    "url": "https://insydz.com/compare/insydzvshelium",
    "name": "Insydz vs Helium 10: Best Amazon India Seller Tool | Insydz",
    "description": "Compare Insydz vs Helium 10 for Amazon India sellers. See why Insydz's Flipkart support, WhatsApp alerts, and INR pricing make it the better fit for India.",
    "breadcrumb": { "@id": "https://insydz.com/compare/insydzvshelium#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/compare/insydzvshelium#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Helium 10", "item": "https://insydz.com/compare/insydzvshelium" }
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
      <InsydzVsHeliumContent />
    </>
  );
}
