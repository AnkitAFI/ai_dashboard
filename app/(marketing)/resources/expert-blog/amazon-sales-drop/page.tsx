import { Metadata } from "next";
import AmazonSalesDropContent from "./amazon-sales-drop-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon India Sales Drop Suddenly",
  description:
    "Learn how to start and scale an Amazon Private Label business in India in 2026. From product research to sourcing and building a D2C brand.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-sales-drop",
  },
};

const schemaAmazonSalesDrop = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-sales-drop",
      url: "https://insydz.com/resources/expert-blog/amazon-sales-drop",
      name: "Why Did My Amazon India Sales Drop Suddenly? A Step-by-Step Diagnosis Guide",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      about: {
        "@id": "https://insydz.com/#organization",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly#breadcrumb",
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
          name: "Blog",
          item: "https://insydz.com/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Why Did My Amazon India Sales Drop Suddenly? A Step-by-Step Diagnosis Guide",
          item: "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly#article",
      headline:
        "Why Did My Amazon India Sales Drop Suddenly? A Step-by-Step Diagnosis Guide",
      description:
        "Orders dropped from 34 to 12 almost overnight. There is a specific, diagnosable cause and a 24hour path to finding it. Verify exact wording.",
      image: "/Banner image.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-06-23",
      dateModified: "2026-06-23",
      mainEntityOfPage: {
        "@id":
          "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly",
      },
      keywords: [
        "Amazon sales drop",
        "Amazon India sales dropped suddenly",
        "Amazon Buy Box loss",
        "Amazon listing suppressed sales drop",
        "Amazon seller diagnosis",
        "Amazon sales troubleshooting India",
      ],
      articleSection: "Drop Diagnosis, Pricing Intelligence (low confidence)",
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/blog/why-did-my-amazon-india-sales-drop-suddenly#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why did my Amazon India sales drop suddenly with no obvious reason?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The most common hidden causes are Buy Box loss, listing suppression Amazon does not notify you about, and a keyword ranking drop triggered by declining sales velocity. None of these appear as a clear alert in Seller Central — you have to check each one manually or use a tool like Insydz.",
          },
        },
        {
          "@type": "Question",
          name: "How do I check if a competitor took my Buy Box?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Go to your listing on Amazon India as a regular buyer and check who holds the Buy Box. If the price shown is lower than yours, a competitor has undercut you and taken it. Insydz sends price change alerts the same night so you catch this before your sessions fall the following morning.",
          },
        },
        {
          "@type": "Question",
          name: " Does a ranking drop always cause a sales drop?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not always. A ranking drop causes a traffic drop — fewer buyers see your listing. But if your conversion rate is also falling, that is a separate problem. Distinguishing between a traffic drop and a conversion drop is the most important first step, because the fix for each is completely different.",
          },
        },
        {
          "@type": "Question",
          name: " How long does it take to recover lost Amazon India rankings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A ranking drop from a temporary sales velocity dip typically recovers in 7 to 21 days if you act quickly on the root cause. Buy Box loss and listing suppression recover faster once fixed, often within 48 to 72 hours. Sustained competitor pressure takes longer and requires a deliberate pricing or listing quality response.",
          },
        },
        {
          "@type": "Question",
          name: " Should I immediately lower my price when sales drop suddenly?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Cutting price without knowing the cause often makes things worse. If the cause is a listing suppression, price cuts help nothing. Diagnose first using the checklist in this guide, then act with precision on the actual problem.",
          },
        },
        {
          "@type": "Question",
          name: "Can Insydz help me monitor and prevent sudden Amazon sales drops?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Insydz tracks your keyword rankings daily and sends alerts when a competitor changes price or when your rank drops significantly. Instead of discovering a problem after two days of lost sales, you catch it the same morning it happens and act before the sales velocity drop compounds into a ranking drop.",
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
          __html: JSON.stringify(schemaAmazonSalesDrop),
        }}
      />
      <AmazonSalesDropContent />
    </>
  );
}
