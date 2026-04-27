import { Metadata } from "next";
import InsydzVsViralLaunchContent from "./insydzvsvirallaunch-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz vs Viral Launch: Best Tool for Indian Sellers | Insydz",
  description: "Compare Insydz vs Viral Launch for Amazon India sellers. Why Insydz's festive demand intelligence, WhatsApp alerts, and INR pricing win in India.",
  alternates: {
    canonical: "https://insydz.com/compare/insydzvsvirallaunch",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/compare/insydzvsvirallaunch#webpage",
    "url": "https://insydz.com/compare/insydzvsvirallaunch",
    "name": "Insydz vs Viral Launch: Best Tool for Indian Sellers | Insydz",
    "description": "Compare Insydz vs Viral Launch for Amazon India sellers. Why Insydz's festive demand intelligence, WhatsApp alerts, and INR pricing win in India.",
    "breadcrumb": { "@id": "https://insydz.com/compare/insydzvsvirallaunch#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/compare/insydzvsvirallaunch#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://insydz.com/compare" },
      { "@type": "ListItem", "position": 3, "name": "Insydz vs Viral Launch", "item": "https://insydz.com/compare/insydzvsvirallaunch" }
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
      <InsydzVsViralLaunchContent />
    </>
  );
}
