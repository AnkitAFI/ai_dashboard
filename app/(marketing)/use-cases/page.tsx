import { Metadata } from "next";
import UseCasesContent from "./use-cases-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "E-commerce Use Cases for Amazon & Flipkart Sellers | Insydz",
  description: "Explore how Indian sellers use Insydz to track competitor prices, find profitable products, improve SEO, and analyze reviews on Amazon & Flipkart.",
  alternates: {
    canonical: "https://insydz.com/use-cases",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/use-cases#webpage",
    "url": "https://insydz.com/use-cases",
    "name": "E-commerce Use Cases for Amazon & Flipkart Sellers | Insydz",
    "description": "Explore how Indian sellers use Insydz to track competitor prices, find profitable products, improve SEO, and analyze reviews on Amazon & Flipkart.",
    "breadcrumb": { "@id": "https://insydz.com/use-cases#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/use-cases#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" }
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
      <UseCasesContent />
    </>
  );
}
