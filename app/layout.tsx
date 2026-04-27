import type { Metadata } from "next";
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
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
