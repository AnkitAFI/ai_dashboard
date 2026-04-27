import { Metadata } from "next";
import OurVisionContent from "./our-vision-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Our Vision — Building the Intelligence Layer for Indian E-commerce",
  description: "Discover the vision behind Insydz. We're building the intelligence backbone for Indian marketplace sellers to power smarter pricing, research, and growth decisions.",
  alternates: {
    canonical: "https://insydz.com/about/our-vision",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/about/our-vision#webpage",
    "url": "https://insydz.com/about/our-vision",
    "name": "Our Vision — Building the Intelligence Layer for Indian E-commerce",
    "description": "Discover the vision behind Insydz. We're building the intelligence backbone for Indian marketplace sellers to power smarter pricing, research, and growth decisions.",
    "breadcrumb": { "@id": "https://insydz.com/about/our-vision#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/about/our-vision#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://insydz.com/about" },
      { "@type": "ListItem", "position": 3, "name": "Our Vision", "item": "https://insydz.com/about/our-vision" }
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
      <OurVisionContent />
    </>
  );
}
