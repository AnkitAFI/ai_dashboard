import { Metadata } from "next";
import BrandManagersContent from "./brand-managers-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Ecommerce Intelligence for Brand & Category Managers | Insydz",
  description: "Equip your brand and category teams with real-time market intelligence. Monitor competitor positioning, category trends, and brand performance across Amazon & Flipkart.",
  alternates: {
    canonical: "https://insydz.com/solutions/brand-managers",
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
    "description": "India's most comprehensive brand monitoring tool for Amazon and Flipkart brand managers.",
    "url": "https://insydz.com/solutions/brand-managers"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://insydz.com/solutions" },
      { "@type": "ListItem", "position": 3, "name": "Brand Managers", "item": "https://insydz.com/solutions/brand-managers" }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best brand monitoring tool for Amazon and Flipkart in India?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz is India's most comprehensive brand monitoring tool built for Amazon.in and Flipkart. Unlike Brandwatch or BrandMentions that track social media, Insydz tracks marketplace-specific signals — competitor pricing, keyword rankings, review sentiment, and market share — in real time, in INR, with AI-powered recommendations for brand managers." }
      },
      {
        "@type": "Question",
        "name": "How does Insydz help brand managers protect market share on Indian marketplaces?",
        "acceptedAnswer": { "@type": "Answer", "text": "Insydz monitors your brand's market share position across Amazon and Flipkart in real time. When a competitor launches at a lower price, gains keyword ranking, or accumulates reviews faster, you receive an immediate alert with exact data and an AI recommendation. Threats that took weeks to discover are now visible within hours." }
      },
      {
        "@type": "Question",
        "name": "How is Insydz different from Brandwatch or BrandMentions for Indian brand managers?",
        "acceptedAnswer": { "@type": "Answer", "text": "Brandwatch and BrandMentions track social media mentions — excellent for PR monitoring. Insydz tracks what happens on the marketplaces where your brand actually sells: pricing moves, keyword shifts, competitor launches, review sentiment, and market share data — all in INR, all India-specific, all tied to your actual revenue." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz track brand sentiment through customer reviews on Amazon and Flipkart?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's AI has analysed 250,000+ reviews on Indian marketplaces. It surfaces recurring positive and negative themes, tracks sentiment trends over time, compares your brand perception against competitors, and alerts you when a new negative pattern emerges — before it becomes a visible rating problem." }
      },
      {
        "@type": "Question",
        "name": "Does Insydz support multi-brand portfolio tracking?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz's multi-brand portfolio view lets brand managers monitor all product lines and competitors simultaneously. Track GMV trends, market share shifts, keyword rankings, and review sentiment across every SKU — with executive-ready reports generated automatically for leadership review." }
      },
      {
        "@type": "Question",
        "name": "What is price elasticity analysis and how does Insydz use it?",
        "acceptedAnswer": { "@type": "Answer", "text": "Price elasticity analysis models how sales volume responds to price changes. Insydz's AI builds this model for your specific category on Amazon and Flipkart, then recommends the optimal price to hold market position without eroding margin. Brand managers can run pricing scenarios before making decisions that affect crores of revenue." }
      },
      {
        "@type": "Question",
        "name": "Can Insydz generate executive reports for brand leadership reviews?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Insydz auto-generates executive-ready performance reports in one click — market share trend charts, competitive landscape summaries, keyword position movement, sentiment scores, and GMV performance. What previously took 6+ analyst hours takes 90 seconds with Insydz." }
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
      <BrandManagersContent />
    </>
  );
}
