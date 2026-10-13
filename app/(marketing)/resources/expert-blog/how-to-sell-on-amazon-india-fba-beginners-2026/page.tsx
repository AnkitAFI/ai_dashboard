import { Metadata } from "next";
import HowToSellOnAmazonIndiaFBABeginners2026Content from "./how-to-sell-on-amazon-india-fba-beginners-2026-content";

export const dynamic = "force-static";

const PAGE_URL =
  "https://insydz.com/resources/expert-blog/how-to-sell-on-amazon-india-fba-beginners-2026";

const TITLE =
  "How to Sell on Amazon (Step by Step Tutorial): Amazon FBA for Beginners 2026";

const DESCRIPTION =
  "A step by step tutorial on how to sell on Amazon India in 2026: registration, FBA, listings, pricing, ads and the tools beginners need.";

const KEYWORDS = [
  "how to sell on amazon india",
  "amazon fba for beginners",
  "amazon fba india 2026",
  "sell on amazon step by step",
  "amazon seller registration india",
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    url: PAGE_URL,
  },
};

const schemaHowToSellOnAmazonIndia2026 = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
      description:
        "AI powered marketplace analytics for Amazon India and Flipkart sellers.",
    },
    {
      "@type": "WebPage",
      "@id": PAGE_URL,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
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
          name: "How to Sell on Amazon India",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${PAGE_URL}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      image:
        "https://insydz.com/images/blogs/37-how-to-sell-on-amazon-india-fba-beginners-2026/37_blog_cover_image.webp",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-10-12",
      dateModified: "2026-10-12",
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en-IN",
      keywords: KEYWORDS,
      articleSection: "Seller Basics",
      wordCount: 1400,
      timeRequired: "PT7M",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How much does it cost to start selling on Amazon India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon's seller page lists no registration fee. You pay selling fees when orders come in, and Amazon deducts them from your sales payout. Your main starting costs are inventory, packaging and product photography, so plan your first batch around what you can comfortably afford to hold for a few weeks.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a GST number to sell on Amazon?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon's seller page asks for a GST or PAN number and an active bank account to register. Whether you must hold a GST registration depends on your product category and your turnover, so confirm the rule for your business with your accountant before you create your first listing.",
          },
        },
        {
          "@type": "Question",
          name: "Is Amazon FBA worth it for beginners?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Often yes, for fast moving products. Amazon stores, packs and ships orders and handles returns and customer support, and the Prime badge can help you win the Add to Cart box. FBA adds its own fees, so test it with one small batch before you commit more stock.",
          },
        },
        {
          "@type": "Question",
          name: "How often do Amazon sellers get paid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon states that payment for your sales, minus seller fees, is deposited into your bank account every 7 days. Cash flow still needs planning, because you pay for stock first and receive sales money later, so keep enough working capital to reorder before you run out.",
          },
        },
        {
          "@type": "Question",
          name: "Can I sell on Flipkart as well as Amazon?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, and many sellers do once their first marketplace is stable. Start with one platform and learn your costs, fees and ad results, then add Flipkart so you are not managing two learning curves at once. Compare the two marketplaces first, since fees and buyer habits differ.",
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaHowToSellOnAmazonIndia2026),
        }}
      />
      <HowToSellOnAmazonIndiaFBABeginners2026Content />
    </>
  );
}
