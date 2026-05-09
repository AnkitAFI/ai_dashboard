import { Metadata } from "next";
import AmazonVineProgramContent from "./vine-program-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost?",
  description: "Learn the flat fee per ASIN, enrollment criteria, and strategic benefits of Amazon Vine India in 2026. Get 30 verified reviews and boost your launch velocity.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
  },
};

const schemaVineProgram = {
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
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "url": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "name": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
      "description": "Learn the flat fee per ASIN, enrollment criteria, and strategic benefits of Amazon Vine India in 2026. Get 30 verified reviews and boost your launch velocity.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon Vine Program India 2026", "item": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#article",
      "headline": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
      "description": "Amazon Vine reviews help new products gain traction. Here's how to enroll and maximize results in 2026.",
      "image": "https://insydz.com/assets/images/blog/amazon-vine-program-india-2026.png",
      "author": { "@type": "Organization", "name": "Insydz Research Team", "url": "https://insydz.com" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-08",
      "dateModified": "2026-05-08",
      "keywords": ["amazon vine program india","amazon reviews india","vine voices india","amazon seller reviews 2026","ecommerce reviews india"],
      "articleSection": "Seller Tools & Strategy",
      "inLanguage": "en-IN"
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaVineProgram) }}
      />
      <AmazonVineProgramContent />
    </>
  );
}
