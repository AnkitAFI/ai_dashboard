"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const VIDEOS = [
  {
    id: 0,
    title: "Insydz Introduction",
    description:
      "Insydz helps Amazon and Flipkart sellers understand their data and grow their business. No more guessing what works. Get clear insights and take action with confidence.",
    category: "Getting Started",
    gradient: "g-blue",
    videoUrl: "/videos/Insydz%20Introduction.mp4",
    thumbnail: "/insydz-introduction-thumbnail.png",
  },
  {
    id: 1,
    title: "Insydz - Complete Navigation Guide",
    description:
      "This step-by-step guide helps you set up your account and explore powerful seller tools, all in one place. Built for Amazon and Flipkart sellers who want smarter growth with data.",
    category: "Getting Started",
    gradient: "g-pink",
    videoUrl: "/videos/Insydz%20-%20%20Complete%20Navigation%20Guide.mp4",
    thumbnail: "/insydz-complete-navigation-guide-thumbnail.png",
  },
  {
    id: 2,
    title:
      "Find Winning Product Opportunities with Insydz's Opportunity Finder",
    description:
      "Discover hidden market gaps on Amazon and Flipkart using Insydz Opportunity Finder. See competitor counts, revenue potential, pricing gaps, demand signals, and AI-powered insights all in seconds.",
    category: "Product Research",
    gradient: "g-teal",
    videoUrl: "/videos/Insydz%20Feature%20-%20Opportunity%20Finder.mp4",
    thumbnail: "/insydz-opportunity-finder-thumbnail.png",
  },
  {
    id: 3,
    title: "Insydz’s Market Visibility",
    description:
      "Insydz's Market Visibility tool gives you a complete X-ray of your category, who's dominating, where the gaps are, and exactly how you can break in.",
    category: "Competitor Analysis",
    gradient: "g-purple",
    videoUrl: "/videos/Insydz%E2%80%99s%20Market%20Visibility.mp4",
    thumbnail: "/insydz-market-visibility-thumbnail.png",
  },
  {
    id: 4,
    title: "Insydz - Seller Price Comparison",
    description:
      "It monitors every competing listing on Amazon India in real time and sends alert. With AI suggested reprice that protects your margins. Stop guessing your next product idea. Start validating with real marketplace data.",
    category: "Price Tracking",
    gradient: "g-teal",
    videoUrl: "/videos/Seller-Price-Comparison.mp4",
    thumbnail: "/insydz-seller-price-comparison-thumbnail.png",
  },
  {
    id: 5,
    title: "Insydz - Review Comparison",
    description:
      "It shows exactly how your ratings and customer sentiment stack up against similar competitors. It also auto-drafts review responses and gives AI-powered insights to help you close the gap and build buyer trust faster.",
    category: "Review Intelligence",
    gradient: "g-orange",
    videoUrl: "/videos/Insydz%20Review%20Comp.mp4",
    thumbnail: "/insydz-review-comparison-thumbnail.png",
  },
];

