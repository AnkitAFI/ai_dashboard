import { Metadata } from "next";
import PricingContent from "./pricing-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz Pricing — Plans, Subscriptions & Free Trial",
  description: "View Insydz pricing plans, flexible monthly and annual subscriptions for solo sellers, agencies, and brands. Compare features and start your free trial today.",
  alternates: {
    canonical: "https://insydz.com/pricing",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/pricing#webpage",
    "url": "https://insydz.com/pricing",
    "name": "Insydz Pricing — Plans, Subscriptions & Free Trial",
    "description": "View Insydz pricing plans, flexible monthly and annual subscriptions for solo sellers, agencies, and brands. Compare features and start your free trial today.",
    "breadcrumb": { "@id": "https://insydz.com/pricing#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/pricing#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://insydz.com/pricing" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is the free plan really free forever?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes! Our free plan is completely free forever. No credit card required, no hidden charges. Start tracking your products and competitors right away, and upgrade only when you see real value." }
      },
      {
        "@type": "Question",
        "name": "Do I need a credit card to start?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely not. You can start with our free plan without entering any payment information. Just sign up and start exploring Insydz immediately." }
      },
      {
        "@type": "Question",
        "name": "Can I upgrade or downgrade anytime?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes, you have complete flexibility. Upgrade when you need more features, downgrade if you need to scale back. No long-term contracts, no penalties. Your data and settings remain safe." }
      }
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
      <PricingContent />
    </>
  );
}
