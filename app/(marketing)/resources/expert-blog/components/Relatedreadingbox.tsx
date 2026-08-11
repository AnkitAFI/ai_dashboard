"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

interface RelatedReadingLink {
  text: string;
  href: string;
}

interface RelatedReadingBoxProps {
  label?: string;
  links: RelatedReadingLink[];
  accentColor?: string;
  darkAccentColor?: string;
  backgroundColor?: string;
  darkBackgroundColor?: string;
  resolvedTheme?: string;
}

export default function RelatedReadingBox({
  label = "📌 Related Reading on Insydz",
  links,
  accentColor = "#0D9488",
  darkAccentColor = "#2DD4BF",
  backgroundColor = "#F0FDFA",
  darkBackgroundColor,
  resolvedTheme: propResolvedTheme,
}: RelatedReadingBoxProps) {
  const { resolvedTheme: hookResolvedTheme } = useTheme();
  
  const currentTheme = propResolvedTheme || hookResolvedTheme;
  const isDark = currentTheme === "dark";

  const activeAccentColor = isDark ? darkAccentColor : accentColor;

  // Derive a dark-mode background from the accent color if none provided
  const derivedDarkBg = accentColor + "1A"; // ~10% opacity of accent color
  const resolvedBackground = isDark
    ? darkBackgroundColor || derivedDarkBg
    : backgroundColor;

  return (
    <div
      style={{
        background: resolvedBackground,
        borderLeft: `4px solid ${activeAccentColor}`,
        borderRadius: 10,
        padding: "20px 22px",
        margin: "32px 0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.7px",
          textTransform: "uppercase",
          color: activeAccentColor,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {links.map((link, i) => (
          <li
            key={i}
            style={{
              fontSize: 14.5,
              marginBottom: 8,
              lineHeight: 1.6,
              color: isDark ? "#E5E7EB" : "#334155",
            }}
          >
            <Link
              href={link.href}
              style={{
                color: activeAccentColor,
                textDecoration: "underline",
                textDecorationColor: `${activeAccentColor}4D`,
                textUnderlineOffset: "3px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
