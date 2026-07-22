"use client";

interface TOCItem {
  id: string;
  label: string;
}

interface TOCSidebarProps {
  items: TOCItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function TOCSidebar({
  items,
  activeSection,
  onNavigate,
}: TOCSidebarProps) {
  return (
    <aside
      style={{
        position: "sticky",
        top: 100,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h4
        style={{
          margin: "0 0 16px",
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#64748B",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        Table of Contents
      </h4>

      <div>
        {items.map((item) => {
          const active = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",

                padding: "8px 12px",
                marginBottom: 4,

                borderRadius: 6,

                background: active ? "#DFF4E8" : "transparent",

                borderLeft: active
                  ? "3px solid #16A34A"
                  : "3px solid transparent",

                color: active ? "#166534" : "#64748B",

                fontSize: 14,
                fontWeight: active ? 600 : 500,
                lineHeight: "20px",

                fontFamily: "'Sora', sans-serif",

                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#F8FAFC";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
