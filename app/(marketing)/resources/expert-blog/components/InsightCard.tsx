// "use client";

// import React from "react";
// import { useTheme } from "next-themes";

// export interface CardChip {
//   label: string;
//   bg: string;
//   color: string;
// }

// export interface InsightCard {
//   /**
//    * Icon can be:
//    * "✓"
//    * "+"
//    * <Check />
//    * <TrendingUp />
//    */
//   icon?: React.ReactNode;
//   iconBg?: string;
//   iconColor?: string;

//   title: string;

//   /**
//    * Supports:
//    * - Plain text
//    * - Bold text
//    * - Lists
//    * - Links
//    * - Any JSX
//    */
//   description: React.ReactNode;

//   /**
//    * One or more chips
//    */
//   chips?: CardChip[];

//   /**
//    * Optional card styling
//    */
//   minHeight?: number;
//   borderColor?: string;
//   backgroundColor?: string;
// }

// interface InsightCardsProps {
//   cards: InsightCard[];

//   /**
//    * Optional:
//    * 2 = 2 cards per row
//    * 3 = 3 cards per row
//    * 4 = 4 cards per row
//    *
//    * If not provided,
//    * auto responsive layout is used.
//    */
//   columns?: 2 | 3 | 4;

//   /**
//    * Used only when columns is not specified.
//    */
//   minCardWidth?: number;

//   gap?: number;
//   marginBottom?: number;
// }

// export default function InsightCards({
//   cards,
//   columns,
//   minCardWidth = 320,
//   gap = 20,
//   marginBottom = 48,
// }: InsightCardsProps) {
//   const { resolvedTheme } = useTheme();

//   const getGridTemplateColumns = () => {
//     if (columns) {
//       return `repeat(${columns}, minmax(0, 1fr))`;
//     }

//     return `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`;
//   };

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: getGridTemplateColumns(),
//         gap,
//         marginBottom,
//       }}
//     >
//       {cards.map((card, index) => (
//         <div
//           key={index}
//           style={{
//             background:
//               card.backgroundColor ||
//               (resolvedTheme === "dark" ? "#111827" : "#FFFFFF"),
//             border: `1px solid ${card.borderColor || "#D7ECE4"}`,
//             borderRadius: 28,
//             padding: 24,
//             display: "flex",
//             flexDirection: "column",
//             minHeight: card.minHeight ?? 320,
//           }}
//         >
//           {/* Icon */}
//           {card.icon && (
//             <div
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 12,
//                 background: card.iconBg || "#F3F4F6",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: card.iconColor || "#111827",
//                 fontSize: 22,
//                 fontWeight: 700,
//                 marginBottom: 18,
//                 flexShrink: 0,
//               }}
//             >
//               {card.icon}
//             </div>
//           )}

//           {/* Title */}
//           <h3
//             style={{
//               margin: "0 0 14px",
//               fontSize: 20,
//               fontWeight: 700,
//               lineHeight: 1.4,
//               color: resolvedTheme === "dark" ? "#F8FAFC" : "#071827",
//               fontFamily: "'Sora', sans-serif",
//             }}
//           >
//             {card.title}
//           </h3>

//           {/* Description */}
//           <div
//             style={{
//               flex: 1,
//               fontSize: 15,
//               lineHeight: 1.9,
//               color: resolvedTheme === "dark" ? "#94A3B8" : "#64748B",
//               fontFamily: "'Sora', sans-serif",
//             }}
//           >
//             {card.description}
//           </div>

//           {/* Chips */}
//           {card.chips && card.chips.length > 0 && (
//             <div
//               style={{
//                 marginTop: 24,
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: 8,
//               }}
//             >
//               {card.chips.map((chip, chipIndex) => (
//                 <span
//                   key={chipIndex}
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     padding: "6px 14px",
//                     borderRadius: 999,
//                     background: chip.bg,
//                     color: chip.color,
//                     fontSize: 12,
//                     fontWeight: 700,
//                     fontFamily: "'Sora', sans-serif",
//                   }}
//                 >
//                   {chip.label}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import React from "react";
import { useTheme } from "next-themes";

export interface CardChip {
  label: string;
  bg: string;
  color: string;
}

export interface InsightCard {
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;

  title: string;
  description: React.ReactNode;

  chips?: CardChip[];

  minHeight?: number;
  borderColor?: string;
  backgroundColor?: string;
}

interface InsightCardsProps {
  cards: InsightCard[];

  /**
   * Desktop columns
   * Tablet automatically becomes 2
   * Mobile automatically becomes 1
   */
  columns?: 2 | 3 | 4;

  gap?: number;
  marginBottom?: number;
}

export default function InsightCards({
  cards,
  columns = 3,
  gap = 20,
  marginBottom = 48,
}: InsightCardsProps) {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <style jsx>{`
        .insight-cards-grid {
          display: grid;
        }

        .columns-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .columns-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .columns-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        @media (max-width: 1024px) {
          .columns-2,
          .columns-3,
          .columns-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .columns-2,
          .columns-3,
          .columns-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className={`insight-cards-grid columns-${columns}`}
        style={{
          gap,
          marginBottom,
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background:
                card.backgroundColor ||
                (resolvedTheme === "dark" ? "#111827" : "#FFFFFF"),
              border: `1px solid ${card.borderColor || "#DCE7F7"}`,
              borderRadius: 28,
              padding: 26,
              display: "flex",
              flexDirection: "column",
              minHeight: card.minHeight ?? 320,
            }}
          >
            {/* Icon */}
            {card.icon && (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: card.iconBg || "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.iconColor || "#111827",
                  marginBottom: 20,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
            )}

            {/* Title */}
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.15,
                color: resolvedTheme === "dark" ? "#F8FAFC" : "#162433",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {card.title}
            </h3>

            {/* Description */}
            <div
              style={{
                flex: 1,
                fontSize: 15,
                lineHeight: 1.9,
                color: resolvedTheme === "dark" ? "#94A3B8" : "#6A86A5",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {card.description}
            </div>

            {/* Chips */}
            {card.chips && card.chips.length > 0 && (
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {card.chips.map((chip, chipIndex) => (
                  <span
                    key={chipIndex}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: chip.bg,
                      color: chip.color,
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
