import { Metadata } from "next";
import FindCompetitorKeywordsAmazonIndiaContent from "./find-competitor-keywords-amazon-india-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Find Competitor Keywords on Amazon India 2026 Guide",
  description:
    "Discover exactly which keywords your Amazon India competitors rank for and use that gap to outrank them in 2026. Reverse ASIN research made practical.",
  alternates: {
    canonical:
      "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
  },
};

const schemaFindCompetitorKeywords = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: {
        "@type": "ImageObject",
        url: "https://insydz.com/logo.png",
      },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
      description:
        "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers.",
    },
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
      url:
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
      name: "Find Competitor Keywords on Amazon India 2026 Guide",
      description:
        "Your competitor ranks for 47 keywords you have never targeted. Some are your category's highest converting terms. Here is how to find them and use them.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: "https://insydz.com/resources",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Expert Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Find Competitor Keywords on Amazon India",
          item:
            "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/find-competitor-keywords-amazon-india#article",
      headline:
        "How to Find Every Keyword Your Amazon India Competitor Is Ranking For (And Use It to Outrank Them)",
      description:
        "Discover exactly which keywords your Amazon India competitors rank for and use the gap to outrank them in 2026. Reverse ASIN research, keyword gap analysis, and listing optimisation.",
      image:
        "https://insydz.com/Banner_find-competitor-keywords-amazon-india.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-06-04",
      dateModified: "2026-06-04",
      keywords: [
        "find competitor keywords amazon india",
        "competitor keyword spy amazon india",
        "amazon keyword gap analysis india",
        "what keywords competitor ranks amazon india",
        "amazon keyword research tool india",
        "reverse ASIN keyword tool india",
        "discover competitor ranking terms amazon",
      ],
      articleSection: "Keyword Intelligence",
      inLanguage: "en-IN",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaFindCompetitorKeywords),
        }}
      />
      <FindCompetitorKeywordsAmazonIndiaContent />
    </>
  );
}
