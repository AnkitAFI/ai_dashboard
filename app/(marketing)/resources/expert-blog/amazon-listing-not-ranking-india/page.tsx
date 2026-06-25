import { Metadata } from "next";
import AmazonListingNotRankingIndiaContent from "./amazon-listing-not-ranking-india-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Listing Not Ranking in India? Fix It in 2026",
  description:
    "Your Amazon India listing is live but not ranking? Learn the real reasons products fail to rank and the practical fixes that improve visibility in 2026.",
  alternates: {
    canonical:
      "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
  },
};

const schemaAmazonListingNotRanking = {
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
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
      url: "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
      name: "Amazon Listing Not Ranking in India? Fix It in 2026",
      description:
        "Your Amazon listing is indexed but not ranking? Learn why products fail to appear for important keywords and how to improve visibility on Amazon India.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#breadcrumb",
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
          name: "Amazon Listing Not Ranking India",
          item: "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-listing-not-ranking-india#article",
      headline:
        "Amazon Listing Not Ranking? 11 Reasons Your Product Is Invisible on Amazon India",
      description:
        "Discover why your Amazon India listing is not ranking despite being live. Learn how indexing, keyword relevance, conversions, pricing, reviews, and competition impact rankings.",
      image: "https://insydz.com/Banner_amazon-listing-not-ranking-india.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-06-24",
      dateModified: "2026-06-24",
      keywords: [
        "amazon listing not ranking india",
        "amazon india ranking issues",
        "why my amazon product is not ranking",
        "amazon keyword ranking problem",
        "amazon listing visibility india",
        "amazon seo india",
        "amazon product not showing in search",
        "amazon ranking factors india",
        "amazon keyword indexing issue",
        "improve amazon rankings india",
      ],
      articleSection: "Amazon SEO",
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
          __html: JSON.stringify(schemaAmazonListingNotRanking),
        }}
      />
      <AmazonListingNotRankingIndiaContent />
    </>
  );
}
