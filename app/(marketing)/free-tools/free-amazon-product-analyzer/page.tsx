import { Metadata } from "next";
import FreeAmazonProductAnalyzerContent from "./free-amazon-product-analyzer-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Amazon Product Analyzer for Indian Sellers | Insydz",
  description: "Analyze Amazon India products for free. Get insights into demand, competition, pricing, and customer sentiment to make data-driven selling decisions.",
  alternates: {
    canonical: "https://insydz.com/free-tools/free-amazon-product-analyzer",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/free-tools/free-amazon-product-analyzer#webpage",
    "url": "https://insydz.com/free-tools/free-amazon-product-analyzer",
    "name": "Free Amazon Product Analyzer for Indian Sellers | Insydz",
    "description": "Analyze Amazon India products for free. Get insights into demand, competition, pricing, and customer sentiment to make data-driven selling decisions.",
    "breadcrumb": { "@id": "https://insydz.com/free-tools/free-amazon-product-analyzer#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/free-tools/free-amazon-product-analyzer#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Amazon Product Analyzer", "item": "https://insydz.com/free-tools/free-amazon-product-analyzer" }
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
      <FreeAmazonProductAnalyzerContent />
    </>
  );
}
