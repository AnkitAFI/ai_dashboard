"use client";

import Link from "next/link";

interface InlineNotePart {
  text: string;
  href?: string;
}

interface InlineNoteProps {
  parts: InlineNotePart[];
  accentColor?: string;
  textColor?: string;
  fontSize?: number;
  resolvedTheme?: string;
  margin?: string;
}

export default function InlineNote({
  parts,
  accentColor = "#F97316",
  textColor = "#64748B",
  fontSize = 16,
  resolvedTheme,
  margin = "16px 0",
}: InlineNoteProps) {
  const isDark = resolvedTheme === "dark";

  return (
    <p
      style={{
        fontSize,
        color: isDark ? "#9CA3AF" : textColor,
        lineHeight: 1.7,
        margin,
      }}
    >
      {parts.map((part, i) =>
        part.href ? (
          <Link
            key={i}
            href={part.href}
            style={{
              color: accentColor,
              textDecoration: "underline",
              textDecorationColor: `${accentColor}4D`,
              textUnderlineOffset: "3px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {part.text}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}
