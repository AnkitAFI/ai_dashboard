import { Metadata } from "next";
import SolutionsIndexContent from "./solutions-index-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI-Powered Ecommerce Analytics Solutions | Insydz",
  description: "Explore AI-driven analytics solutions for Amazon & Flipkart sellers. Tailored insights for private labels, resellers, agencies, and brand managers to grow sales.",
  alternates: {
    canonical: "https://insydz.com/solutions",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/solutions#webpage",
    "url": "https://insydz.com/solutions",
    "name": "AI-Powered Ecommerce Analytics Solutions | Insydz",
    "description": "Explore AI-driven analytics solutions for Amazon & Flipkart sellers. Tailored insights for private labels, resellers, agencies, and brand managers to grow sales.",
    "breadcrumb": { "@id": "https://insydz.com/solutions#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/solutions#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" }
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
      <SolutionsIndexContent />
    </>
  );
}
