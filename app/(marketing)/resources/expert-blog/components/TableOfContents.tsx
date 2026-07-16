// "use client";

// import { useState } from "react";

// interface TOCItem {
//   id: string;
//   label: string;
// }

// interface TableOfContentsProps {
//   tocItems: TOCItem[];
//   activeSection: string;
//   go: (id: string) => void;
//   resolvedTheme?: string;
//   title?: string;
// }

// export default function TableOfContents({
//   tocItems,
//   activeSection,
//   go,
//   resolvedTheme,
//   title = "Table of Contents",
// }: TableOfContentsProps) {
//   const [tocOpen, setTocOpen] = useState(false);

//   return (
//     <>
//       <button
//         className="mobile-toc-btn"
//         onClick={() => setTocOpen((prev) => !prev)}
//         style={{
//           background: resolvedTheme === "dark" ? "#111827" : "#fff",
//           color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
//           borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
//         }}
//       >
//         {title} <span>{tocOpen ? "▲" : "▼"}</span>
//       </button>

//       <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`}>
//         {tocItems.map((item) => (
//           <button
//             key={item.id}
//             className={`toc-link${activeSection === item.id ? " active" : ""}`}
//             style={{
//               display: "block",
//               marginBottom: 3,
//             }}
//             onClick={() => {
//               go(item.id);
//               setTocOpen(false);
//             }}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div>
//     </>
//   );
// }

"use client";

interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  tocItems: TOCItem[];
  activeSection: string;
  go: (id: string) => void;
  resolvedTheme?: string;
  title?: string;
}

export default function TableOfContents({
  tocItems,
  activeSection,
  go,
  resolvedTheme,
  title = "Table of Contents",
}: TableOfContentsProps) {
  return (
    <aside
      className="toc-sidebar"
      style={{
        background: resolvedTheme === "dark" ? "#111827" : "#fff",
        borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
      }}
    >
      <h4
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
          marginBottom: "16px",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {title.toUpperCase()}
      </h4>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {tocItems.map((item) => (
          <li key={item.id}>
            <button
              className={`toc-link${
                activeSection === item.id ? " active" : ""
              }`}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
