import { Metadata } from "next";
import WhatsAppAlertsContent from "./whatsapp-alerts-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "WhatsApp Alerts for Amazon & Flipkart Sellers | Insydz",
  description: "Get instant WhatsApp alerts for price drops, Buy Box changes, stockouts, and new reviews on Amazon & Flipkart with Insydz.",
  alternates: {
    canonical: "https://insydz.com/features/whatsapp-alerts-feature",
  },
};

const schemaSoftwareWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://insydz.com/#whatsapp-alerts",
  "name": "Insydz WhatsApp Alerts for Amazon Sellers",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://insydz.com/features/whatsapp-alerts-feature",
  "description": "Get instant WhatsApp alerts for price drops, Buy Box changes, stockouts, and new reviews on Amazon & Flipkart.",
  "featureList": [
    "Price change alerts — competitor drops below your threshold",
    "Stockout warning alerts — inventory running critically low",
    "Buy Box loss alerts — instant notification when Buy Box changes hands",
    "New review alerts — 1-star and 2-star reviews flagged immediately",
    "AI opportunity alerts — demand spikes and pricing gaps detected",
    "Keyword rank drop alerts — when a keyword falls a page",
    "Delivered via WhatsApp — no separate app install required"
  ],
  "offers": {
    "@type": "Offer",
    "price": "1999",
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "1999",
      "priceCurrency": "INR",
      "unitCode": "MON"
    }
  },
  "creator": {
    "@id": "https://insydz.com/#organization"
  }
};

const schemaBreadcrumbWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://insydz.com/features" },
    { "@type": "ListItem", "position": 3, "name": "WhatsApp Alerts", "item": "https://insydz.com/features/whatsapp-alerts-feature" }
  ]
};

const schemaFAQWhatsAppAlerts = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I set up WhatsApp alerts for Amazon seller notifications?",
      "acceptedAnswer": { "@type": "Answer", "text": "Connect your WhatsApp by scanning a QR code inside your Insydz dashboard, choose alert types, set thresholds, and you're live." }
    },
    {
      "@type": "Question",
      "name": "Which alerts can I receive on WhatsApp for my Amazon India store?",
      "acceptedAnswer": { "@type": "Answer", "text": "Price Change Alerts, Buy Box Lost Alert, Stockout Warnings, New Review Alerts, Rank Change Alerts, and AI Opportunity Alerts." }
    },
    {
      "@type": "Question",
      "name": "Will I be spammed with too many WhatsApp messages?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. You control alert frequency and thresholds. Most sellers get 3–8 targeted alerts per day." }
    },
    {
      "@type": "Question",
      "name": "Does this work with WhatsApp Business?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Works with WhatsApp and WhatsApp Business; multiple numbers can be added for teams or VAs." }
    },
    {
      "@type": "Question",
      "name": "Are WhatsApp alerts available on the free plan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Free plan includes alerts for price changes, stockouts, basic Buy Box alerts, and review notifications." }
    },
    {
      "@type": "Question",
      "name": "Can multiple team members receive the same WhatsApp alerts?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Paid plans allow multiple numbers with role-based alert assignments." }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareWhatsAppAlerts) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbWhatsAppAlerts) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQWhatsAppAlerts) }}
      />
      <WhatsAppAlertsContent />
    </>
  );
}
