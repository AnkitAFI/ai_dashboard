import { Metadata } from "next";
import FreeCompetitorPriceCheckerContent from "./free-competitor-price-checker-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Amazon Competitor Price Checker | Insydz",
  description: "Check Amazon India competitor prices for free. Get instant snapshots of price ranges, seller counts, and Buy Box win probability for any product ASIN.",
  alternates: {
    canonical: "https://insydz.com/free-tools/free-competitor-price-checker",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/free-tools/free-competitor-price-checker#webpage",
    "url": "https://insydz.com/free-tools/free-competitor-price-checker",
    "name": "Free Amazon Competitor Price Checker | Insydz",
    "description": "Check Amazon India competitor prices for free. Get instant snapshots of price ranges, seller counts, and Buy Box win probability for any product ASIN.",
    "breadcrumb": { "@id": "https://insydz.com/free-tools/free-competitor-price-checker#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/free-tools/free-competitor-price-checker#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Competitor Price Checker", "item": "https://insydz.com/free-tools/free-competitor-price-checker" }
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
      <FreeCompetitorPriceCheckerContent />
    </>
  );
}
