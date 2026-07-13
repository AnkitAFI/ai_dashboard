"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  marginTop?: number;
}

export default function Breadcrumb({ items, marginTop = 80 }: BreadcrumbProps) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="breadcrumb"
      style={{
        marginTop,
        background: isDark ? "#0f172a" : "#F5F8FF",
        borderBottom: isDark ? "1px solid #1e293b" : "1px solid #E5E7EB",
        padding: "8px 0",
      }}
    >
      <div
        className="breadcrumb-inner"
        style={{
          color: isDark ? "#94a3b8" : "#94A3B8",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  color: isDark ? "#cbd5e1" : "#64748B",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isDark ? "#64748b" : "#94A3B8",
                }}
              >
                {item.label}
              </span>
            )}

            {index < items.length - 1 && (
              <span
                style={{
                  color: isDark ? "#475569" : "#cbd5e1",
                }}
              >
                ›
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
