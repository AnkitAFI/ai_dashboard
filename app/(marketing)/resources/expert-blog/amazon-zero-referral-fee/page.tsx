import { Metadata } from "next";
import AmazonZeroReferralFeeContent  from "./amazon-zero-referral-fee-content";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Competitor Undercutting Your Amazon India Price",
  description: "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
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
      "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      "url": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      "name": "Competitor Undercutting Your Amazon India Price",
      "description": "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Competitor Undercutting Your Amazon India Price", "item": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#article",
      "headline": "Competitor Undercutting Your Amazon India Price",
      "description": "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
      "image": "https://insydz.com/Banner_competitor-undercutting-amazon-india.png",
      "author": { "@type": "Organization", "name": "Insydz Research Team", "url": "https://insydz.com" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-15",
      "dateModified": "2026-05-15",
      "keywords": ["amazon india price tracking","competitor price tracking","amazon buy box","amazon price drop","amazon seller tools"],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPrivateLabel) }}
      />
      <AmazonZeroReferralFeeContent  />
    </>
  );
}
