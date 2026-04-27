import { Metadata } from "next";
import FreeReviewSentimentCheckerContent from "./free-review-sentiment-checker-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Amazon Review Sentiment Checker | Insydz",
  description: "Analyze Amazon India product reviews for free. Get AI-powered insights into buyer sentiment, recurring complaints, and product praise to improve your listings.",
  alternates: {
    canonical: "https://insydz.com/free-tools/free-review-sentiment-checker",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/free-tools/free-review-sentiment-checker#webpage",
    "url": "https://insydz.com/free-tools/free-review-sentiment-checker",
    "name": "Free Amazon Review Sentiment Checker | Insydz",
    "description": "Analyze Amazon India product reviews for free. Get AI-powered insights into buyer sentiment, recurring complaints, and product praise to improve your listings.",
    "breadcrumb": { "@id": "https://insydz.com/free-tools/free-review-sentiment-checker#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/free-tools/free-review-sentiment-checker#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Review Sentiment Checker", "item": "https://insydz.com/free-tools/free-review-sentiment-checker" }
    ]
  }
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMAS) }}
      />
      <FreeReviewSentimentCheckerContent />
    </>
  );
}
