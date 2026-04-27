import { Metadata } from "next";
import TrackCompetitorPricesContent from "./track-competitor-prices-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Real-Time Competitor Price Tracking for Amazon & Flipkart | Insydz",
  description: "Monitor competitor prices automatically with Insydz. Get instant alerts on price drops, track Buy Box risks, and optimize your pricing strategy on Indian marketplaces.",
  alternates: {
    canonical: "https://insydz.com/use-cases/track-competitor-prices",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Competitor Price Tracker",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful competitor price tracking tool for Amazon and Flipkart sellers.",
    "url": "https://insydz.com/use-cases/track-competitor-prices"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Track Competitor Prices", "item": "https://insydz.com/use-cases/track-competitor-prices" }
    ]
  }
];

export default function Page() {
  return (
    <>
      {SCHEMAS.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <TrackCompetitorPricesContent />
    </>
  );
}
