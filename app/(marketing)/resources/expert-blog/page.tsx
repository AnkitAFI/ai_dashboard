import { Metadata } from "next";
import ExpertBlogContent from "./blog-index-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Expert Blog — E-commerce Intelligence & Seller Growth Insights",
  description: "Actionable strategies, data-backed guides, and marketplace insights for Amazon and Flipkart sellers in India. Learn how to grow your sales with Insydz.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/resources/expert-blog#webpage",
    "url": "https://insydz.com/resources/expert-blog",
    "name": "Expert Blog — E-commerce Intelligence & Seller Growth Insights",
    "description": "Actionable strategies, data-backed guides, and marketplace insights for Amazon and Flipkart sellers in India. Learn how to grow your sales with Insydz.",
    "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/resources/expert-blog#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
      { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" }
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
      <ExpertBlogContent />
    </>
  );
}
