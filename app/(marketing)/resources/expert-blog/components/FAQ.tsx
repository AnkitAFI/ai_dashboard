// "use client";

// import { useState } from "react";

// interface FAQItem {
//   q: string;
//   a: string;
// }

// interface FAQProps {
//   faqs: FAQItem[];
//   accentColor: string;
// }

// export default function FAQ({
//   faqs,
//   accentColor,
// }: FAQProps) {
//   const [openFaq, setOpenFaq] =
//     useState<number | null>(0);

//   return (
//     <div>
//       {faqs.map((faq, index) => (
//         <div
//           key={index}
//           style={{
//             border:
//               openFaq === index
//                 ? `1px solid ${accentColor}`
//                 : "1px solid #E5E7EB",
//             borderRadius: 12,
//             marginBottom: 12,
//             overflow: "hidden",
//           }}
//         >
//           <div
//             onClick={() =>
//               setOpenFaq(
//                 openFaq === index
//                   ? null
//                   : index
//               )
//             }
//             style={{
//               padding: 20,
//               cursor: "pointer",
//               display: "flex",
//               justifyContent: "space-between",
//             }}
//           >
//             <strong>{faq.q}</strong>

//             <span
//               style={{
//                 color: accentColor,
//                 fontWeight: 700,
//               }}
//             >
//               {openFaq === index ? "−" : "+"}
//             </span>
//           </div>

//           {openFaq === index && (
//             <div
//               style={{
//                 padding: "0 20px 20px",
//                 lineHeight: 1.7,
//               }}
//             >
//               {faq.a}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  faqs: FAQItem[];
  accentColor: string;
}

export default function FAQ({ faqs, accentColor }: FAQProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div
      style={{
        border: `1px solid ${accentColor}30`,
        borderRadius: 24,
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            borderBottom:
              index !== faqs.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
          }}
        >
          <div
            onClick={() => setOpenFaq(openFaq === index ? null : index)}
            style={{
              padding: "18px 24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "24px",
              }}
            >
              {faq.q}
            </h3>

            <div
              style={{
                minWidth: 28,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `${accentColor}20`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {openFaq === index ? "−" : "+"}
            </div>
          </div>

          {openFaq === index && (
            <div
              className="text-black dark:text-gray-300"
              style={{
                padding: "0 24px 24px",
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
