import { Metadata } from "next";
import AvoidStockoutsContent from "./avoid-stockouts-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Stockout Prediction & Inventory Management for Sellers | Insydz",
  description: "Prevent stockouts on Amazon & Flipkart with Insydz. AI-powered stockout prediction, sales velocity tracking, and WhatsApp alerts for Indian e-commerce sellers.",
  alternates: {
    canonical: "https://insydz.com/use-cases/avoid-stockouts",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Insydz AI Inventory Management Tool",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "India's most powerful AI inventory management tool for Amazon and Flipkart sellers. Predict stockouts before they happen, receive WhatsApp alerts days in advance, and never lose rankings or sales to running out of stock.",
    "url": "https://insydz.com/use-cases/avoid-stockouts"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Use Cases", "item": "https://insydz.com/use-cases" },
      { "@type": "ListItem", "position": 3, "name": "Avoid Stockouts & Missed Sales", "item": "https://insydz.com/use-cases/avoid-stockouts" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Prevent Stockouts on Amazon India and Flipkart",
    "description": "Set up AI-powered stockout prediction with WhatsApp alerts in under 5 minutes using Insydz.",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Connect Inventory", "text": "Link Amazon India, Flipkart inventory automatically. Insydz reads current stock levels and begins tracking real-time sales velocity across all products. Setup: under 5 minutes." },
      { "@type": "HowToStep", "position": 2, "name": "AI Predicts Stockouts", "text": "Calculates exactly when you'll run out based on actual sales velocity, velocity acceleration trends, competitor stock signals, and Indian festive demand multipliers." },
      { "@type": "HowToStep", "position": 3, "name": "Get Early Alerts", "text": "WhatsApp alerts days before you run out — first alert at 14 days remaining, critical at 7 days, urgent at 3 days. Each includes stock level, days remaining, velocity, and AI-suggested reorder quantity." }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Insydz predict when I will run out of stock?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz combines current inventory level with real sales velocity (last 7, 14, and 30 days), accounts for velocity acceleration, and applies festive demand multipliers for Indian sale events. First WhatsApp alert fires when projected stockout is 14 days away — early enough to reorder before running out." }
      },
      {
        "@type": "Question",
        "name": "What happens to my Amazon India ranking when I go out of stock?",
        "acceptedAnswer": { "@type": "Answer", "text": "Your listing becomes inactive — disappearing from search entirely. When you restock, Amazon treats it as a new listing. Rankings built over weeks can drop 5–15 positions immediately. Recovery takes 4–8 weeks and requires extra ad spend. Preventing stockouts is far more valuable than recovering from them." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz monitor competitor stock levels on Amazon India and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz monitors competitor stock status signals on both platforms — detecting when top rivals are running low or going out of stock. When a competitor stocks out, demand shifts to remaining sellers including you. Insydz alerts you to act before they restock." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Amazon's built-in inventory management?",
        "acceptedAnswer": { "@type": "Answer", "text": "Amazon's tools show current stock levels and basic reorder alerts. Insydz predicts stockout dates using actual velocity trends (not static averages), monitors competitor stock signals, applies Indian festive demand multipliers, and delivers WhatsApp alerts. Works across Amazon India, Flipkart from a single dashboard." }
      },
      {
        "@type": "Question",
        "name": "How far in advance does Insydz alert me before a stockout?",
        "acceptedAnswer": { "@type": "Answer", "text": "First alert at 14 days remaining. Second critical alert at 7 days. Final urgent alert at 3 days. All customisable based on your supplier lead times — if your supplier needs 18 days, your first alert fires at 21 days." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz work for  and D2C sellers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz supports inventory tracking and stockout prediction across Amazon India, Flipkart from a single dashboard. D2C brands get a unified view of stock levels and projected stockout dates by product — prioritise restocking for the channel with the highest velocity and most to lose." }
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
      <AvoidStockoutsContent />
    </>
  );
}
