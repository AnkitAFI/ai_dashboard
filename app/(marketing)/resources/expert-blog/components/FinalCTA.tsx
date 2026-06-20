"use client";

import Link from "next/link";

interface FinalCTAProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function FinalCTA({
  title,
  description,
  buttonText,
  buttonHref,
  primaryColor,
  secondaryColor,
}: FinalCTAProps) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        padding: "60px 20px",
        textAlign: "center",
        borderRadius: 24,
      }}
    >
      <h2
        style={{
          color: "#fff",
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#E2E8F0",
          maxWidth: 700,
          margin: "0 auto 30px",
        }}
      >
        {description}
      </p>

      <Link
        href={buttonHref}
        style={{
          background: "#fff",
          color: primaryColor,
          padding: "14px 28px",
          borderRadius: 999,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {buttonText}
      </Link>
    </section>
  );
}