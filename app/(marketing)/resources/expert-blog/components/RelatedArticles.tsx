import Link from "next/link";

interface RelatedArticleCard {
  tag: string;
  title: string;
  route: string;
  image: string;
}

interface RelatedArticlesProps {
  title: string;
  cards: RelatedArticleCard[];
  resolvedTheme?: string;
}

export default function RelatedArticles({
  title,
  cards,
  resolvedTheme,
}: RelatedArticlesProps) {
  return (
    <div style={{ marginTop: 48 }}>
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(20px, 3vw, 26px)",
          fontWeight: 900,
          color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
          marginBottom: 32,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
        }}
      >
        {cards.map((card, i) => (
          <Link
            key={i}
            href={card.route}
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 20,
                overflow: "hidden",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #F1F5F9",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "none"
                    : "0 4px 16px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: "100%",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  resolvedTheme === "dark"
                    ? "none"
                    : "0 4px 16px rgba(0,0,0,0.04)";
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  background: resolvedTheme === "dark" ? "#1e293b" : "#f8fafc",
                  aspectRatio: "1978 / 795",
                  width: "100%",
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "20px 22px 24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#F97316",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontFamily: "'Sora', sans-serif",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  {card.tag}
                </span>

                <h4
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.4,
                    color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {card.title}
                </h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
