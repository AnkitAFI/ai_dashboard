import { Metadata } from "next";
import FlipkartSellersContent from "./flipkart-sellers-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Flipkart Seller SEO & Visibility Intelligence | Insydz",
  description: "Improve your Flipkart search rankings and visibility. Track competitor prices, monitor SEO gaps, and get real-time alerts built for Flipkart India sellers.",
  alternates: {
    canonical: "https://insydz.com/solutions/flipkart-sellers",
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
    "description": "India's most comprehensive Flipkart seller analytics tool.",
    "url": "https://insydz.com/solutions/flipkart-sellers"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Flipkart Sellers", "item": "https://insydz.com/solutions/flipkart-sellers" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best Flipkart seller analytics tool in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive Flipkart seller analytics tool, designed specifically for Flipkart.com sellers. It tracks competitor pricing in INR, analyses reviews with AI, monitors keyword rankings on Flipkart, and delivers instant WhatsApp alerts — giving you actionable intelligence that your Flipkart Seller Hub cannot provide." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help Flipkart sellers track competitor prices?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors 100+ competitors in your Flipkart category continuously. The moment any competitor adjusts their price, you receive a WhatsApp alert with the exact before/after figures and a suggested response — so you act within minutes, before your sales rank is affected." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz improve my keyword rankings on Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz tracks your search keyword positions on Flipkart daily. When rankings slip, you get an alert and specific listing or pricing recommendations to recover visibility. It functions as both a Flipkart performance analytics tool and an SEO optimisation assistant in one place." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Flipkart Seller Hub analytics?",
        "acceptedAnswer": { "@type": "Answer", "text": "Flipkart Seller Hub shows you what's happening inside your own store. Insydz shows you what's happening across your entire market — competitors' pricing, their review trends, their keyword positions. The Hub tells you what happened. Insydz tells you what to do next." }
      },
      {
        "@type": "Question",
        "name": "Is Insydz useful for small or new Flipkart sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. The free plan requires no credit card and takes 2 minutes to activate. New sellers immediately gain access to competitor pricing data and product analysis for their category — intelligence that used to require hours of manual research or expensive tools." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz work during Flipkart Big Billion Days and sale events?",
        "acceptedAnswer": { "@type": "Answer", "text": "This is exactly where Insydz delivers the highest value. During high-velocity sale events, competitor prices can change dozens of times a day. Insydz monitors continuously and delivers WhatsApp alerts within seconds — so you're never caught off guard during your most important selling windows of the year." }
      },
      {
        "@type": "Question",
        "name": "What Flipkart-specific problems does Insydz solve?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz addresses four core Flipkart seller problems: slow response to competitor price drops, undetected review quality deterioration, invisible keyword ranking slippage, and time wasted on manual market tracking. All four are automated — delivered to your WhatsApp as clear, actionable alerts." }
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
      <FlipkartSellersContent />
    </>
  );
}
