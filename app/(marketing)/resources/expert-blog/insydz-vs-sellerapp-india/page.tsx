import { Metadata } from "next";
import InsydzVsSellerAppContent from "./insydz-vs-sellerapp-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insydz vs SellerApp Comparison – Which Tool Actually Works for India?",
  description: "A practitioner's comparison for ₹5L–50L/month Indian sellers — INR pricing vs USD billing, Flipkart-native vs Amazon-only, WhatsApp alerts vs email digests.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india",
  },
};

const schemaBlogComparison = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": { "@type": "ImageObject", "url": "https://insydz.com/logo.png" },
      "sameAs": [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india",
      "url": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india",
      "name": "Insydz vs SellerApp: Which Amazon Seller Tool Actually Works for the Indian Market?",
      "description": "A practitioner's comparison for ₹5L–50L/month Indian sellers — INR pricing vs USD billing, Flipkart-native vs Amazon-only.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "about": { "@id": "https://insydz.com/#organization" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog", "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Insydz vs SellerApp India", "item": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india#article",
      "headline": "Insydz vs SellerApp: Which Amazon Seller Tool Actually Works for the Indian Market?",
      "description": "Detailed comparison of Insydz and SellerApp tools for Amazon India sellers. Explore pricing, currency, and marketplace coverage.",
      "image": "https://insydz.com/insydz-vs-sellerapp-hero.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-04-28",
      "dateModified": "2026-04-28",
      "mainEntityOfPage": { "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india" },
      "keywords": ["Insydz vs SellerApp", "SellerApp alternative India", "Amazon seller tools comparison India", "best Flipkart seller tool", "Flipkart rank tracking"],
      "articleSection": "Tool Comparison",
      "inLanguage": "en"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/insydz-vs-sellerapp-india#faq",
      "mainEntity": [
        { "@type": "Question", "name": "Is Insydz a complete SellerApp alternative for India?", "acceptedAnswer": { "@type": "Answer", "text": "For India-market sellers, yes. While SellerApp has deeper global PPC tools, Insydz provides the native Flipkart integration, Hinglish NLP, and INR pricing that SellerApp lacks." } },
        { "@type": "Question", "name": "Can I import my SellerApp PPC data into Insydz?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can export your keyword lists and negative targets from SellerApp and upload them directly into the Insydz dashboard during onboarding." } },
        { "@type": "Question", "name": "Does Insydz offer GST invoices?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Insydz is an Indian entity and provides GST-compliant invoices for all paid plans, allowing you to claim input tax credit." } }
      ]
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBlogComparison) }}
      />
      <InsydzVsSellerAppContent />
    </>
  );
}
