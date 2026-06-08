import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://insydz.com"),
  title: "Insydz",
  description: "AI-Powered Ecommerce Analytics Software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="HjZKe36xF3DWrHf2_ac6h3DE-XutF5Oim9bT2Y3o4Z4" />
        
        {/* Google Tag Manager - temporarily disabled */}
        {/* <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MT94TTKS');
          `}
        </Script> */}
        {/* End Google Tag Manager */}

        {/* Google tag (gtag.js) - temporarily disabled */}
        {/* <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QK3Z686F0N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QK3Z686F0N');
          `}
        </Script> */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) - temporarily disabled */}
        {/* <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MT94TTKS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript> */}
        {/* End Google Tag Manager (noscript) */}

        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
