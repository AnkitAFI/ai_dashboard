"use client";

import Link from "next/link";

interface FeatureCTAProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;

  backgroundColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

export default function FeatureCTA({
  title,
  description,
  buttonText,
  buttonHref,
  backgroundColor = "#0A1524",
  buttonColor = "#F4500A",
  buttonTextColor = "#FFFFFF",
}: FeatureCTAProps) {
  return (
    <div
      style={{
        background: backgroundColor,
        borderRadius: 12,
        paddingTop: "clamp(16px,4vw,20px)",
        paddingBottom: "clamp(16px,4vw,20px)",
        paddingLeft: "clamp(16px,4vw,20px)",
        paddingRight: "clamp(16px,4vw,20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // gap: 24,
        flexWrap: "wrap",
        marginBottom: 40,
      }}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <h3
          style={{
            color: "white",
            fontSize: "clamp(12px,3vw,20px)",
            fontWeight: 400,
            lineHeight: 1.4,
            marginBottom: "clamp(12px,2vw,16px)",
            fontFamily: "'Sora',sans-serif",
            border: "none",
            padding: 0,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "clamp(12px,3vw,16px)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>

      <Link
        href={buttonHref}
        style={{
          background: buttonColor,
          color: buttonTextColor,
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          textDecoration: "none",
          fontFamily: "'Sora',sans-serif",
        }}
        className="sm:w-auto w-full text-center"
      >
        {buttonText}
      </Link>
    </div>
  );
}
