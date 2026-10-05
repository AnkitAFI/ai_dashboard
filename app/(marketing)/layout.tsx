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
