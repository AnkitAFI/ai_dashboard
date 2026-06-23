"use client";

import { useTheme } from "next-themes";

interface InfoBannerProps {
  title: string;
  content: string;
  accentColor?: string;
  backgroundColor?: string;
}

export default function InfoBanner({
  title,
  content,
  accentColor = "#F59E0B",
  backgroundColor,
}: InfoBannerProps) {
  const { resolvedTheme } = useTheme();

  const defaultBackground = resolvedTheme === "dark" ? "#1F2937" : "#F7F3E8";

  return (
    <div
      style={{
        background: backgroundColor || defaultBackground,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 16,
        padding: "18px 22px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          color: accentColor,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: resolvedTheme === "dark" ? "#E5E7EB" : "#334155",
          fontSize: 16,
          lineHeight: "28px",
        }}
      >
        {content}
      </div>
    </div>
  );
}
