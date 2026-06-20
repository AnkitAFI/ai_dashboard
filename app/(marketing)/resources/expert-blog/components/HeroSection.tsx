"use client";

import { useTheme } from "next-themes";

interface Stat {
  value: string;
  description: string;
}

interface HeroSectionProps {
  badge: string;
  title: string;
  highlightedText?: string;
  accentColor: string;
  backgroundColor?: string;
  author: string;
  readTime: string;
  publishDate: string;
  stats: Stat[];
}

export default function HeroSection({
  badge,
  title,
  accentColor,
  backgroundColor = "#F1F2FF",
  author,
  publishDate,
  readTime,
  stats,
}: HeroSectionProps) {
  const { resolvedTheme } = useTheme();

  return (
    <section
      style={{
        background:
          resolvedTheme === "dark"
            ? "#0f1120"
            : backgroundColor,
        padding: "48px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "6px 16px",
            borderRadius: 999,
            background: `${accentColor}20`,
            color: accentColor,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          ● {badge}
        </div>

        <h1
          style={{
            fontSize: "clamp(28px,4vw,48px)",
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <span>{author}</span>
          <span>{publishDate}</span>
          <span>{readTime}</span>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
          style={{
            marginTop: 40,
            border: "1px solid #E5E7EB",
            borderRadius: 12,
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: accentColor,
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                {stat.value}
              </div>

              <div>{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}