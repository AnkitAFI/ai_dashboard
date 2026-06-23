"use client";

import Link from "next/link";

interface StatItem {
  value: string;
  label: string;
}

interface FinalCTAProps {
  title: string;
  description: string;

  primaryButtonText: string;
  primaryButtonHref: string;

  secondaryButtonText?: string;
  secondaryButtonHref?: string;

  primaryColor: string;
  secondaryColor: string;

  stats?: StatItem[];
}

export default function FinalCTA({
  title,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  primaryColor,
  secondaryColor,
  stats = [],
}: FinalCTAProps) {
  return (
    <section
      style={{
        width: "100%",
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        padding: "clamp(40px,6vw,60px) 12px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Heading */}
        <h3
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(28px, 4vw, 50px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-1px",
            marginBottom: 24,
            maxWidth: 900,
            marginInline: "auto",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.7,
            maxWidth: 760,
            margin: "0 auto 40px",
          }}
        >
          {description}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 56,
          }}
        >
          <Link
            href={primaryButtonHref}
            style={{
              display: "inline-block",
              background: "#fff",
              color: primaryColor,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "13px",
              padding: "16px 32px",
              borderRadius: 999,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            {primaryButtonText}
          </Link>

          {secondaryButtonText && secondaryButtonHref && (
            <Link
              href={secondaryButtonHref}
              style={{
                display: "inline-block",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                padding: "16px 24px",
                borderRadius: 999,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              {secondaryButtonText}
            </Link>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  minWidth: 135,
                  padding: "18px 22px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(22px,2vw,32px)",
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
