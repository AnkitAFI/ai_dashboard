import { Metadata } from "next";
import CareersContent from "./careers-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Careers at Insydz — Join Our Team of Builders",
  description: "Work at Insydz and help build the intelligence layer for Indian e-commerce. Explore open roles in product, engineering, and growth at India's leading analytics platform.",
  alternates: {
    canonical: "https://insydz.com/about/careers",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/about/careers#webpage",
    "url": "https://insydz.com/about/careers",
    "name": "Careers at Insydz — Join Our Team of Builders",
    "description": "Work at Insydz and help build the intelligence layer for Indian e-commerce. Explore open roles in product, engineering, and growth at India's leading analytics platform.",
    "breadcrumb": { "@id": "https://insydz.com/about/careers#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/about/careers#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://insydz.com/about" },
      { "@type": "ListItem", "position": 3, "name": "Careers", "item": "https://insydz.com/about/careers" }
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
      <CareersContent />
    </>
  );
}
