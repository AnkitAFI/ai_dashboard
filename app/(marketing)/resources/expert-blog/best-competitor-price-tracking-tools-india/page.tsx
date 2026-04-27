import { Metadata } from "next";
import PriceToolsContent from "./price-tools-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Best Competitor Price Tracking Tools for Indian Sellers",
  description: "Discover the best competitor price tracking tools for Amazon India and Flipkart sellers. Compare features and choose the right pricing intelligence tool.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
  },
};

const schemaBlogPriceTools = {
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
      "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
      "url": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india",
      "name": "Best Competitor Price Tracking Tools for Indian Sellers",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://insydz.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Resources",
          "item": "https://insydz.com/resources"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Expert Blog",
          "item": "https://insydz.com/resources/expert-blog"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Best Competitor Price Tracking Tools India",
          "item": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india"
        }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#article",
      "headline": "Best Competitor Price Tracking Tools for Indian Sellers",
      "description": "Discover the best competitor price tracking tools for Amazon India and Flipkart sellers. Compare features and choose the right pricing intelligence tool.",
      "image": "https://insydz.com/assets/images/blog/competitor-price-tools-india.png",
      "author": {
        "@type": "Organization",
        "name": "Insydz Team"
      },
      "publisher": {
        "@id": "https://insydz.com/#organization"
      },
      "datePublished": "2026-03-19",
      "dateModified": "2026-03-19",
      "mainEntityOfPage": {
        "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india"
      },
      "keywords": [
        "best competitor price tracking tools india",
        "amazon price tracking tools india",
        "competitor price monitoring tools",
        "amazon repricer tools india",
        "price tracking tools ecommerce"
      ],
      "articleSection": "Ecommerce Tools",
      "inLanguage": "en"
    },
    {
      "@type": "ItemList",
      "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#list",
      "name": "Best Competitor Price Tracking Tools in India",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Insydz" },
        { "@type": "ListItem", "position": 2, "name": "Helium 10" },
        { "@type": "ListItem", "position": 3, "name": "Jungle Scout" },
        { "@type": "ListItem", "position": 4, "name": "Viral Launch" },
        { "@type": "ListItem", "position": 5, "name": "Keepa" }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/best-competitor-price-tracking-tools-india#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are competitor price tracking tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They monitor pricing changes across marketplaces like Amazon and Flipkart, helping sellers adjust strategies in real time."
          }
        },
        {
          "@type": "Question",
          "name": "Why are they important for Indian sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They help sellers stay competitive, win the Buy Box, and react quickly to price changes."
          }
        },
        {
          "@type": "Question",
          "name": "What features should a good tool have?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Real-time tracking, alerts, competitor insights, historical data, and multi-platform support."
          }
        },
        {
          "@type": "Question",
          "name": "Are free tools available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, basic tracking is often free while advanced features require paid plans."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBlogPriceTools) }}
      />
      <PriceToolsContent />
    </>
  );
}
