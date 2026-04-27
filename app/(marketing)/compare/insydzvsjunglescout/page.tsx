import { Metadata } from "next";
import InsydzVsJungleScoutContent from "./insydzvsjunglescout-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz vs Jungle Scout: Best Tool for Amazon India & Flipkart | Insydz",
  description: "Compare Insydz vs Jungle Scout for Indian sellers. Why Insydz's Flipkart coverage, WhatsApp alerts, and Hindi review analysis win for the Indian market.",
  alternates: {
    canonical: "https://insydz.com/compare/insydzvsjunglescout",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/compare/insydzvsjunglescout#webpage",
    "url": "https://insydz.com/compare/insydzvsjunglescout",
    "name": "Insydz vs Jungle Scout: Best Tool for Amazon India & Flipkart | Insydz",
    "description": "Compare Insydz vs Jungle Scout for Indian sellers. Why Insydz's Flipkart coverage, WhatsApp alerts, and Hindi review analysis win for the Indian market.",
    "breadcrumb": { "@id": "https://insydz.com/compare/insydzvsjunglescout#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/compare/insydzvsjunglescout#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Jungle Scout", "item": "https://insydz.com/compare/insydzvsjunglescout" }
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
      <InsydzVsJungleScoutContent />
    </>
  );
}
