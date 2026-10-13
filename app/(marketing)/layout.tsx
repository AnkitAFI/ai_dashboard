import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import Script from "next/script";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": "https://insydz.com/#organization",
    name: "Insydz",
    url: "https://insydz.com/",
    logo: {
      "@type": "ImageObject",
      url: "https://insydz.com/logo.png",
    },
    image: "https://insydz.com/logo.png",
    description:
      "Insydz is an AI powered marketplace analytics platform built for Amazon India and Flipkart sellers. The software brings sales, advertising, pricing and competitor data into one dashboard so sellers can see what is working and act on it quickly.",
    telephone: "+91-92172-46794",
    email: "contact@insydz.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "506, 5th Floor, ITHUM Tower, Block A, Industrial Area, Sector 62",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      postalCode: "201301",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@insydz.com",
        telephone: "+91-92172-46794",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    sameAs: [
      "https://www.instagram.com/growwithinsydz",
      "https://www.linkedin.com/company/insydz/",
      "https://www.facebook.com/profile.php?id=61586202582209",
      "https://x.com/growwithinsydz",
    ],
  };

  return (
    <>
      <Script id="openai-pixel-marketing" strategy="afterInteractive">
        {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"Dz9tBctDJhRqtPEES1YJiZ",debug:true});`}
      </Script>
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
