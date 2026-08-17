import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "./providers";
import GoogleAnalytics from "@/components/google-analytics";
import { MobileBanner } from "@/components/MobileBanner";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

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
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="HjZKe36xF3DWrHf2_ac6h3DE-XutF5Oim9bT2Y3o4Z4" />
      </head>
      <body>
        <GoogleAnalytics />
        <MobileBanner />
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
