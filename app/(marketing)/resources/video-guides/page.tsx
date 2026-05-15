import { Metadata } from "next";
import VideoGuidesContent from "./video-guides-content";


export const metadata: Metadata = {
  title: "Video Guides — Insydz",
  description: "Master Insydz with our comprehensive video guides. Learn how to turn marketplace data into profitable decisions.",
};

export default function VideoGuidesPage() {
  return <VideoGuidesContent />;
}
