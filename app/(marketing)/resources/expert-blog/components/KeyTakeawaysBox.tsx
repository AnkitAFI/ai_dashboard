// "use client";

// interface KeyTakeawaysBoxProps {
//   title?: string;
//   items: string[];
//   accentColor: string;
//   backgroundColor?: string;
// }

// export default function KeyTakeawaysBox({
//   title = "Key Takeaways",
//   items,
//   accentColor,
//   backgroundColor = "#0F172A",
// }: KeyTakeawaysBoxProps) {
//   return (
//     <div
//       style={{
//         background: backgroundColor,
//         borderRadius: 24,
//         padding: 40,
//       }}
//     >
//       <h3
//         style={{
//           color: "#fff",
//           fontWeight: 800,
//           fontSize: 20,
//           marginBottom: 28,
//         }}
//       >
//         📋 {title}
//       </h3>

//       <div>
//         {items.map((item, index) => (
//           <div
//             key={index}
//             style={{
//               display: "flex",
//               gap: 16,
//               marginBottom: 20,
//             }}
//           >
//             <div
//               style={{
//                 background: accentColor,
//                 width: 22,
//                 height: 22,
//                 borderRadius: "50%",
//                 flexShrink: 0,
//               }}
//             />

//             <p
//               style={{
//                 color: "#94A3B8",
//                 margin: 0,
//                 lineHeight: 1.6,
//               }}
//             >
//               {item}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }





"use client";

import { Check } from "lucide-react";

interface KeyTakeawaysBoxProps {
  title?: string;
  items: string[];
  accentColor?: string;
  backgroundColor?: string;
}

export default function KeyTakeawaysBox({
  title = "Key Takeaways",
  items,
  accentColor = "#10B981",
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
          display: "flex",
          alignItems: "center",
          gap: 10,
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
              marginBottom: 24,
              alignItems: "flex-start",
            }}
          >
            {/* Tick Circle */}
            <div
              style={{
                width: 28,
                height: 28,
                minWidth: 28,
                borderRadius: "50%",
                background: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
                boxShadow: "0 0 10px rgba(16,185,129,0.35)",
              }}
            >
              <Check
                size={16}
                color="#fff"
                strokeWidth={3.5}
              />
            </div>

            <p
              style={{
                color: "#94A3B8",
                margin: 0,
                lineHeight: 1.8,
                fontSize: 16,
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