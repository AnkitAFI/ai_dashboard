import { Metadata } from "next";
import AmazonReviewAnalysisContent from "./amazon-review-analysis-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Analyze Amazon Reviews Tool: The Complete Guide for Indian Sellers (2026)",
  description: "Discover how AI-powered review analysis helps Amazon India and Flipkart sellers surface buyer pain points, sentiment clusters, and competitor weaknesses.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india",
  },
};

const schemaReviewAnalysis = {
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
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india",
      "url": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india",
      "name": "Analyze Amazon Reviews Tool: The Complete Guide for Indian Sellers (2026)",
      "description": "AI-powered Amazon review analysis for Indian D2C sellers — sentiment clustering, Hinglish support, RTO signals, and WhatsApp alerts.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon Review Analysis Guide", "item": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india#article",
      "headline": "Analyze Amazon Reviews Tool: The Complete Guide for Indian Sellers (2026)",
      "description": "How to Analyze 1000+ Amazon Reviews in Minutes: India Seller Guide for 2026",
      "image": "https://insydz.com/amazon-review-analysis-hero.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-04-22",
      "dateModified": "2026-04-22",
      "mainEntityOfPage": { "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india" },
      "keywords": ["Amazon review analysis tool", "sentiment analysis Amazon India", "Flipkart review mining", "D2C buyer insights"],
      "articleSection": "Review Intelligence",
      "inLanguage": "en"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-review-analysis-guide-india#faq",
      "mainEntity": [
        { "@type": "Question", "name": "How does AI analyze Amazon reviews?", "acceptedAnswer": { "@type": "Answer", "text": "Insydz uses NLP to cluster reviews into themes like 'packaging', 'quality', and 'price', even supporting Hinglish and regional search patterns." } },
        { "@type": "Question", "name": "Does it support Flipkart reviews?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, Insydz provides 100% native support for both Amazon.in and Flipkart review analysis." } }
      ]
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaReviewAnalysis) }}
      />
      <AmazonReviewAnalysisContent />
    </>
  );
}
