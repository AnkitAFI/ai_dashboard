import { Metadata } from "next";
import PrivacyPolicyContent from "./privacy-policy-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy | Insydz",
  description: "Learn how Insydz collects, uses, and safeguards your personal and business information. Your privacy and data security are our top priorities.",
  alternates: {
    canonical: "https://insydz.com/privacy-policy",
  },
};

export default function Page() {
  return <PrivacyPolicyContent />;
}
