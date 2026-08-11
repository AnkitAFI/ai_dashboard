interface HeroStatItem {
  value: string;
  label: string;
}

interface HeroStatsProps {
  stats: HeroStatItem[];
  accentColor?: string;
  resolvedTheme?: string;
  marginBottom?: number;
}

export default function HeroStats({
  stats,
  accentColor = "#F97316",
  resolvedTheme,
  marginBottom = 32,
}: HeroStatsProps) {
  const isDark = resolvedTheme === "dark";

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        border: isDark ? "1px solid #1f2937" : "1px solid #E2E8F0",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom,
        background: isDark ? "#111827" : "#fff",
        boxShadow: isDark
          ? "none"
          : "0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05)",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 160,
            padding: "18px 24px",
            borderRight:
              i < stats.length - 1
                ? isDark
                  ? "1px solid #1f2937"
                  : "1px solid #E2E8F0"
                : "none",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 26,
              fontWeight: 800,
              color: accentColor,
              lineHeight: 1,
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {s.value}
          </span>
          <span
            style={{
              display: "block",
              fontSize: 11.5,
              color: isDark ? "#9ca3af" : "#64748B",
              marginTop: 5,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
