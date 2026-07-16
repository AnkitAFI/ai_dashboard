"use client";

import { useState } from "react";

interface TOCItem {
  id: string;
  label: string;
}

interface MobileTableOfContentsProps {
  tocItems: TOCItem[];
  activeSection: string;
  go: (id: string) => void;
  resolvedTheme?: string;
  title?: string;
}

export default function MobileTableOfContents({
  tocItems,
  activeSection,
  go,
  resolvedTheme,
  title = "Table of Contents",
}: MobileTableOfContentsProps) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-toc-btn"
        onClick={() => setTocOpen((prev) => !prev)}
        style={{
          background: resolvedTheme === "dark" ? "#111827" : "#fff",
          color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
          borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
        }}
      >
        {title} <span>{tocOpen ? "▲" : "▼"}</span>
      </button>

      <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
        {tocItems.map((item) => (
          <button
            key={item.id}
            className={`toc-link${activeSection === item.id ? " active" : ""}`}
            style={{
              display: "block",
              marginBottom: 3,
            }}
            onClick={() => {
              go(item.id);
              setTocOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
