import { Metadata } from "next";
import AmazonVineProgramContent from "./vine-program-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost?",
  description: "Learn the flat fee per ASIN, enrollment criteria, and strategic benefits of Amazon Vine India in 2026. Get 30 verified reviews and boost your launch velocity.",
  alternates: {
    canonical: "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
  },
};

const schemaVineProgram = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "url": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "name": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Insydz",
        "url": "https://insydz.com"
      },
      "about": {
        "@id": "https://insydz.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/blog/amazon-vine-program-india-2026#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/blog/amazon-vine-program-india-2026#breadcrumb",
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
          "name": "Blog",
          "item": "https://insydz.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
          "item": "https://insydz.com/blog/amazon-vine-program-india-2026"
        }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/blog/amazon-vine-program-india-2026#article",
      "headline": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
      "description": "Amazon Vine costs Rs19,200 for up to 30 verified reviews from Vine Voices. Learn if it is worth it for Indian sellers, eligibility rules, and how to enroll.",
      "image": "https://insydz.com/Amazon-Vine-India-image1.png",
      "author": {
        "@type": "Person",
        "name": "Vikrant Singh"
      },
      "publisher": {
        "@id": "https://insydz.com/#organization"
      },
      "datePublished": "2026-05-22",
      "dateModified": "2026-05-22",
      "mainEntityOfPage": {
        "@id": "https://insydz.com/blog/amazon-vine-program-india-2026"
      },
      "keywords": [
        "Amazon Vine Program India",
        "Amazon Vine cost India",
        "Amazon Vine reviews",
        "Amazon Vine eligibility",
        "Amazon Vine vs paid reviews",
        "Amazon Vine enrollment India"
      ],
      "articleSection": ["Amazon Vine", "Review Strategy"],
      "inLanguage": "en"
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/blog/amazon-vine-program-india-2026#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Amazon Vine available for all sellers in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. You must be Brand Registered on Amazon India with a Professional seller account. Individual sellers without Brand Registry cannot enrol. The ASIN must have under 30 existing reviews, and active FBA inventory must be available — no FBM listings."
          }
        },
        {
          "@type": "Question",
          "name": "Can I get a refund if Vine reviewers do not review my product?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The ₹19,200 fee is non-refundable regardless of how many reviews you receive. Amazon makes no guarantee that every enrolled unit will be claimed or reviewed — some sellers get 30 reviews, others fewer depending on category demand from Vine Voices. This is a risk you accept at enrollment."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to get Vine reviews on Amazon?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Vine Voices start claiming units within 24–72 hours of enrolment approval. Reviews then take 2–6 weeks depending on how quickly reviewers evaluate the product. Plan for 4–8 weeks total from submission to your first Vine review appearing on your listing."
          }
        },
        {
          "@type": "Question",
          "name": "Does Amazon Vine work for Flipkart sellers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Vine is an Amazon-only programme. Flipkart has no equivalent verified review seeding option in 2026. Flipkart sellers need to rely on organic sales velocity, permitted buyer follow-up messaging within Flipkart's communication policies, and consistent product quality that drives unsolicited reviews."
          }
        },
        {
          "@type": "Question",
          "name": "What happens if I run out of FBA inventory after enrolling in Vine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If your FBA stock drops below the units enrolled in Vine, claims will fail and you get fewer reviews — while still paying the full ₹19,200 fee. Always maintain a dedicated Vine inventory buffer in FBA, separate from your live selling stock, for the entire Vine window duration."
          }
        },
        {
          "@type": "Question",
          "name": "Can I track whether Vine actually improved my keyword ranking?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not directly inside Amazon Seller Central — it shows review count but no keyword rank history. Insydz tracks daily keyword rank changes alongside your review count, so you can correlate exactly when your rankings moved and which review count thresholds (5, 10, 25 reviews) triggered the biggest jumps. This turns Vine from a spend item into a measurable investment."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaVineProgram) }}
      />
      <AmazonVineProgramContent />
    </>
  );
}
