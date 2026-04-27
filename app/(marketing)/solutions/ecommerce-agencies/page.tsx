import { Metadata } from "next";
import EcommerceAgenciesContent from "./ecommerce-agencies-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Multi-Account Analytics for Ecommerce Agencies | Insydz",
  description: "Scale your agency with automated reporting and multi-client intelligence. Manage Amazon & Flipkart portfolios from a single dashboard with Insydz.",
  alternates: {
    canonical: "https://insydz.com/solutions/ecommerce-agencies",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most comprehensive ecommerce analytics platform for agencies managing Amazon and Flipkart clients.",
    "url": "https://insydz.com/solutions/ecommerce-agencies"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Agencies", "item": "https://insydz.com/solutions/agencies" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best ecommerce analytics platform for agencies in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive ecommerce analytics platform built specifically for agencies managing Amazon and Flipkart clients. Unlike US tools like Triple Whale or StoreHero, Insydz covers Indian marketplace data natively in INR, supports multichannel tracking, and delivers white-label reports your clients will actually value — without per-seat pricing that makes scaling unaffordable." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help ecommerce agencies manage multiple clients?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz provides a unified multi-client dashboard where agencies monitor all client accounts, competitor movements, keyword rankings, and review trends from one place. Each client gets a separate workspace with full Amazon and Flipkart tracking. Onboarding a new client takes under 10 minutes." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz generate white-label reports for my agency clients?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz auto-generates branded monthly and weekly performance reports with your agency's logo. Reports include competitor analysis, keyword rankings, pricing trends, and AI review summaries — compiled automatically. What used to take 4 hours per client now takes one click. Agencies report 10x faster client reporting cycles." }
      },
      {
        "@type": "Question",
        "name": "How many clients can an Indian agency manage on Insydz?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz agency plans support unlimited client accounts on paid tiers. Each workspace includes dedicated tracking, competitor monitoring across 100+ rivals, custom KPI dashboards, and automated reporting. Volume discounts are available for agencies managing 10+ clients." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz support multichannel tracking across Amazon and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz is a true multichannel ecommerce software platform that simultaneously tracks performance across Amazon India and Flipkart for each client. Agencies get a consolidated ecommerce dashboard showing GMV, keyword rankings, competitor prices, and review trends across both marketplaces." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help Indian agencies reduce client churn?",
        "acceptedAnswer": { "@type": "Answer", "text": "The biggest reason clients churn is that they can't see the work being done. Insydz solves this with branded monthly reports showing exactly what happened — competitors caught, rankings recovered, pricing wins made, reviews addressed. Insydz agency users report an 85% client retention rate." }
      },
      {
        "@type": "Question",
        "name": "Is Insydz suitable for small Indian agencies (under 5 clients)?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. The free agency account lets you start managing up to 3 clients with core tracking and reporting features — no credit card required. As your agency grows, paid plans unlock unlimited clients, full white-label reporting, team access controls, and API access." }
      }
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
      <EcommerceAgenciesContent />
    </>
  );
}
