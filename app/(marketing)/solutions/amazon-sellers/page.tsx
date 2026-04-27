import { Metadata } from "next";
import AmazonSellersContent from "./amazon-sellers-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon India Seller Analytics Tool | Price Tracker & Review AI | Insydz",
  description: "Boost your Amazon.in sales with India's native analytics tool. Real-time competitor price tracking, AI-powered review mining, and keyword rank monitoring for Indian sellers.",
  alternates: {
    canonical: "https://insydz.com/solutions/amazon-sellers",
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
    "description": "India's most comprehensive Amazon seller analytics tool — built for sellers doing ₹5L to ₹50L a month.",
    "url": "https://insydz.com/solutions/amazon-sellers"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Amazon India Sellers", "item": "https://insydz.com/solutions/amazon-sellers" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best Amazon seller analytics tool in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive Amazon seller analytics tool, built specifically for Amazon.in. Unlike US-based tools like Helium 10 or Jungle Scout, Insydz works with Indian pricing in INR, supports Amazon India categories, and sends real-time alerts via WhatsApp — not just email. It's designed for sellers doing ₹5L to ₹50L+ monthly." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz track competitor prices on Amazon India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors 100+ competitors across your Amazon India category continuously. When a competitor changes their price, you receive an instant WhatsApp notification, so you can make a repricing decision within minutes — not after losing a day of sales." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz help me improve my Amazon keyword rankings?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz tracks your keyword positions daily on Amazon India and alerts you the moment a ranking slips. The AI then tells you exactly which listing changes or pricing adjustments to make to recover your position. It functions as a full Amazon product research tool and SEO assistant in one." }
      },
      {
        "@type": "Question",
        "name": "Is Insydz suitable for small sellers or beginners on Amazon India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Insydz has a free plan that requires no credit card and takes under 2 minutes to set up. Whether you're launching your first product or managing a growing catalogue, the platform adjusts to your needs." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Helium 10 or Jungle Scout for Indian sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Helium 10 and Jungle Scout are primarily built for Amazon.com in the US. They have limited and often inaccurate data for Amazon India. Insydz is built exclusively for Amazon India — with native INR data, India-specific keyword trends, local competitor dynamics, and WhatsApp alerts." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz work for D2C brands and Amazon agencies in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports multi-brand and multi-ASIN management, making it ideal for D2C brands managing multiple product lines and agencies managing portfolios for multiple clients. Agencies can book a demo for a walkthrough of team and white-label features." }
      },
      {
        "@type": "Question",
        "name": "What makes Insydz's review analysis different from manual reading?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz's AI has already analysed over 250,000 reviews on Amazon India. Instead of reading reviews yourself, you get a ranked list of your most pressing product issues, the percentage of customers mentioning each problem, and actionable fixes — saving 10+ hours a week." }
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
      <AmazonSellersContent />
    </>
  );
}
