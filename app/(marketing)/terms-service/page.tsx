import { Metadata } from "next";
import TermsOfServiceContent from "./terms-service-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service | Insydz",
  description: "Read the terms and conditions for using the Insydz analytics platform. Understand your rights, responsibilities, and our commitment to service excellence.",
  alternates: {
    canonical: "https://insydz.com/terms-service",
  },
};

export default function Page() {
  return <TermsOfServiceContent />;
}
