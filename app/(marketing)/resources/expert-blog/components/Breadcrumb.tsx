"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({
  items,
}: BreadcrumbProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      style={{
        background:
          resolvedTheme === "dark"
            ? "#0f172a"
            : "#F5F8FF",
        borderBottom:
          resolvedTheme === "dark"
            ? "1px solid #1e293b"
            : "1px solid #E5E7EB",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
          fontSize: 12,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  color:
                    resolvedTheme === "dark"
                      ? "#CBD5E1"
                      : "#64748B",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color:
                    resolvedTheme === "dark"
                      ? "#94A3B8"
                      : "#94A3B8",
                }}
              >
                {item.label}
              </span>
            )}

            {index !== items.length - 1 && (
              <span>›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}