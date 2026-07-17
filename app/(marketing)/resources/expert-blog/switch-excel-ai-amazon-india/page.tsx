import { Metadata } from "next";
import SwitchExcelAiAmazonIndiaContent from "./switch-excel-ai-amazon-india-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Switched from Excel to AI on Amazon India: 30 Day Results",
  description:
    "An Indian Amazon seller shares exactly what changed after ditching Excel for AI competitor tracking. Real results after 30 days.",
  alternates: {
    canonical:
      "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
  },
};

const schemaSwitchExcelAiAmazonIndia = {
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
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
      url: "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
      name: "I Ditched Excel for an AI Competitor Tracker on Amazon India. Here Is What Changed in 30 Days",
      description:
        "An Indian Amazon seller shares exactly what changed after ditching Excel for AI competitor tracking. Real results after 30 days.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#breadcrumb",
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
          name: "Switch Excel AI Amazon India",
          item: "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#article",
      headline:
        "I Ditched Excel for an AI Competitor Tracker on Amazon India. Here Is What Changed in 30 Days",
      description:
        "An Indian Amazon seller shares exactly what changed after ditching Excel for AI competitor tracking. Real results after 30 days.",
      image: "https://insydz.com/switch-excel-ai-amazon-india_blogbanner.png",
      author: {
        "@type": "Organization",
        name: "Insydz Research Team",
        url: "https://insydz.com",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-06-10",
      dateModified: "2026-06-10",
      keywords: [
        "amazon india competitor tracking",
        "excel vs ai amazon seller",
        "amazon repricing tool india",
        "amazon buy box alerts",
        "amazon seller whatsapp alerts",
        "amazon india seller tools",
        "competitor price tracking amazon",
        "amazon seller case study india",
      ],
      articleSection: "Competitor Intelligence",
      inLanguage: "en-IN",
      wordCount: 3600,
      timeRequired: "PT10M",
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/resources/expert-blog/switch-excel-ai-amazon-india#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why is Excel not enough for tracking Amazon India competitors in 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Excel is static and updated on a schedule, while Amazon India pricing changes in real time. By the time you open your spreadsheet, competitor price changes may already be 12 to 48 hours old.",
          },
        },
        {
          "@type": "Question",
          name: "How much time do sellers typically save by switching to an AI tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sellers typically save 2 to 4 hours per week after switching. At a conservative 500 rupees per hour, that is 1,000 to 2,000 rupees per week in recovered time.",
          },
        },
        {
          "@type": "Question",
          name: "What data can an AI tool capture that Excel cannot?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An AI competitor tracker captures price changes in real time, rank movement, Buy Box win and loss events, new competitor listings, and keyword ranking shifts.",
          },
        },
        {
          "@type": "Question",
          name: "Is it expensive to switch from manual tracking to an AI tool in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Insydz costs 2,499 rupees per month with no per user seats and no USD conversion. For a seller spending 3 hours per week on manual tracking, the time cost alone exceeds 6,000 rupees per month.",
          },
        },
        {
          "@type": "Question",
          name: "How long does it take to set up an AI competitor tracking tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Setting up Insydz takes under 30 minutes. Add your ASINs, the competitors to track, set your price floor, and configure WhatsApp alerts. Most sellers receive their first alert within 24 hours.",
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
          __html: JSON.stringify(schemaSwitchExcelAiAmazonIndia),
        }}
      />
      <SwitchExcelAiAmazonIndiaContent />
    </>
  );
}
