/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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
        destination: "/resources/expert-blog/amazon-sales-drop",
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
    ];
  },
};

export default nextConfig;
