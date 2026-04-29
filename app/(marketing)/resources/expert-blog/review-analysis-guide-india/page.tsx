import { Metadata } from "next";
import ReviewAnalysisContent from "./review-analysis-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
  description: "Learn how to use AI review analysis to reduce returns and grow revenue. Discover the best tools for Amazon.in and Flipkart sellers in India.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/review-analysis-guide-india",
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
      "@id": "https://insydz.com/resources/expert-blog/review-analysis-guide-india",
      "url": "https://insydz.com/resources/expert-blog/review-analysis-guide-india",
      "name": "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
      "description": "Learn how to use AI review analysis to reduce returns and grow revenue. Discover the best tools for Amazon.in and Flipkart sellers in India.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/review-analysis-guide-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/review-analysis-guide-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Review Analysis Guide India", "item": "https://insydz.com/resources/expert-blog/review-analysis-guide-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/review-analysis-guide-india#article",
      "headline": "Best Review Analysis Tools for Indian Sellers: Complete Guide (2026)",
      "description": "Your customers are telling you exactly what to fix inside every review.",
      "image": "https://insydz.com/assets/images/blog/review-analysis-hero.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-01-15",
      "dateModified": "2026-01-15",
      "keywords": ["review analysis tool india","amazon sentiment analysis","flipkart review insights","D2C brand intelligence","customer feedback analysis"],
      "articleSection": "D2C Growth & Brand Intelligence",
      "inLanguage": "en-IN"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/review-analysis-guide-india#faq",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best review analysis tool for Indian sellers?", "acceptedAnswer": { "@type": "Answer", "text": "For Indian D2C brands selling on Amazon.in and Flipkart, the best review analysis tool is one built specifically for Indian marketplace reviews like Insydz." } },
        { "@type": "Question", "name": "How is Amazon sentiment analysis different from social media listening?", "acceptedAnswer": { "@type": "Answer", "text": "Amazon sentiment analysis processes structured product reviews understanding specific complaints about packaging, product defects, etc." } }
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
      <ReviewAnalysisContent />
    </>
  );
}
