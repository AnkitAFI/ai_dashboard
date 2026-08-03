"use client";

interface BulletPoint {
  title: string;
  description: string;
}

interface ContentSectionProps {
  title: string;
  intro: string;
  bullets: BulletPoint[];
  conclusion?: string;
}

export default function ContentSection({
  title,
  intro,
  bullets,
  conclusion,
}: ContentSectionProps) {
  return (
    <section
      style={{
        margin: "56px 0",
      }}
    >
      {/* Heading */}
      <h2
        className="text-gray-900 dark:text-white"
        style={{
          margin: 0,
          marginBottom: "24px",
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        {title}
      </h2>

      {/* Introduction */}
      <p
        className="text-gray-700 dark:text-gray-300"
        style={{
          margin: 0,
          marginBottom: "24px",
          fontSize: "16px",
          lineHeight: 1.8,
        }}
      >
        {intro}
      </p>

      {/* Bullet Points */}
      <ul
        style={{
          margin: 0,
          marginBottom: conclusion ? "24px" : 0,
          //   paddingLeft: "12px",
        }}
      >
        {bullets.map((bullet, index) => (
          <li
            key={index}
            className="text-gray-700 dark:text-gray-300"
            style={{
              marginBottom: index !== bullets.length - 1 ? "18px" : 0,
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            <strong
              className="text-gray-900 dark:text-white"
              style={{
                fontWeight: 700,
              }}
            >
              {bullet.title}
            </strong>{" "}
            {bullet.description}
          </li>
        ))}
      </ul>

      {/* Conclusion */}
      {conclusion && (
        <p
          className="text-gray-700 dark:text-gray-300"
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: 1.8,
          }}
        >
          {conclusion}
        </p>
      )}
    </section>
  );
}
