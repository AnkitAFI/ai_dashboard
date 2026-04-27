import { Metadata } from "next";
import ContactUsContent from "./contact-us-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch with Insydz",
  description: "Have questions? Reach out to the Insydz team for support, demo requests, partnership inquiries, or general questions about our ecommerce analytics platform.",
  alternates: {
    canonical: "https://insydz.com/about/contact-us",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/about/contact-us#webpage",
    "url": "https://insydz.com/about/contact-us",
    "name": "Contact Us — Get in Touch with Insydz",
    "description": "Have questions? Reach out to the Insydz team for support, demo requests, partnership inquiries, or general questions about our ecommerce analytics platform.",
    "breadcrumb": { "@id": "https://insydz.com/about/contact-us#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/about/contact-us#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": "https://insydz.com/about" },
      { "@type": "ListItem", "position": 3, "name": "Contact Us", "item": "https://insydz.com/about/contact-us" }
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
      <ContactUsContent />
    </>
  );
}
