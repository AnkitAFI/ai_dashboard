import { Metadata } from "next";
import RankPage1Content from "./rank-page-1-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "How to Rank on Page 1 of Amazon India: The Complete Guide (2026)",
  description: "Learn exactly how to rank on page 1 of Amazon India using the A9 algorithm, keyword optimization & competitor intelligence. Actionable guide for Indian sellers.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india",
  },
};

const schemaRankPage1 = {
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
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india",
      "url": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india",
      "name": "How to Rank on Page 1 of Amazon India: The Complete Guide (2026)",
      "description": "Learn exactly how to rank on page 1 of Amazon India using the A9 algorithm, keyword optimization & competitor intelligence.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "How to Rank Page 1 Amazon India", "item": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india" }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india#howto",
      "name": "How to Rank on Page 1 of Amazon India",
      "description": "A step-by-step guide to optimizing your Amazon India listing for better rankings.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Keyword Research",
          "text": "Identify high-volume keywords and Hinglish variations relevant to your product on Amazon.in."
        },
        {
          "@type": "HowToStep",
          "name": "Title Optimization",
          "text": "Place your primary keyword in the first 80 characters of your product title."
        },
        {
          "@type": "HowToStep",
          "name": "Backend Search Terms",
          "text": "Fill the 250-byte backend search term limit with non-duplicate, relevant keywords."
        },
        {
          "@type": "HowToStep",
          "name": "Build Sales Velocity",
          "text": "Use PPC ads and deals to build early sales history and improve conversion signals."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/how-to-rank-page-1-amazon-india#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long does it take to rank on page 1 of Amazon India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Well-optimized listings typically reach page 1 for long-tail keywords within 3–6 weeks, and primary keywords within 6–12 weeks."
          }
        },
        {
          "@type": "Question",
          "name": "Does lowering my price help me rank higher?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Partially, but conversion rate is a stronger signal. Improving listing quality often outperforms just dropping the price."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaRankPage1) }}
      />
      <RankPage1Content />
    </>
  );
}
