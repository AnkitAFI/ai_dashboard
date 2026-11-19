import { Metadata } from "next";
import AmazonVsFlipkartNewSellers2026Content from "./amazon-vs-flipkart-new-sellers-2026-content";

export const dynamic = "force-static";

const PAGE_URL =
  "https://insydz.com/resources/expert-blog/amazon-vs-flipkart-new-sellers-2026";

const TITLE = "Amazon vs Flipkart for New Sellers in 2026 | Insydz";

const HEADLINE =
  "Amazon vs Flipkart: Which Platform Should New Sellers Choose in 2026?";

const DESCRIPTION =
  "New to selling online? Compare Amazon and Flipkart on GST rules, fees, payout timing and fulfilment, and see which platform suits your category in 2026.";

const ARTICLE_DESCRIPTION =
  "A practical comparison for first time sellers covering GST rules, fees, payouts, fulfilment and the 2026 policy changes on Amazon India and Flipkart.";

const KEYWORDS = [
  "amazon vs flipkart for new sellers",
  "sell on flipkart",
  "amazon seller registration",
  "flipkart seller account registration",
  "amazon seller charges",
];

const COVER_IMAGE =
  "https://insydz.com/images/blogs/40-amazon-vs-flipkart-new-sellers-2026/40_blog_cover_image.webp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: HEADLINE,
    description: DESCRIPTION,
    type: "article",
    url: PAGE_URL,
    images: [COVER_IMAGE],
  },
};

const schemaAmazonVsFlipkartNewSellers2026 = {
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
      name: HEADLINE,
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
          name: "Amazon vs Flipkart for New Sellers in 2026",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${PAGE_URL}#article`,
      headline: HEADLINE,
      description: ARTICLE_DESCRIPTION,
      image: COVER_IMAGE,
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-11-16",
      dateModified: "2026-11-16",
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en-IN",
      keywords: KEYWORDS,
      articleSection: "Seller Guide",
      wordCount: 1150,
      timeRequired: "PT5M",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is GST registration mandatory to sell on Amazon and Flipkart?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For most sellers, yes. Both marketplaces generally require a regular GST registration even when turnover is below the usual threshold, and the composition scheme is not available to ecommerce sellers. A few exempt categories exist, so check the current list in Seller Central or Seller Hub before you register.",
          },
        },
        {
          "@type": "Question",
          name: "Which platform pays new sellers faster, Amazon or Flipkart?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Flipkart generally pays sooner. Published guides put Flipkart payouts at roughly 3 to 10 days after dispatch depending on seller tier, while Amazon usually settles about 7 days after delivery and then weekly. Timing varies by account and category, so confirm the cycle in your own dashboard before planning cash flow.",
          },
        },
        {
          "@type": "Question",
          name: "Can a new seller sell on Amazon and Flipkart at the same time?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, and many sellers do. A sensible approach is to launch on one platform, learn your fees, returns and ad costs, then add the second. Running both is easier when price, rank and review data from each platform sits in one place instead of two separate dashboards.",
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
          __html: JSON.stringify(schemaAmazonVsFlipkartNewSellers2026),
        }}
      />
      <AmazonVsFlipkartNewSellers2026Content />
    </>
  );
}
