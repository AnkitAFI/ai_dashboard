/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      // Fix for cached users navigating to the removed seller dashboard
      {
        source: "/seller/dashboard",
        destination: "/dashboard",
        permanent: true,
      },
      // ── 1. User-Reported 404 URLs & Broken Internal Links ─────────────────
      {
        source: "/resources/expert-blog/amazon-buy-box-win-rate",
        destination: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/amazon-review-analysis-tool-india",
        destination: "/resources/expert-blog/amazon-review-analysis-guide-india",
        permanent: true,
      },
      {
        source: "/features/festive-trend-checker",
        destination: "/features/festive-trend-feature",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/flipkart-seller-analytics-tool",
        destination: "/resources/expert-blog/flipkart-seller-analytics-tool-india",
        permanent: true,
      },
      {
        source: "/compare",
        destination: "/compare/insydzvshelium",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/amazon-vs-flipkart-india-sellers",
        destination: "/resources/expert-blog/amazon-vs-flipkart-india-seller",
        permanent: true,
      },
      {
        source: "/resources/case-studies",
        destination: "/use-cases",
        permanent: true,
      },
      {
        source: "/compare/insydz-vs-jungle-scout",
        destination: "/compare/insydzvsjunglescout",
        permanent: true,
      },
      {
        source: "/compare/insydz-vs-helium-10",
        destination: "/compare/insydzvshelium",
        permanent: true,
      },
      {
        source: "/compare/insydz-vs-viral-launch",
        destination: "/compare/insydzvsvirallaunch",
        permanent: true,
      },
      {
        source: "/resources/guides",
        destination: "/resources/video-guides",
        permanent: true,
      },
      {
        source: "/resources/videos",
        destination: "/resources/video-guides",
        permanent: true,
      },
      {
        source: "/flipkart-sellers",
        destination: "/solutions/flipkart-sellers",
        permanent: true,
      },
      {
        source: "/amazon-sellers",
        destination: "/solutions/amazon-sellers",
        permanent: true,
      },
      {
        source: "/ecommerce-agencies",
        destination: "/solutions/ecommerce-agencies",
        permanent: true,
      },
      {
        source: "/brand-managers",
        destination: "/solutions/brand-managers",
        permanent: true,
      },
      {
        source: "/features/demand-signals",
        destination: "/features/product-research-feature",
        permanent: true,
      },
      {
        source: "/features/inventory-dashboard",
        destination: "/use-cases/avoid-stockouts",
        permanent: true,
      },
      // ── 2. Missing Section Index Pages (Preventing 404s) ──────────────────
      {
        source: "/about",
        destination: "/about/our-vision",
        permanent: true,
      },
      {
        source: "/resources",
        destination: "/resources/expert-blog",
        permanent: true,
      },
      {
        source: "/free-tools",
        destination: "/free-tools/free-amazon-product-analyzer",
        permanent: true,
      },
      {
        source: "/author",
        destination: "/author/vikrant-singh",
        permanent: true,
      },
      // ── 3. Schema & Legacy /blog/ URLs -> Real /resources/expert-blog/ Slugs ─
      {
        source: "/blog/negative-amazon-india-reviews-stop-compounding",
        destination: "/resources/expert-blog/negative-reviews-amazon-india",
        permanent: true,
      },
      {
        source: "/blog/flipkart-seller-analytics-tool-india-2026",
        destination: "/resources/expert-blog/flipkart-seller-analytics-tool-india",
        permanent: true,
      },
      {
        source: "/blog/find-every-keyword-amazon-india-competitor-outrank-them",
        destination: "/resources/expert-blog/find-competitor-keywords-amazon-india",
        permanent: true,
      },
      {
        source: "/blog/competitor-undercutting-amazon-india-price",
        destination: "/resources/expert-blog/competitor-undercutting-amazon-india",
        permanent: true,
      },
      {
        source: "/blog/seller-tools",
        destination: "/resources/expert-blog",
        permanent: true,
      },
      {
        source: "/blog/amazon-zero-referral-fee-undercutting-india-2026",
        destination: "/resources/expert-blog/amazon-zero-referral-fee",
        permanent: true,
      },
      {
        source: "/blog/why-did-my-amazon-india-sales-drop-suddenly",
        destination: "/resources/expert-blog/amazon-listing-not-ranking-india",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/resources/expert-blog",
        permanent: true,
      },
      {
        source: "/blog/:slug*",
        destination: "/resources/expert-blog/:slug*",
        permanent: true,
      },
      // ── 4. Low-Traction Blog 301 Redirect Map ────────────────────────────
      {
        source: "/resources/expert-blog/analyze-amazon-reviews-india-content",
        destination: "/resources/expert-blog/amazon-review-analysis-guide-india",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/prime-day-india-2026-seller-questions",
        destination: "/features/festive-trend-feature",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/amazon-sales-drop",
        destination: "/resources/expert-blog/amazon-listing-not-ranking-india",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/amazon-india-price-war-strategy",
        destination: "/resources/expert-blog/amazon-competitor-price-tracking-tool",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/switch-excel-ai-amazon-india",
        destination: "/solutions/amazon-sellers",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/top-amazon-india-sellers-habits",
        destination: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/agency-client-reporting-automation",
        destination: "/solutions/ecommerce-agencies",
        permanent: true,
      },
      {
        source: "/resources/expert-blog/amazon-repricing-strategy-india-2026",
        destination: "/use-cases/track-competitor-prices",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    return [
      {
        // Enforce HTTPS HSTS & Security headers across the entire website
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Long-lived caching only in production. In dev it makes the browser
      // keep stale JS and images after you edit them.
      ...(isProd
        ? [
            {
              // 1-year immutable caching for static public assets
              source:
                "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|ttf|otf|mp4|webm)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            {
              // 1-year immutable caching for Next.js built chunks
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
