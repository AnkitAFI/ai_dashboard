import { Metadata } from "next";
import IncreaseSalesAmazonIndiaWithoutAdSpendContent from "./increase-sales-amazon-india-without-ad-spend-content";

export const dynamic = "force-static";

const PAGE_URL =
  "https://insydz.com/resources/expert-blog/increase-sales-amazon-india-without-ad-spend";

const TITLE = "Increase Sales on Amazon India Without More Ad Spend | Insydz";

const HEADLINE =
  "How Can You Increase Sales on Amazon India Without Increasing Ad Spend?";

const DESCRIPTION =
  "Six practical ways to increase sales on Amazon India without raising ad spend: conversion, Buy Box, brand tools and smarter use of your current budget.";

const KEYWORDS = [
  "increase sales on amazon india",
  "amazon india sales without ads",
  "amazon conversion rate india",
  "amazon buy box india",
  "amazon brand registry india",
];

const COVER_IMAGE =
  "https://insydz.com/images/blogs/38-increase-sales-amazon-india-without-ad-spend/38_blog_cover_image.webp";

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

const schemaIncreaseSalesWithoutAdSpend = {
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
          name: "Increase Sales Without Ad Spend",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${PAGE_URL}#article`,
      headline: HEADLINE,
      description: DESCRIPTION,
      image: COVER_IMAGE,
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-10-24",
      dateModified: "2026-10-24",
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en-IN",
      keywords: KEYWORDS,
      articleSection: "Seller Growth",
      wordCount: 1300,
      timeRequired: "PT6M",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Can you increase sales on Amazon without running ads?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Better images, clearer listings, stronger reviews, a winning price and steady stock all raise conversion, which means more orders from the same traffic. Ads still help new listings get seen, but fixing the listing first makes every ad rupee work harder.",
          },
        },
        {
          "@type": "Question",
          name: "What is a good conversion rate on Amazon India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It varies by category and price, so compare your listing with similar products, not a single number. In Seller Central Business Reports, the Unit Session Percentage shows your conversion. If it sits below competitors selling at a similar price, fix the listing before you add budget.",
          },
        },
        {
          "@type": "Question",
          name: "How do I win the Buy Box on Amazon India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Price, stock availability and fulfilment all matter. Amazon says FBA can improve your chance of winning the Add to Cart box. Keep stock in, track competitor prices daily and avoid dropping below your price floor just to match every cut.",
          },
        },
        {
          "@type": "Question",
          name: "How long do listing changes take to improve sales?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Image and bullet changes can show in your conversion within one to two weeks, once enough buyers have seen the new version. Review and rating gains take longer. Change one thing at a time so you can tell which edit made the difference.",
          },
        },
        {
          "@type": "Question",
          name: "Is Amazon Brand Registry worth it for small sellers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "If you own a brand, often yes. Amazon says Brand Registry unlocks tools to protect and build your brand, including A+ Content and a free Store. You need an active or pending trademark to start enrolment, so factor that cost and time in.",
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
          __html: JSON.stringify(schemaIncreaseSalesWithoutAdSpend),
        }}
      />
      <IncreaseSalesAmazonIndiaWithoutAdSpendContent />
    </>
  );
}
