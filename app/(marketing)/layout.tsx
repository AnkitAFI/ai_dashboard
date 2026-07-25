import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://insydz.com/#organization",
    "name": "Insydz",
    "url": "https://insydz.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://insydz.com/logo.png",
    },
    "sameAs": [
      "https://www.instagram.com/growwithinsydz",
      "https://www.linkedin.com/company/insydz/",
      "https://www.facebook.com/profile.php?id=61586202582209",
      "https://x.com/growwithinsydz",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <MarketingHeader />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