export default function VideoGuidesContent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const guidesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and Search logic
  const filteredVideos = VIDEOS.filter((video) => {
    const matchesFilter =
      activeFilter === "All" || video.category === activeFilter;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (filter !== "All") {
      scrollToGuides();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      scrollToGuides();
    }
  };

  const scrollToGuides = () => {
    guidesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`video-guides-container ${mounted && resolvedTheme === "dark" ? "dark" : ""}`}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .video-guides-container {
          /* Light Mode Variables (Default) */
          --bg: #F3F4F6;
          --bg2: #FFFFFF;
          --card: #FFFFFF;
          --border: #D1D5DB;
          --text: #111827;
          --muted: #6B7280;
          --accent: #ec4899;
          --accent2: #8b5cf6;
          --blue: #3b82f6;
          --cyan: #06b6d4;
          --green: #10b981;
          --yellow: #f59e0b;
          --orange: #f97316;
          --pill-bg: rgba(236,72,153,0.08);
          --pill-border: rgba(236,72,153,0.2);
          
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* Dark Mode Variables */
        .video-guides-container.dark {
          --bg: #0f0f1a;
          --bg2: #13131f;
          --card: #1a1a2e;
          --border: rgba(255,255,255,0.08);
          --text: #ffffff;
          --muted: #9ca3af;
          --pill-bg: rgba(236,72,153,0.12);
          --pill-border: rgba(236,72,153,0.3);
        }

        .video-guides-container *, .video-guides-container *::before, .video-guides-container *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        .video-guides-container a { text-decoration: none; color: inherit; }
        .video-guides-container button { cursor: pointer; font-family: inherit; }

        /* ─── HERO ─── */
        .video-guides-container .hero {
          padding: 140px 24px 60px;
          text-align: center;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%);
        }
        .video-guides-container .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--pill-bg); border: 1px solid var(--pill-border);
          border-radius: 99px; padding: 5px 14px; font-size: 11px;
          font-weight: 600; color: var(--accent); margin-bottom: 20px;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .video-guides-container .hero h1 { font-size: clamp(36px, 6vw, 60px); font-weight: 900; line-height: 1.08; margin-bottom: 16px; }
        .video-guides-container .hero h1 span { background: linear-gradient(90deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .video-guides-container .hero-sub { font-size: 16px; color: var(--muted); max-width: 720px; margin: 0 auto 32px; line-height: 1.6; }
        .video-guides-container .hero-search {
          max-width: 520px; margin: 0 auto 28px;
          display: flex; align-items: center; gap: 10px;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 12px; padding: 10px 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .video-guides-container .hero-search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 4px 25px rgba(236,72,153,0.15);
        }
        .video-guides-container .hero-search svg { color: var(--muted); flex-shrink: 0; }
        .video-guides-container .hero-search input {
          flex: 1; background: none; border: none; outline: none;
          font-size: 14px; color: var(--text); font-family: inherit;
        }
        .video-guides-container .hero-search input::placeholder { color: var(--muted); }
        
        .video-guides-container .hero-stats { display: flex; justify-content: center; gap: 24px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
        .video-guides-container .hero-stat { display: flex; align-items: center; gap: 5px; }
        .video-guides-container .hero-stat span { color: var(--accent); font-weight: 600; }

        /* ─── FEATURED ─── */
        .video-guides-container .featured-section { max-width: 1100px; margin: 0 auto; padding: 0 24px 60px; }
        .video-guides-container .featured-card {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
        }
        .video-guides-container .featured-thumb {
          position: relative; background: linear-gradient(135deg, #1e1b4b, #312e81, #1e40af);
          background-size: cover; background-position: center; background-repeat: no-repeat;
          aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .video-guides-container .play-btn {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(0, 0, 0, 0.6); border: 2px solid rgba(255, 255, 255, 0.8);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .video-guides-container .play-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.8); }
        .video-guides-container .play-btn svg { width: 24px; height: 24px; fill: white; margin-left: 3px; }
        .video-guides-container .featured-info { padding: 36px; display: flex; flex-direction: column; gap: 14px; }
        .video-guides-container .featured-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .video-guides-container .tag {
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          padding: 3px 10px; border-radius: 99px;
        }
        .video-guides-container .tag-featured { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
        .video-guides-container .tag-review { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
        .video-guides-container .tag-repilt { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); font-size: 9px; }
        .video-guides-container .featured-info h2 { font-size: 22px; font-weight: 800; line-height: 1.25; }
        .video-guides-container .featured-info p { font-size: 13px; color: var(--muted); line-height: 1.65; }
        .video-guides-container .btn-watch {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: white; font-weight: 700; font-size: 13px;
          border: none; border-radius: 8px; padding: 10px 20px;
          width: fit-content; transition: opacity 0.2s;
        }
        .video-guides-container .btn-watch:hover { opacity: 0.88; }
        .video-guides-container .btn-watch svg { width: 14px; height: 14px; fill: white; }

        /* ─── FILTER TABS ─── */
        .video-guides-container .filter-section { max-width: 1100px; margin: 0 auto; padding: 0 24px 40px; }
        .video-guides-container .filter-row {
          display: flex; align-items: center; gap: 8px; overflow-x: auto;
          scrollbar-width: none; padding-bottom: 4px;
        }
        .video-guides-container .filter-row::-webkit-scrollbar { display: none; }
        .video-guides-container .filter-btn {
          flex-shrink: 0; font-size: 13px; font-weight: 500;
          padding: 7px 16px; border-radius: 99px; border: 1px solid var(--border);
          background: var(--card); color: var(--muted); transition: all 0.2s;
        }
        .video-guides-container .filter-btn.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
        .video-guides-container .filter-btn:hover:not(.active) { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .video-guides-container .repilt-tag {
          margin-left: auto; flex-shrink: 0;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
          border-radius: 6px; padding: 4px 10px; font-size: 10px; color: #a78bfa; font-weight: 600;
        }

        /* ─── GUIDES GRID ─── */
        .video-guides-container .guides-section { max-width: 1100px; margin: 0 auto; padding: 40px 24px 60px; scroll-margin-top: 80px; }
        .video-guides-container .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .video-guides-container .section-title { font-size: 20px; font-weight: 800; }
        .video-guides-container .see-all { font-size: 13px; color: var(--accent); font-weight: 600; }
        .video-guides-container .see-all:hover { text-decoration: underline; }
        .video-guides-container .guides-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .video-guides-container .no-results { grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--muted); font-size: 15px; }

        /* ─── VIDEO CARD ─── */
        .video-guides-container .video-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          transition: transform 0.2s, border-color 0.2s;
        }
        .video-guides-container .video-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); }
        .video-guides-container .video-thumb {
          position: relative; aspect-ratio: 16 / 9;
          background-size: cover; background-position: center; background-repeat: no-repeat;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .video-guides-container .video-thumb .play-sm {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(0, 0, 0, 0.6); border: 2px solid rgba(255, 255, 255, 0.8);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(6px); transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .video-guides-container .video-card:hover .play-sm { transform: scale(1.1); background: rgba(0, 0, 0, 0.8); }
        .video-guides-container .play-sm svg { width: 16px; height: 16px; fill: white; margin-left: 2px; }
        .video-guides-container .repilt-corner {
          position: absolute; top: 8px; right: 8px;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
          border-radius: 5px; padding: 2px 7px; font-size: 9px; color: #34d399; font-weight: 700;
        }
        .video-guides-container .video-body { padding: 14px 16px 16px; }
        .video-guides-container .video-body h3 { font-size: 13px; font-weight: 700; margin-bottom: 6px; line-height: 1.35; }
        .video-guides-container .video-body p { font-size: 11px; color: var(--muted); line-height: 1.5; margin-bottom: 12px; }
        .video-guides-container .watch-link { font-size: 12px; font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 4px; }
        .video-guides-container .watch-link:hover { text-decoration: underline; }
        .video-guides-container .watch-link svg { width: 12px; height: 12px; }

        /* gradient helpers */
        .video-guides-container .g-pink    { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); }
        .video-guides-container .g-purple  { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); }
        .video-guides-container .g-teal    { background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); }
        .video-guides-container .g-orange  { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); }
        .video-guides-container .g-blue    { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); }
        .video-guides-container .g-green   { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); }
        .video-guides-container .g-red     { background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%); }
        .video-guides-container .g-indigo  { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .video-guides-container .g-yellow  { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); }

        /* ─── LEARNING PATHS ─── */
        .video-guides-container .paths-section {
          background: var(--bg2); padding: 60px 24px;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .video-guides-container .paths-inner { max-width: 1100px; margin: 0 auto; }
        .video-guides-container .paths-header { text-align: center; margin-bottom: 40px; }
        .video-guides-container .paths-header h2 { font-size: 30px; font-weight: 900; margin-bottom: 10px; }
        .video-guides-container .paths-header p { font-size: 15px; color: var(--muted); max-width: 480px; margin: 0 auto; line-height: 1.6; }
        .video-guides-container .paths-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .video-guides-container .path-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
        }
        .video-guides-container .path-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px; font-size: 18px;
        }
        .video-guides-container .path-card h3 { font-size: 15px; font-weight: 800; margin-bottom: 6px; }
        .video-guides-container .path-card .sub { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
        .video-guides-container .path-steps { list-style: none; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .video-guides-container .path-steps li {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12px; color: var(--muted);
        }
        .video-guides-container .step-num {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          background: rgba(236,72,153,0.15); border: 1px solid rgba(236,72,153,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: var(--accent);
        }
        .video-guides-container .btn-path {
          width: 100%; padding: 9px; border-radius: 8px; font-size: 13px;
          font-weight: 700; border: 1px solid var(--border); background: transparent;
          color: var(--text); transition: all 0.2s;
        }
        .video-guides-container .btn-path:hover { background: var(--accent); border-color: var(--accent); color: white; }

        /* ─── NEWSLETTER ─── */
        .video-guides-container .newsletter {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 60px 24px; text-align: center;
        }
        .video-guides-container.dark .newsletter {
          background: linear-gradient(135deg, #1a0a2e 0%, #0f1a2e 100%);
        }
        .video-guides-container .newsletter-inner { max-width: 480px; margin: 0 auto; }
        .video-guides-container .newsletter .icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(236,72,153,0.15); border: 1px solid rgba(236,72,153,0.3);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 18px;
        }
        .video-guides-container .newsletter h2 { font-size: 28px; font-weight: 900; margin-bottom: 10px; }
        .video-guides-container .newsletter p { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
        .video-guides-container .email-row { display: flex; gap: 8px; max-width: 380px; margin: 0 auto 12px; }
        .video-guides-container .email-row input {
          flex: 1; background: var(--card); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 14px; font-size: 13px;
          color: var(--text); font-family: inherit; outline: none;
        }
        .video-guides-container .email-row input::placeholder { color: var(--muted); }
        .video-guides-container .email-row input:focus { border-color: var(--accent); }
        .video-guides-container .btn-subscribe {
          background: var(--accent); color: white; font-weight: 700; font-size: 13px;
          border: none; border-radius: 8px; padding: 10px 20px; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .video-guides-container .btn-subscribe:hover { opacity: 0.88; }
        .video-guides-container .newsletter .fine { font-size: 11px; color: var(--muted); }

        @media (max-width: 768px) {
          .video-guides-container .featured-card { grid-template-columns: 1fr; }
          .video-guides-container .guides-grid { grid-template-columns: 1fr 1fr; }
          .video-guides-container .paths-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .video-guides-container .guides-grid { grid-template-columns: 1fr; }
        }
      `,
        }}
      />

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          Seller Resource Hub
        </div>
        <h1>
          Master Insydz With Our
          <br />
          <span>Video Guides</span>
        </h1>
        <p className="hero-sub">
          Learn how to turn marketplace data into profitable decisions.
          <br />
          Step-by-step tutorials from account setup to advanced competitor
          analysis.
        </p>
        <div className="hero-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search for guides (e.g. 'Price Tracking')"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            ✦ <span>10+</span> High-Quality Videos
          </div>
          <div className="hero-stat">
            ✦ <span>10</span> Actionable Categories
          </div>
          <div className="hero-stat">
            ✦ <span>100%</span> Free Access
          </div>
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <div className="featured-section">
        <div className="featured-card">
          <div
            className="featured-thumb"
            style={{
              backgroundImage: `url('/insydz-introduction-thumbnail.png')`,
            }}
            onClick={() =>
              window.open("/videos/Insydz%20Introduction.mp4", "_blank")
            }
          >
            <div className="play-btn">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="featured-info">
            <div className="featured-tags">
              <span className="tag tag-featured">Featured</span>
              <span className="tag tag-review">Introduction</span>
            </div>
            <h2>Insydz Introduction</h2>
            <p>
              Insydz helps Amazon and Flipkart sellers understand their data and
              grow their business. No more guessing what works. Get clear
              insights and take action with confidence.
            </p>
            <button
              className="btn-watch"
              onClick={() =>
                window.open("/videos/Insydz%20Introduction.mp4", "_blank")
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </button>
          </div>
        </div>
      </div>

      {/* ─── FILTER TABS ─── */}
      <div className="filter-section">
        <div className="filter-row">
          {[
            "All",
            "Getting Started",
            "Price Tracking",
            "Product Research",
            "Competitor Analysis",
            "Review Intelligence",
            "Sales Analytics",
            "Inventory",
            "Keyword Research",
          ].map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GUIDES GRID ─── */}
      <div className="guides-section" ref={guidesRef}>
        <div className="section-header">
          <div className="section-title">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeFilter === "All"
                ? "Latest Guides"
                : `${activeFilter} Guides`}
          </div>
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            {filteredVideos.length} videos found
          </p>
        </div>
        <div className="guides-grid">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <div className="video-card" key={video.id}>
                <div
                  className={`video-thumb ${video.thumbnail ? "" : video.gradient}`}
                  style={
                    video.thumbnail
                      ? { backgroundImage: `url('${video.thumbnail}')` }
                      : {}
                  }
                  onClick={() =>
                    video.videoUrl ? window.open(video.videoUrl, "_blank") : null
                  }
                >
                  <div className="play-sm">
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="video-body">
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                  <a
                    href={video.videoUrl || "#"}
                    target={video.videoUrl ? "_blank" : undefined}
                    className="watch-link"
                  >
                    Watch Now{" "}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No videos found matching your search. Try a different term.
            </div>
          )}
        </div>
      </div>

      {/* ─── NEWSLETTER ─── */}
      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="icon-wrap">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2>Stay Updated with New Guides</h2>
          <p>
            We release new tutorials and strategy deep-dives every week. Join
            10,000+ sellers who are mastering their market.
          </p>
          <div className="email-row">
            <input type="email" placeholder="Enter your email address" />
            <button className="btn-subscribe">Subscribe</button>
          </div>
          <div className="fine">No spam, unsubscribe anytime.</div>
        </div>
      </section>
    </div>
  );
}
