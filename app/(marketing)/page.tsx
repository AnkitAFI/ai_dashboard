import { Metadata } from "next";
import LandingContent from "./landing-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon & Flipkart Seller Tools | Insydz",
  description:
    "Track competitor prices, research keywords, and win the Buy Box on Amazon & Flipkart. Get instant WhatsApp alerts with Insydz's seller dashboard. Try free.",
  alternates: {
    canonical: "https://insydz.com",
  },
};

const SCHEMAS = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/#webpage",
      url: "https://insydz.com",
      name: "AI-Powered Ecommerce Analytics Software | Insydz",
      description:
        "Track competitor prices, research keywords, and win the Buy Box on Amazon & Flipkart. Get instant WhatsApp alerts with Insydz's seller dashboard. Try free.",
      breadcrumb: { "@id": "https://insydz.com/#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: "https://insydz.com/logo.png",
      sameAs: ["https://www.linkedin.com/company/insydz"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://insydz.com/#software",
      name: "Insydz",
      url: "https://insydz.com",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "E-commerce Intelligence",
      operatingSystem: "Web",
      inLanguage: "en-IN",
      description:
        "AI-powered ecommerce analytics for Amazon and Flipkart sellers. Track competitor prices, research products, and grow sales in one dashboard.",
      creator: { "@id": "https://insydz.com/#organization" },
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: "https://insydz.com/pricing",
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "1999",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: "https://insydz.com/pricing",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "1999",
            priceCurrency: "INR",
            unitCode: "MON",
          },
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "2999",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: "https://insydz.com/pricing",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "2999",
            priceCurrency: "INR",
            unitCode: "MON",
          },
        },
      ],
      featureList: [
        "Competitor price tracking for Amazon India, Flipkart, Meesho",
        "AI review analysis in Hindi and English",
        "Keyword rank tracking for Amazon India",
        "Product research with demand scoring",
        "AI repricing recommendations",
        "WhatsApp alerts for price, stock, and reviews",
        "Festive demand insights for Indian marketplaces",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "50",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMAS) }}
      />
      <LandingContent />
    </>
  );
}
