import { Metadata } from "next";
import ReviewIntelligenceContent from "./review-intelligence-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Review Intelligence Tool for Amazon & Flipkart Sellers",
  description: "Learn how AI tools analyze customer reviews and improve ecommerce performance.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
  },
};

const schemaBlogReviewAI = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://insydz.com/logo.png"
      },
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
      "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
      "url": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
      "name": "AI Review Intelligence Tool for Amazon & Flipkart Sellers",
      "description": "Learn how AI tools analyze customer reviews and improve ecommerce performance.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "AI Review Intelligence Tool", "item": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#article",
      "headline": "AI Review Intelligence Tool for Amazon & Flipkart Sellers",
      "description": "AI tools analyze customer reviews to identify sentiment, patterns, and improve conversions.",
      "image": "https://insydz.com/assets/images/blog/ai-review-intelligence.png",
      "author": {
        "@type": "Person",
        "name": "Vikrant Singh",
        "url": "https://insydz.com/author/vikrant-singh"
      },
      "publisher": {
        "@id": "https://insydz.com/#organization"
      },
      "datePublished": "2025-01-01",
      "dateModified": "2025-01-01",
      "mainEntityOfPage": {
        "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers"
      },
      "keywords": [
        "AI review intelligence tool",
        "Amazon review analysis",
        "Flipkart review analytics",
        "sentiment analysis ecommerce"
      ],
      "articleSection": "Ecommerce Analytics",
      "inLanguage": "en"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#tool",
      "name": "AI Review Intelligence Tool",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "AI tool that analyzes ecommerce reviews to detect sentiment and insights.",
      "url": "https://insydz.com",
      "publisher": {
        "@id": "https://insydz.com/#organization"
      },
      "featureList": [
        "Review sentiment analysis",
        "Detect complaints and patterns",
        "Competitor review insights",
        "Product improvement insights",
        "Regional language analysis"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an AI review intelligence tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It analyzes customer reviews to extract sentiment and insights."
          }
        },
        {
          "@type": "Question",
          "name": "How does AI analyze reviews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI processes large datasets to detect sentiment and patterns automatically."
          }
        },
        {
          "@type": "Question",
          "name": "Why is review analysis important?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It helps improve products, listings, and conversions."
          }
        },
        {
          "@type": "Question",
          "name": "Can AI detect patterns in reviews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, it identifies recurring complaints and trends quickly."
          }
        },
        {
          "@type": "Question",
          "name": "Is it useful for competitor research?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, it reveals gaps and opportunities from competitor reviews."
          }
        }
      ]
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBlogReviewAI) }}
      />
      <ReviewIntelligenceContent />
    </>
  );
}
