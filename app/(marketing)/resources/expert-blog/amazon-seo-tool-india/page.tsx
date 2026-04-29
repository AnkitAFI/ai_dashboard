import { Metadata } from "next";
import AmazonSeoContent from "./amazon-seo-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon SEO Tool India – Complete Guide for Sellers",
  description: "Discover how Amazon SEO tools in India help sellers find high-converting keywords, optimize listings, and improve rankings on Amazon search results.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-seo-tool-india",
  },
};

const schemaBlogSEO = {
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
      "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india",
      "url": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india",
      "name": "Amazon SEO Tool India – Complete Guide for Sellers",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Amazon SEO Tool India", "item": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india#article",
      "headline": "Amazon SEO Tool India – Complete Guide for Sellers",
      "description": "Discover how Amazon SEO tools in India help sellers find high-converting keywords, optimize listings, and improve rankings on Amazon search results.",
      "image": "https://insydz.com/assets/images/blog/amazon-seo-tool-india.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2025-01-01",
      "dateModified": "2025-01-01",
      "mainEntityOfPage": { "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india" },
      "keywords": ["Amazon SEO tool India", "Amazon keyword research tool India", "Amazon SEO for sellers", "Amazon ranking tool", "Amazon keyword tracking India"],
      "articleSection": "Ecommerce SEO",
      "inLanguage": "en"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-seo-tool-india#faq",
      "mainEntity": [
        { "@type": "Question", "name": "What is an Amazon SEO tool?", "acceptedAnswer": { "@type": "Answer", "text": "An Amazon SEO tool helps sellers find relevant keywords, optimize product listings, and improve rankings." } },
        { "@type": "Question", "name": "Why do sellers in India need Amazon SEO tools?", "acceptedAnswer": { "@type": "Answer", "text": "They provide localized keyword data, trends, and competitor insights for Amazon India." } },
        { "@type": "Question", "name": "How do Amazon SEO tools improve rankings?", "acceptedAnswer": { "@type": "Answer", "text": "They help identify keywords, optimize listings, and improve conversion rates." } },
        { "@type": "Question", "name": "What features should an Amazon SEO tool have?", "acceptedAnswer": { "@type": "Answer", "text": "Keyword research, rank tracking, competitor analysis, and listing optimization." } }
      ]
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBlogSEO) }}
      />
      <AmazonSeoContent />
    </>
  );
}
