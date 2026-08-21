import { Metadata } from "next";
import SellerDashboardContent from "./seller-dashboard-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz — Amazon & Flipkart Seller Dashboard",
  description:
    "Track prices, research products, and grow your marketplace business with a seller dashboard made specifically for Indian Amazon and Flipkart sellers.",
  alternates: {
    canonical: "https://insydz.com/seller-dashboard",
  },
};

const SCHEMAS = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/seller-dashboard/#webpage",
      url: "https://insydz.com/seller-dashboard",
      name: "Insydz — Amazon & Flipkart Seller Dashboard",
      description:
        "Track prices, research products, and grow your marketplace business with a seller dashboard made specifically for Indian Amazon and Flipkart sellers.",
      breadcrumb: { "@id": "https://insydz.com/seller-dashboard/#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/seller-dashboard/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Seller Dashboard",
          item: "https://insydz.com/seller-dashboard",
        },
      ],
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
      <SellerDashboardContent />
    </>
  );
}
