import { Metadata } from "next";
import FestiveTrendContent from "./festive-trend-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Festive Trend Insights for Ecommerce Sellers | Insydz",
  description: "Analyze festive season trends, product demand, pricing insights, and customer behavior with Insydz AI-powered ecommerce intelligence tools.",
  alternates: {
    canonical: "https://insydz.com/features/festive-trend-feature",
  },
};

const schemaFestiveTrend = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://insydz.com/assets/logo.png"
      },
      "sameAs": [
        "https://www.linkedin.com/company/insydz/",
        "https://www.instagram.com/growwithinsydz/",
        "https://x.com/growwithinsydz/"
      ],
      "description": "Insydz is an AI-powered ecommerce intelligence platform that helps Amazon and Flipkart sellers with product research, keyword tracking, pricing insights, and review analytics."
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/features/festive-trends",
      "url": "https://insydz.com/features/festive-trends",
      "name": "Festive Trend Insights for Ecommerce Sellers | Insydz",
      "description": "Analyze festive season trends, product demand, pricing insights, and customer behavior with Insydz AI-powered ecommerce intelligence tools.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/features/festive-trends#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/features/festive-trends#breadcrumb",
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
          "name": "Features",
          "item": "https://insydz.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Festive Trend Insights",
          "item": "https://insydz.com/features/festive-trends"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://insydz.com/features/festive-trends#service",
      "name": "Festive Trend Analysis Tool",
      "provider": {
        "@id": "https://insydz.com/#organization"
      },
      "serviceType": "Ecommerce Trend Intelligence",
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      "description": "Analyze festive season ecommerce trends including product demand, keyword trends, competitor pricing, and customer behavior insights to maximize sales during peak seasons.",
      "offers": {
        "@type": "Offer",
        "url": "https://insydz.com/features/festive-trends",
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/features/festive-trends#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are festive ecommerce trends?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Festive ecommerce trends refer to changes in product demand, pricing, customer behavior, and sales patterns during peak shopping seasons like Diwali and Dussehra."
          }
        },
        {
          "@type": "Question",
          "name": "How can festive trend insights help sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They help identify high-demand products, optimize pricing, track competitors, and improve marketing strategies during peak seasons."
          }
        },
        {
          "@type": "Question",
          "name": "What data does Insydz festive trend feature provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Insights on product demand trends, keyword popularity, competitor pricing changes, and customer behavior."
          }
        },
        {
          "@type": "Question",
          "name": "Is this feature useful for Amazon and Flipkart sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, it is designed for both Amazon and Flipkart sellers to make data-driven decisions during high-demand periods."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFestiveTrend) }}
      />
      <FestiveTrendContent />
    </>
  );
}
