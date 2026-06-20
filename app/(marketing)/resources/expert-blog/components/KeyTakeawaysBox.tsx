"use client";

interface KeyTakeawaysBoxProps {
  title?: string;
  items: string[];
  accentColor: string;
  backgroundColor?: string;
}

export default function KeyTakeawaysBox({
  title = "Key Takeaways",
  items,
  accentColor,
  backgroundColor = "#0F172A",
}: KeyTakeawaysBoxProps) {
  return (
    <div
      style={{
        background: backgroundColor,
        borderRadius: 24,
        padding: 40,
      }}
    >
      <h3
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          marginBottom: 28,
        }}
      >
        📋 {title}
      </h3>

      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: accentColor,
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />

            <p
              style={{
                color: "#94A3B8",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}