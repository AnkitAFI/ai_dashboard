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

export default function FAQ({
  faqs,
  accentColor,
}: FAQProps) {
  const [openFaq, setOpenFaq] =
    useState<number | null>(0);

  return (
    <div>
      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            border:
              openFaq === index
                ? `1px solid ${accentColor}`
                : "1px solid #E5E7EB",
            borderRadius: 12,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            onClick={() =>
              setOpenFaq(
                openFaq === index
                  ? null
                  : index
              )
            }
            style={{
              padding: 20,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>{faq.q}</strong>

            <span
              style={{
                color: accentColor,
                fontWeight: 700,
              }}
            >
              {openFaq === index ? "−" : "+"}
            </span>
          </div>

          {openFaq === index && (
            <div
              style={{
                padding: "0 20px 20px",
                lineHeight: 1.7,
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