import { Metadata } from "next";
import GreatIndianFestivalBBD2026Content from "./amazon-great-indian-festival-flipkart-big-billion-days-2026";

export const dynamic = "force-static";

const PAGE_URL =
  "https://insydz.com/resources/expert-blog/amazon-great-indian-festival-flipkart-big-billion-days-2026";

const DESCRIPTION =
  "Amazon Great Indian Festival starts October 8 and Flipkart Big Billion Days on October 9, 2026. Here is what sellers should finish in the next 8 days.";

export const metadata: Metadata = {
  title: "Amazon Great Indian Festival, Flipkart BBD 2026 Guide | Insydz",
  description: DESCRIPTION,
  keywords: [
    "amazon great indian festival 2026",
    "flipkart big billion days 2026",
    "amazon great indian festival seller prep",
    "big billion days seller guide",
    "festive sale price floor",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "Amazon Great Indian Festival and Flipkart Big Billion Days 2026: What Sellers Should Do Before October 8",
    description: DESCRIPTION,
    type: "article",
    url: PAGE_URL,
  },
};

const schemaGreatIndianFestivalBBD2026 = {
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
      name: "Amazon Great Indian Festival and Flipkart Big Billion Days 2026. What should sellers do before October 8?",
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
          name: "Great Indian Festival and Big Billion Days 2026",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${PAGE_URL}#article`,
      headline:
        "Amazon Great Indian Festival and Flipkart Big Billion Days 2026. What should sellers do before October 8?",
      description: DESCRIPTION,
      image:
        "https://insydz.com/images/blogs/36-amazon-great-indian-festival-flipkart-big-billion-days-2026/36_blog_cover_image.webp",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-09-30",
      dateModified: "2026-09-30",
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en-IN",
      keywords: [
        "amazon great indian festival 2026",
        "flipkart big billion days 2026",
        "amazon great indian festival seller prep",
        "big billion days seller guide",
        "festive sale price floor",
      ],
      articleSection: "Festive Trends",
      wordCount: 1500,
      timeRequired: "PT6M",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "When does Amazon Great Indian Festival 2026 start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon India announced on September 21, 2026 that the Great Indian Festival starts on October 8, 2026. Amazon has not stated a separate early access time for Prime members in that announcement, so check Seller Central for any updates to your deal slots.",
          },
        },
        {
          "@type": "Question",
          name: "When does Flipkart Big Billion Days 2026 start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The main Flipkart Big Billion Days 2026 sale starts on October 9. Early access opens on October 8 for Flipkart Plus, Flipkart Black and Flipkart credit card members, so sellers should treat October 8 as the real start of demand.",
          },
        },
        {
          "@type": "Question",
          name: "What is the Amazon Great Indian Festival 2026 end date?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon has not published an end date yet. Sellers should plan stock and ad budgets without assuming a short window, and review the Amazon India announcement page and Seller Central for updates as the sale gets closer.",
          },
        },
        {
          "@type": "Question",
          name: "Should sellers cut prices for both sales?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only down to a price floor you have calculated in advance. The floor should cover product cost, marketplace fees, shipping, ad cost per order and a minimum margin. Below that number, extra sales usually lose money.",
          },
        },
        {
          "@type": "Question",
          name: "Is it too late to prepare with only 8 days left?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Eight days is enough to set price floors, check stock, fix listing problems and switch on alerts. It is not enough to launch a new product or wait on new inventory transfers, so focus on the listings you already sell.",
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
          __html: JSON.stringify(schemaGreatIndianFestivalBBD2026),
        }}
      />
      <GreatIndianFestivalBBD2026Content />
    </>
  );
}
