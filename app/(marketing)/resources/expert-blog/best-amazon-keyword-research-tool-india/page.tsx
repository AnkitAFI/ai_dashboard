import { Metadata } from "next";
import AmazonKeywordToolContent from "./amazon-keyword-tool-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
  description: "Discover the best Amazon keyword research tools for India. Compare keyword gap analysis, search volume trackers, and buy intent tools.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://insydz.com/#organization",
    "name": "Insydz",
    "legalName": "Insydz Technologies Private Limited",
    "url": "https://insydz.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://insydz.com/logo.png",
      "width": 200,
      "height": 60
    },
    "description": "AI-powered ecommerce analytics solution for Indian marketplace sellers on Amazon.in, Flipkart.",
    "foundingDate": "2023",
    "foundingLocation": "India",
    "areaServed": "IN",
    "sameAs": [
      "https://twitter.com/insydz",
      "https://www.linkedin.com/company/insydz",
      "https://www.instagram.com/insydz"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["English", "Hindi"],
      "areaServed": "IN"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#article",
    "headline": "Best Amazon Keyword Research Tool India: Complete Guide for Sellers (2026)",
    "description": "Discover the best Amazon keyword research tools for India. Compare keyword gap analysis, search volume trackers, and buy intent tools.",
    "url": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india",
    "datePublished": "2026-01-10T08:00:00+05:30",
    "dateModified": "2026-01-10T08:00:00+05:30",
    "inLanguage": "en-IN",
    "author": {
      "@type": "Organization",
      "name": "Vikrant Singh"
    },
    "publisher": {
      "@id": "https://insydz.com/#organization"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://insydz.com/keyword-research-hero.png",
      "width": 1200,
      "height": 630
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india"
    },
    "keywords": [
      "amazon keyword research tool india",
      "amazon seo tools india",
      "keyword gap analysis",
      "amazon keyword tracking india",
      "flipkart keyword research"
    ],
    "articleSection": "Seller Tools & Strategy",
    "wordCount": 3800,
    "timeRequired": "PT13M"
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#howto",
    "name": "How to Do Amazon Keyword Research in India",
    "description": "Step-by-step process to find and use high-converting keywords for Amazon India listings.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Find Seed Keywords",
        "text": "Start with basic product keywords that buyers search for on Amazon.in."
      },
      {
        "@type": "HowToStep",
        "name": "Expand Keywords",
        "text": "Use tools to find related long-tail keywords and variations in Hindi and English."
      },
      {
        "@type": "HowToStep",
        "name": "Analyze Competitors",
        "text": "Check what keywords top competitors rank for and identify gaps."
      },
      {
        "@type": "HowToStep",
        "name": "Optimize Listing",
        "text": "Add keywords to title, bullets, backend fields, and description."
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best Amazon keyword research tool for India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best tool for Indian sellers is one built specifically for Amazon.in data. Insydz provides keyword tracking across Amazon, Flipkart with India-specific insights."
        }
      },
      {
        "@type": "Question",
        "name": "How is keyword research different for Amazon.in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Amazon India uses different search behavior including Hindi keywords, price-based searches, and regional variations."
        }
      },
      {
        "@type": "Question",
        "name": "What is keyword gap analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Keyword gap analysis finds keywords competitors rank for but your listing does not."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I update keywords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Review monthly and refresh fully before major sale events like Diwali or Big Billion Days."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track Flipkart keywords?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, India-focused tools allow tracking across Amazon and Flipkart."
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://insydz.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://insydz.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Seller Tools",
        "item": "https://insydz.com/blog/seller-tools"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Best Amazon Keyword Research Tool India",
        "item": "https://insydz.com/resources/expert-blog/best-amazon-keyword-research-tool-india"
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
      <AmazonKeywordToolContent />
    </>
  );
}
