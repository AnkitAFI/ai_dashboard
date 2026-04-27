import { Metadata } from "next";
import FlipkartAnalyticsContent from "./flipkart-analytics-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
  description: "Discover the best Flipkart analytics tool for Indian sellers. Compare competitor insights, pricing automation, and seller dashboard features.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/best-flipkart-analytics-tool",
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": { "@type": "ImageObject", "url": "https://insydz.com/logo.png" },
      "sameAs": [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz"
      ],
      "description": "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers."
    },
    {
      "@type": "Article",
      "@id": "https://insydz.com/resources/expert-blog/best-flipkart-analytics-tool#article",
      "headline": "Best Flipkart Analytics Tool India: Complete Guide for Sellers (2026)",
      "datePublished": "2026-01-15",
      "dateModified": "2026-03-01",
      "author": { "@type": "Organization", "name": "Vikrant Singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "keywords": "best Flipkart analytics tool, Flipkart seller software comparison, Flipkart tracking tools India, marketplace intelligence, competitor insights, pricing automation, seller dashboard",
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/best-flipkart-analytics-tool#faq",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best Flipkart analytics tool for India?", "acceptedAnswer": { "@type": "Answer", "text": "The best Flipkart analytics tool for Indian sellers is one built natively for Flipkart marketplace data — not adapted from an Amazon-focused global tool." } },
        { "@type": "Question", "name": "How is Flipkart analytics different from Amazon.in analytics?", "acceptedAnswer": { "@type": "Answer", "text": "Flipkart has a distinct search algorithm, unique buyer intent patterns and pricing dynamics that differ from Amazon.in." } },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <FlipkartAnalyticsContent />
    </>
  );
}
