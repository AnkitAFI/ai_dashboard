interface SectionQAProps {
  title: string;
  paragraph1?: string;
  paragraph2?: string;
  resolvedTheme?: string;
}

export default function SectionQA({
  title,
  paragraph1,
  paragraph2,
  resolvedTheme,
}: SectionQAProps) {
  return (
    <>
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

      {paragraph1 && (
        <p
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
            fontSize: "16px",
            lineHeight: 1.7,
            marginBottom: paragraph2 ? "20px" : "32px",
            fontFamily: "'Lora', serif",
          }}
        >
          {paragraph1}
        </p>
      )}

      {paragraph2 && (
        <p
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
            fontSize: "16px",
            lineHeight: 1.7,
            marginBottom: "32px",
            fontFamily: "'Lora', serif",
          }}
        >
          {paragraph2}
        </p>
      )}
    </>
  );
}
