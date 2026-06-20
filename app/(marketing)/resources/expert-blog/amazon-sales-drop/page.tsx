import { Metadata } from "next";
import AmazonSalesDropContent from "./amazon-sales-drop-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Private Label Guide for Indian Sellers in 2026: The Complete Guide",
  description: "Learn how to start and scale an Amazon Private Label business in India in 2026. From product research to sourcing and building a D2C brand.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-sales-drop",
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
      "@id": "https://insydz.com/resources/expert-blog/amazon-sales-drop",
      "url": "https://insydz.com/resources/expert-blog/amazon-sales-drop",
      "name": "Amazon Private Label Guide for Indian Sellers in 2026: The Complete Guide",
      "description": "Learn how to start and scale an Amazon Private Label business in India in 2026. From product research to sourcing and building a D2C brand.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-sales-drop#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-sales-drop#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon Private Label India 2026", "item": "https://insydz.com/resources/expert-blog/amazon-sales-drop" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-sales-drop#article",
      "headline": "Amazon Private Label Guide for Indian Sellers in 2026: The Complete Guide",
      "description": "Starting a private label brand is the best way to build a sustainable e-commerce business in India. Here is your 2026 playbook.",
      "image": "https://insydz.com/build-your-brand.png",
      "author": { "@type": "Organization", "name": "Insydz Research Team", "url": "https://insydz.com" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-15",
      "dateModified": "2026-05-15",
      "keywords": ["amazon private label india","private label amazon 2026","sell on amazon india","ecommerce brand building india"],
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
      <AmazonSalesDropContent />
    </>
  );
}
