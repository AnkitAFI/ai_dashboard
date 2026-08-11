import React from "react";

interface SectionQAProps {
  title?: string;
  paragraph1?: React.ReactNode;
  paragraph2?: React.ReactNode;
  paragraph3?: React.ReactNode;
  /** Optional overflow for sections with more than 3 paragraphs. Rendered after paragraph1-3. */
  paragraphs?: React.ReactNode[];
  resolvedTheme?: string;
}

export default function SectionQA({
  title,
  paragraph1,
  paragraph2,
  paragraph3,
  paragraphs = [],
  resolvedTheme,
}: SectionQAProps) {
  const allParagraphs = [
    paragraph1,
    paragraph2,
    paragraph3,
    ...paragraphs,
  ].filter((p) => p !== undefined && p !== null && p !== "");

  return (
    <>
      {title && (
        <h2
          id={title.toLowerCase().replace(/\s+/g, "-")}
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 900,
            color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            paddingBottom: "12px",
            borderBottom:
              resolvedTheme === "dark"
                ? "1px solid #1f2937"
                : "1px solid #E5E7EB",
            margin: "36px 0 16px",
          }}
        >
          {title}
        </h2>
      )}

      {allParagraphs.map((p, i) => (
        <p
          key={i}
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
            fontSize: "16px",
            lineHeight: 1.7,
            marginBottom: i === allParagraphs.length - 1 ? "32px" : "20px",
            fontFamily: "'Lora', serif",
          }}
        >
          {p}
        </p>
      ))}
    </>
  );
}
