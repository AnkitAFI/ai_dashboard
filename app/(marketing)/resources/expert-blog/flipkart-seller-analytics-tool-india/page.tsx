import { Metadata } from "next";
import AmazonPrivateLabelContent from "./private-label-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Flipkart Seller Analytics Tool India: The Complete Guide (2026)",
  description: "Learn how to use Flipkart Seller Analytics Tools in India to grow your business, track competitors, and improve your ranking in 2026.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india",
  },
};

const schemaPrivateLabel = {
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
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india",
      "url": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india",
      "name": "Flipkart Seller Analytics Tool India: The Complete Guide (2026)",
      "description": "Learn how to use Flipkart Seller Analytics Tools in India to grow your business, track competitors, and improve your ranking in 2026.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Flipkart Seller Analytics Tool India", "item": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/flipkart-seller-analytics-tool-india#article",
      "headline": "Flipkart Seller Analytics Tool India: The Complete Guide (2026)",
      "description": "Learn how to use Flipkart Seller Analytics Tools in India to grow your business, track competitors, and improve your ranking in 2026.",
      "image": "https://insydz.com/build-your-brand.png",
      "author": { "@type": "Organization", "name": "Insydz Research Team", "url": "https://insydz.com" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-15",
      "dateModified": "2026-05-28",
      "keywords": ["flipkart seller analytics tool india", "flipkart analytics 2026", "sell on flipkart india", "flipkart seller tools"],
      "articleSection": "Flipkart Seller Tools & Strategy",
      "inLanguage": "en-IN"
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPrivateLabel) }}
      />
      <AmazonPrivateLabelContent />
    </>
  );
}
