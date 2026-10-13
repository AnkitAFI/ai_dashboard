import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://insydz.com";
  const now = new Date();

  const routes = [
    "",
    "/pricing",
    "/about/contact-us",
    "/about/our-vision",
    "/about/careers",
    "/features",
    "/features/competitor-price-tracking-feature",
    "/features/review-analytics-feature",
    "/features/price-optimization-feature",
    "/features/keyword-rank-tracking-feature",
    "/features/product-research-feature",
    "/features/ai-recommendations-feature",
    "/features/whatsapp-alerts-feature",
    "/features/festive-trend-feature",
    "/solutions",
    "/solutions/amazon-sellers",
    "/solutions/amazon-advertising",
    "/solutions/flipkart-sellers",
    "/solutions/ecommerce-agencies",
    "/solutions/brand-managers",
    "/use-cases",
    "/use-cases/track-competitor-prices",
    "/use-cases/find-profitable-products",
    "/use-cases/analyze-customer-reviews",
    "/use-cases/improve-seo",
    "/use-cases/avoid-stockouts",
    "/compare/insydzvshelium",
    "/free-tools/free-amazon-product-analyzer",
    "/free-tools/free-review-sentiment-checker",
    "/free-tools/free-competitor-price-checker",
    "/resources/expert-blog",
    "/resources/video-guides",
    "/terms-service",
    "/privacy-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/solutions") || route.startsWith("/features") ? 0.8 : 0.6,
  }));
}
