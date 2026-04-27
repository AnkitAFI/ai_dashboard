import { Metadata } from "next";
import FindProfitableProductsContent from "./find-profitable-products-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Find Profitable Products for Amazon & Flipkart | Insydz",
  description: "Discover high-demand, low-competition products on Amazon India and Flipkart. AI-powered product research and profitability analysis for e-commerce sellers.",
  alternates: {
    canonical: "https://insydz.com/use-cases/find-profitable-products",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz Product Research Tool",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful product profitability analysis software for Amazon and Flipkart sellers.",
    "url": "https://insydz.com/use-cases/find-profitable-products"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Find Profitable Products", "item": "https://insydz.com/use-cases/find-profitable-products" }
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
      <FindProfitableProductsContent />
    </>
  );
}
