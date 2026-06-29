// "use client";

// import React from "react";

// interface NumberedCardItem {
//   title: string;
//   description: string;
//   symbol?: React.ReactNode; // optional custom symbol per card
// }

// interface NumberedCardsProps {
//   items: NumberedCardItem[];
//   numberColor?: string;
//   backgroundColor?: string;
//   borderColor?: string;

//   variant?: "number" | "icon" | "custom";
//   icon?: React.ReactNode;
// }

// export default function NumberedCards({
//   items,
//   numberColor = "#2563EB",
//   backgroundColor = "#F8FAFC",
//   borderColor = "#D7E3FF",
//   variant = "number",
//   icon = "✓",
// }: NumberedCardsProps) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 18,
//         margin: "32px 0",
//       }}
//     >
//       {items.map((item, index) => {
//         const badgeContent =
//           variant === "number"
//             ? index + 1
//             : variant === "icon"
//               ? icon
//               : item.symbol;

//         return (
//           <div
//             key={index}
//             style={{
//               background: backgroundColor,
//               border: `1px solid ${borderColor}`,
//               borderRadius: 24,
//               padding: "clamp(12px,3vw,20px)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: 20,
//               }}
//             >
//               <div
//                 style={{
//                   width: 36,
//                   height: 36,
//                   minWidth: 36,
//                   borderRadius: "50%",
//                   background: numberColor,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "#FFFFFF",
//                   fontWeight: 400,
//                   fontSize: "clamp(8px,1vw,12px)",
//                   lineHeight: 1,
//                   fontFamily: "'Sora', sans-serif",
//                 }}
//               >
//                 {badgeContent}
//               </div>

//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <h3
//                   style={{
//                     margin: 0,
//                     color: "#0F172A",
//                     fontWeight: 600,
//                     fontSize: "clamp(10px,2vw,16px)",
//                     lineHeight: 1.4,
//                     fontFamily: "'Sora', sans-serif",
//                   }}
//                 >
//                   {item.title}
//                 </h3>

//                 <p
//                   style={{
//                     margin: "6px 0 0",
//                     color: "#64748B",
//                     fontSize: "clamp(8px,1vw,14px)",
//                     lineHeight: 1.6,
//                   }}
//                 >
//                   {item.description}
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

"use client";

import React from "react";
import { useTheme } from "next-themes";

interface NumberedCardItem {
  title: string;
  description: string;
  symbol?: React.ReactNode;
}

interface NumberedCardsProps {
  items: NumberedCardItem[];
  numberColor?: string;
  backgroundColor?: string;
  darkBackgroundColor?: string; // ← dark mode override
  borderColor?: string;
  darkBorderColor?: string; // ← dark mode override
  variant?: "number" | "icon" | "custom";
  icon?: React.ReactNode;
}

export default function NumberedCards({
  items,
  numberColor = "#2563EB",
  backgroundColor = "#F8FAFC",
  darkBackgroundColor,
  borderColor = "#D7E3FF",
  darkBorderColor,
  variant = "number",
  icon = "✓",
}: NumberedCardsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Auto-derive subtle dark tints from the numberColor if no override provided
  const resolvedBackground = isDark
    ? darkBackgroundColor || numberColor + "12" // ~7% opacity tint
    : backgroundColor;

  const resolvedBorder = isDark
    ? darkBorderColor || numberColor + "33" // ~20% opacity tint
    : borderColor;

  const titleColor = isDark ? "#F1F5F9" : "#0F172A";
  const descColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        margin: "32px 0",
      }}
    >
      {items.map((item, index) => {
        const badgeContent =
          variant === "number"
            ? index + 1
            : variant === "icon"
              ? icon
              : item.symbol;

        return (
          <div
            key={index}
            style={{
              background: resolvedBackground,
              border: `1px solid ${resolvedBorder}`,
              borderRadius: 24,
              padding: "clamp(12px,3vw,20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: "50%",
                  background: numberColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 400,
                  fontSize: "clamp(8px,1vw,12px)",
                  lineHeight: 1,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {badgeContent}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    color: titleColor,
                    fontWeight: 600,
                    fontSize: "clamp(10px,2vw,16px)",
                    lineHeight: 1.4,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: descColor,
                    fontSize: "clamp(8px,1vw,14px)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
