import { Metadata } from "next";
import AmazonZeroReferralFeeContent from "./amazon-zero-referral-fee-content";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon India Zero Referral Fee 2026",
  description:
    "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
  alternates: {
    canonical:
      "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
  },
};

const schemaAmazonZeroReferralFee = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-zero-referral-fee",
      url: "https://insydz.com/resources/expert-blog/amazon-zero-referral-fee",
      name: "Amazon Zero Referral Fee Undercutting India 2026: How to Rebuild Your Pricing Strategy and Keep More Profit",
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
          "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026#breadcrumb",
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
          name: "Amazon Zero Referral Fee Undercutting India 2026: How to Rebuild Your Pricing Strategy and Keep More Profit",
          item: "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026#article",
      headline:
        "Amazon Zero Referral Fee Undercutting India 2026: How to Rebuild Your Pricing Strategy and Keep More Profit",
      description:
        "Amazon India waived referral fee on products priced up to Rs 999 across 1800+ categories, effective 16 March 2026. Sellers who have not repriced against this are leaving margin on the table. Verify exact wording, date, and category count against the live page.",
      image: "/amazon-zero-referral-fee-india_blogbanner.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
      },
      publisher: {
        "@id": "https://insydz.com/#organization",
      },
      datePublished: "2026-06-12",
      dateModified: "2026-06-12",
      mainEntityOfPage: {
        "@id":
          "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026",
      },
      keywords: [
        "Amazon zero referral fee India",
        "Amazon referral fee waiver 2026",
        "Amazon India pricing strategy",
        "Amazon seller margin",
        "Reprice Amazon products India",
        "Amazon fee changes 2026",
      ],
      articleSection:
        "Fee Changes, Pricing Intelligence (low confidence) on page, confirm",
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://insydz.com/blog/amazon-zero-referral-fee-undercutting-india-2026#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Which Amazon India products now have zero referral fee after March 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Products priced up to ₹999 across 1,800+ categories now attract zero referral fee — including fashion and apparel, jewellery, mobile accessories, earphones, T-shirts, stationery, toys, and personal care. Products priced at ₹1,000 and above continue to attract the standard referral fee for their category.",
          },
        },
        {
          "@type": "Question",
          name: "Should I reprice products below Rs 999 to take advantage of the fee waiver?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only if the ₹200 price reduction is more than offset by the referral fee saving — typically 5 to 12 percent of selling price. Run the unit economics before repricing. The ₹999 price point also unlocks significantly higher conversion rates among Indian buyers due to strong sub-₹1,000 price psychology.",
          },
        },
        {
          "@type": "Question",
          name: "Does zero referral fee change how I should set my competitor price?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. If competitors have not yet repriced to reflect their fee saving, you can offer a lower price and maintain the same net margin as before. This competitive window closes once the category adjusts. Sellers who reprice in weeks 1 to 4 after March 16 gain ranking and Buy Box share before the category equilibrium resets.",
          },
        },
        {
          "@type": "Question",
          name: "Are there hidden costs that offset the referral fee savings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "FBA fees, Easy Ship charges, storage, and ad spend all remain unchanged — zero referral fee only eliminates that one component. For products under ₹300, an Easy Ship fee reduction also applies. Run the full P&L before deciding how to reprice.",
          },
        },
        {
          "@type": "Question",
          name: "Can Insydz help me track competitor repricing after the fee change?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Insydz monitors competitor prices on your tracked ASINs across Amazon India and Flipkart in real time. You can see which competitors have already repriced, by how much, and whether they have taken the Buy Box as a result — giving you the data to decide your own response before the category competitive floor resets.",
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
          __html: JSON.stringify(schemaAmazonZeroReferralFee),
        }}
      />
      <AmazonZeroReferralFeeContent />
    </>
  );
}
