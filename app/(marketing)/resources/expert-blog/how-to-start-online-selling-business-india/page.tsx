import { Metadata } from "next";
import HowToStartOnlineSellingBusinessIndiaContent from "./how-to-start-online-selling-business-india-content";

export const dynamic = "force-static";

const PAGE_URL =
  "https://insydz.com/resources/expert-blog/how-to-start-online-selling-business-india";

const TITLE = "How to Start an Online Selling Business in India | Insydz";

const HEADLINE =
  "How to Start an Online Selling Business in India: A Beginner's Guide";

const DESCRIPTION =
  "Learn how to start an online selling business in India: GST, PAN, seller account setup on Amazon and Flipkart, real costs and a 30 day plan for 2026.";

const ARTICLE_DESCRIPTION =
  "A step by step beginner roadmap for starting an online selling business in India, covering GST, documents, marketplace choice, real costs and the first 30 days.";

const KEYWORDS = [
  "how to start an online selling business in india",
  "start selling online india",
  "flipkart seller account",
  "amazon seller registration",
  "gst for online sellers",
];

const COVER_IMAGE =
  "https://insydz.com/images/blogs/39-how-to-start-online-selling-business-india/39_blog_cover_image.webp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: HEADLINE,
    description: DESCRIPTION,
    type: "article",
    url: PAGE_URL,
    images: [COVER_IMAGE],
  },
};

const schemaStartOnlineSellingIndia = {
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
      name: HEADLINE,
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
          name: "How to Start an Online Selling Business in India",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id": `${PAGE_URL}#article`,
      headline: HEADLINE,
      description: ARTICLE_DESCRIPTION,
      image: COVER_IMAGE,
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-11-17",
      dateModified: "2026-11-17",
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en-IN",
      keywords: KEYWORDS,
      articleSection: "Seller Guide",
      wordCount: 1650,
      timeRequired: "PT7M",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need GST to start an online selling business in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For most marketplace sellers, yes, because Amazon and Flipkart collect tax at source and generally ask for a GST registration. Small sellers below the 40 lakh rupee goods limit who sell within one state may use a lighter enrolment on ONDC or their own store. Confirm your case with a chartered accountant.",
          },
        },
        {
          "@type": "Question",
          name: "How much money do I need to start selling online in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Marketplaces charge no joining fee, so your main costs are stock, packaging and the fees on each sale. A first order of 5 to 10 products is enough to test demand. An own website adds a platform fee, such as Shopify Basic at 1,499 rupees a month on annual billing.",
          },
        },
        {
          "@type": "Question",
          name: "Which is better for a beginner, Amazon or Flipkart?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Neither wins for every product. Flipkart charges no commission on products under 1,000 rupees, which helps fashion and low priced items, while Amazon suits branded and higher priced products. Many sellers start on one, learn their real costs, and add the second platform later.",
          },
        },
        {
          "@type": "Question",
          name: "How do online sellers get paid in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Amazon settles about 14 days after registration and then roughly weekly, and the money reaches your bank 2 to 3 working days later. Flipkart pays about 3 to 10 days after dispatch, depending on seller tier. Cash on delivery orders pay out more slowly, so keep spare cash for the first weeks.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to start an online selling business in India",
      description:
        "Five steps to go from an idea to your first marketplace sale in India.",
      totalTime: "P30D",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Pick a product you can check",
          text: "Choose one light, easy to pack product and study the top 10 listings for price, reviews and seller count before buying stock.",
          url: `${PAGE_URL}#s3`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Set up GST, PAN and a bank account",
          text: "Get a PAN, a business bank account and a regular GST registration, which most marketplace sellers need.",
          url: `${PAGE_URL}#s4`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Choose where to sell",
          text: "Compare Amazon, Flipkart, Meesho and an own website on upfront cost, buyers and fees, then start with one.",
          url: `${PAGE_URL}#s5`,
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Open your seller account and list",
          text: "Apply on the platform's seller page with your GSTIN, PAN, bank details and pickup address, then create one listing per variant.",
          url: `${PAGE_URL}#s6`,
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Review costs and payouts",
          text: "After the first month, compare fees, returns and payouts with your plan and adjust prices.",
          url: `${PAGE_URL}#s8`,
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
          __html: JSON.stringify(schemaStartOnlineSellingIndia),
        }}
      />
      <HowToStartOnlineSellingBusinessIndiaContent />
    </>
  );
}
