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
      "@type": "Organization",
      "@id": "https://insydz.com#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://insydz.com/logo.png",
        "width": 512,
        "height": 512
      },
      "description": "AI-powered marketplace analytics platform for Amazon India and Flipkart sellers.",
      "sameAs": [
        "https://www.linkedin.com/company/insydz",
        "https://x.com/insydz"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "India"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://insydz.com#website",
      "url": "https://insydz.com",
      "name": "Insydz",
      "publisher": {
        "@id": "https://insydz.com#organization"
      },
      "inLanguage": "en-IN"
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "url": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026",
      "name": "Amazon Vine India 2026: Cost, Worth & How to Enrol",
      "description": "Amazon Vine India costs ₹19,200 per ASIN for up to 30 verified reviews. Complete guide for Indian Amazon sellers.",
      "isPartOf": {
        "@id": "https://insydz.com#website"
      },
      "breadcrumb": {
        "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb"
      },
      "inLanguage": "en-IN",
      "potentialAction": {
        "@type": "ReadAction",
        "target": [
          "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026"
        ]
      }
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#article",
      "mainEntityOfPage": {
        "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026"
      },
      "headline": "Amazon Vine Program for Indian Sellers in 2026: Is It Worth the Cost and How to Get Started",
      "alternativeHeadline": "Amazon Vine India 2026: Cost, Worth & How to Enrol",
      "description": "Amazon Vine India costs ₹19,200 per ASIN for up to 30 verified reviews. Complete enrolment guide for Indian Amazon sellers.",
      "image": [
        "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026-hero.png"
      ],
      "author": {
        "@type": "Organization",
        "@id": "https://insydz.com#organization",
        "name": "Vikrant Singh"
      },
      "publisher": {
        "@id": "https://insydz.com#organization"
      },
      "datePublished": "2026-05-08",
      "dateModified": "2026-05-08",
      "articleSection": "Review Strategy",
      "keywords": [
        "amazon vine india",
        "amazon vine cost india",
        "amazon vine reviews",
        "amazon vine enrollment india",
        "amazon vine 2026"
      ],
      "wordCount": 2384,
      "inLanguage": "en-IN",
      "about": [
        {
          "@type": "Thing",
          "name": "Amazon Vine"
        },
        {
          "@type": "Thing",
          "name": "Amazon India"
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#breadcrumb",
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
          "item": "https://insydz.com/resources/expert-blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Amazon Vine India 2026",
          "item": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#faq",
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
          "name": "Can I get a refund if Vine Voices do not review my product?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The ₹19,200 fee is non-refundable regardless of how many reviews you receive. Amazon makes no guarantee that every enrolled unit will be claimed or reviewed — some sellers get 30 reviews, others fewer depending on category demand from Vine Voices. This is a risk you accept at enrolment."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to get Vine reviews on Amazon India?",
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
          "name": "What happens if I run out of FBA inventory after enrolling?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If your FBA stock drops below the units enrolled in Vine, claims will fail and you get fewer reviews — while still paying the full ₹19,200 fee. Always maintain a dedicated Vine inventory buffer in FBA, separate from your live selling stock, for the entire Vine window duration."
          }
        },
        {
          "@type": "Question",
          "name": "Can I track whether Vine actually improved my keyword rankings?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not directly inside Amazon Seller Central — it shows review count but no keyword rank history. Insydz tracks daily keyword rank changes alongside your review count, so you can correlate exactly when your rankings moved and which review count thresholds (5, 10, 25 reviews) triggered the biggest jumps. This turns Vine from a spend item into a measurable investment."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://insydz.com/resources/expert-blog/amazon-vine-program-india-2026#howto",
      "name": "How to Enrol in Amazon Vine India",
      "description": "Step-by-step process for enrolling products into Amazon Vine India.",
      "totalTime": "PT5M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": "19200"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Professional Seller Account"
        },
        {
          "@type": "HowToSupply",
          "name": "Amazon Brand Registry"
        },
        {
          "@type": "HowToSupply",
          "name": "FBA Inventory"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": "Amazon Seller Central"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Open Vine Dashboard",
          "text": "Go to Advertising > Vine inside Seller Central."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Select Eligible ASIN",
          "text": "Search for the ASIN you want to enrol and confirm eligibility."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Choose Unit Quantity",
          "text": "Select up to 30 units for Vine reviewers."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Submit Enrolment",
          "text": "Review the ₹19,200 fee and submit your Vine enrolment."
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Track Review Progress",
          "text": "Monitor claims and incoming Vine reviews from the Vine dashboard."
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
