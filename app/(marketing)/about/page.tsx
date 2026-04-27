import { Metadata } from "next";
import AboutContent from "./about-content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Insydz — Our Story, Team & Mission",
  description: "Learn about Insydz, India's leading AI-powered ecommerce analytics platform. Discover our story, meet our team, and understand our mission to empower sellers.",
  alternates: {
    canonical: "https://insydz.com/about",
  },
};

export default function Page() {
  return <AboutContent />;
}
