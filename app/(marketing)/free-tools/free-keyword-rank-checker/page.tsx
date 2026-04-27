import { Metadata } from "next";
import FreeKeywordRankCheckerContent from "./free-keyword-rank-checker-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Amazon Keyword Rank Checker for India | Insydz",
  description: "Check your Amazon India product rankings for free. See your current keyword positions, organic search visibility, and rank movement to outrank competitors.",
  alternates: {
    canonical: "https://insydz.com/free-tools/free-keyword-rank-checker",
  },
};

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://insydz.com/free-tools/free-keyword-rank-checker#webpage",
    "url": "https://insydz.com/free-tools/free-keyword-rank-checker",
    "name": "Free Amazon Keyword Rank Checker for India | Insydz",
    "description": "Check your Amazon India product rankings for free. See your current keyword positions, organic search visibility, and rank movement to outrank competitors.",
    "breadcrumb": { "@id": "https://insydz.com/free-tools/free-keyword-rank-checker#breadcrumb" }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://insydz.com/free-tools/free-keyword-rank-checker#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://insydz.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://insydz.com/free-tools" },
      { "@type": "ListItem", "position": 3, "name": "Free Keyword Rank Checker", "item": "https://insydz.com/free-tools/free-keyword-rank-checker" }
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
      <FreeKeywordRankCheckerContent />
    </>
  );
}
