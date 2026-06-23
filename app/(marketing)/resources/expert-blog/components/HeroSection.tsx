import { useRouter } from "next/navigation";

interface HeroSectionProps {
  resolvedTheme?: string;
  badgeText: string;
  title: React.ReactNode;
  description: React.ReactNode;
  authorName: string;
  authorUrl: string;
  publishDate: string;
  readTime: string;
  tags?: string[];
  bgColor?: {
    light: string;
    dark: string;
  };
  highlightColor?: string;
}

export default function HeroSection({
  resolvedTheme,
  badgeText,
  title,
  description,
  authorName,
  authorUrl,
  publishDate,
  readTime,
  tags = [],
  bgColor = {
    light: "#F1F2FF",
    dark: "#0f1120",
  },
  highlightColor = "#6366F1",
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <div
      style={{
        background: resolvedTheme === "dark" ? bgColor.dark : bgColor.light,
        padding: "48px 0",
        borderBottom:
          resolvedTheme === "dark" ? "1px solid #1f2937" : "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 16px",
        }}
        className="w-full"
      >
        <div className="w-full">
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background:
                resolvedTheme === "dark"
                  ? `${highlightColor}20`
                  : `${highlightColor}15`,
              color: highlightColor,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              padding: "6px 16px",
              borderRadius: 20,
              marginBottom: 20,
              fontFamily: "'Sora',sans-serif",
            }}
          >
            <span
              style={{
                marginRight: 8,
                color: highlightColor,
              }}
            >
              ●
            </span>
            {badgeText}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "clamp(28px, 4.5vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: resolvedTheme === "dark" ? "white" : "#111827",
              letterSpacing: "-1px",
              marginBottom: 20,
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              margin: 0,
              fontSize: 18,
              color: resolvedTheme === "dark" ? "#d1d5db" : "#4B5563",
              lineHeight: 1.8,
              fontFamily: "'Lora', serif",
            }}
          >
            {description}
          </p>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 28px",
              // marginBottom: 16,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "clamp(12px,2vw,14px)",
                color: "#64748B",
              }}
            >
              👤{" "}
              <strong
                className="text-[#0A0F1A] hover:text-orange-500 transition-colors cursor-pointer"
                onClick={() => router.push(authorUrl)}
              >
                {authorName}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "clamp(12px,2vw,14px)",
                color: "#64748B",
              }}
            >
              🕐 {publishDate}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "clamp(12px,2vw,14px)",
                color: "#64748B",
              }}
            >
              📖 <strong>{readTime}</strong>
            </div>

            {tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  background:
                    index % 2 === 0
                      ? "rgba(244,80,10,.12)"
                      : "rgba(10,191,164,.12)",
                  color: index % 2 === 0 ? "#F4500A" : "#0ABFA4",
                  fontSize: "clamp(11px,2vw,13px)",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
