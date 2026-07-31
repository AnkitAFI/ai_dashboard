"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { useTheme } from "next-themes";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaPrivateLabel = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      name: "Insydz",
      url: "https://insydz.com",
      logo: { "@type": "ImageObject", url: "https://insydz.com/logo.png" },
      sameAs: [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz",
      ],
      description:
        "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers.",
    },
    {
      "@type": "WebPage",
      "@id":
        "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      url: "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      name: "Competitor Undercutting Your Amazon India Price",
      description:
        "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
      isPartOf: {
        "@type": "WebSite",
        name: "Insydz",
        url: "https://insydz.com",
      },
      breadcrumb: {
        "@id":
          "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id":
        "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://insydz.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: "https://insydz.com/resources",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Expert Blog",
          item: "https://insydz.com/resources/expert-blog",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Competitor Undercutting Your Amazon India Price",
          item: "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      "@id":
        "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#article",
      headline:
        "Amazon Private Label Guide India 2026: Everything You Need to Know",
      description:
        "A comprehensive guide to starting an Amazon Private Label business in India for 2026. Replicating the success of top brands.",
      image: "https://insydz.com/Amazon-Vine-India-image1.png",
      author: {
        "@type": "Person",
        name: "Vikrant Singh",
        url: "https://insydz.com/author/vikrant-singh",
      },
      publisher: { "@id": "https://insydz.com/#organization" },
      datePublished: "2026-05-15",
      dateModified: "2026-05-15",
      keywords: [
        "amazon private label india",
        "private label amazon 2026",
        "sell on amazon india",
        "ecommerce brand building india",
      ],
      articleSection: "Seller Tools & Strategy",
      inLanguage: "en-IN",
      wordCount: 4400,
      timeRequired: "PT12M",
    },
  ],
};

// ── TOC ───────────────────────────────────────────────────────────────────────

const TOC = [
  { id: "guide-covers", label: "Key Takeaways" },
  { id: "what-is-private-label", label: "Why It Happens Silently" },
  { id: "product-selection", label: "How to Check Manually" },
  { id: "common-pitfalls", label: "The Real Cost of Delayed Awareness" },
  { id: "prevent-drops", label: "Setting Up Real-Time Alerts" },
  { id: "causes-fixes", label: "How to Respond When the Alert Fires" },
  { id: "faq", label: "FAQs" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I know if a competitor lowered their price on Amazon India?",
    a: "The fastest manual check: search your primary keyword on Amazon India in a private browser window and look at the Buy Box price. If it is lower than your price, a competitor has undercut you. For continuous monitoring, Insydz tracks competitor prices and sends an alert within 1 hour of any price change.",
  },
  {
    q: "What happens to my listing when I lose the Buy Box?",
    a: "When you lose the Buy Box, all default traffic goes to the Buy Box holder — buyers who click Buy Now go to the competitor. Your sales velocity drops, Amazon reads this as reduced demand, and keyword rankings begin to fall. The longer the gap, the deeper the damage.",
  },
  {
    q: "How fast should I respond to a competitor price drop?",
    a: "Within 1 hour is the target — Amazon's Buy Box algorithm updates within minutes of a price change. Every hour without it costs measurable sessions and orders. The sellers who win back fastest are those who respond first with a considered decision, not necessarily the lowest price.",
  },
  {
    q: "Can I get WhatsApp alerts for competitor price changes?",
    a: "Yes. Insydz sends WhatsApp alerts within 1 hour of a competitor price change on any ASIN you track. WhatsApp outperforms email for Indian sellers because the average seller checks WhatsApp more than 50 times a day. The alert arrives with the old price, the new price, your Buy Box status, and a suggested response.",
  },
  {
    q: "What is a safe price floor to protect my margins?",
    a: "Your price floor is the minimum price at which you cover COGS, Amazon commission, FBA fees, and a minimum acceptable net margin of 20 to 25 percent. For a ₹799 product with ₹160 COGS and ₹250 in Amazon fees, the floor is approximately ₹513. Set this before monitoring so alerts trigger a considered response.",
  },
  {
    q: "Is it always right to match a competitor's lower price?",
    a: "No. Matching is one of three options: match their price to win the Buy Box back, hold your price and protect margin while improving listing quality, or beat them by ₹1 to take the Buy Box decisively. The right choice depends on the gap size, your margin floor, and how strong your listing is relative to theirs.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonSalesDropContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = "insydz-private-label-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaPrivateLabel);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) {
          setActiveSection(TOC[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  interface ArticleImgProps {
    src: string;
    alt: string;
    caption?: string;
  }
  function ArticleImg({ src, alt, caption }: ArticleImgProps) {
    const [loaded, setLoaded] = useState(false);
    return (
      <figure className="article-img-wrap">
        {!loaded && <div className="img-shimmer" />}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "auto",
            display: loaded ? "block" : "none",
          }}
        />
        {caption && <figcaption className="img-caption">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}

        .read-progress{position:fixed;top:64px;left:0;height:3px;background:linear-gradient(90deg,#F4500A,#0ABFA4);z-index:200;transition:width .1s linear;border-radius:0 2px 2px 0}
        @media(min-width:640px){.read-progress{top:72px}}
        @media(min-width:1024px){.read-progress{top:80px}}

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px;align-items:start}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px;align-items:start}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px;align-items:start}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto;align-self:start;height:fit-content}}
        @media(min-width:1024px){.toc-sidebar{top:80px;padding:22px}}
        .dark .toc-sidebar{background:#111827;border-color:#1f2937}

        .mobile-toc-btn{display:flex;width:100%;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#111;cursor:pointer;align-items:center;justify-content:space-between;margin-bottom:14px}
        .dark .mobile-toc-btn{background:#111827;border-color:#1f2937;color:#f9fafb}
        @media(min-width:768px){.mobile-toc-btn{display:none}}
        .mobile-toc-panel{display:none;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:14px;margin-bottom:20px}
        .dark .mobile-toc-panel{background:#111827;border-color:#1f2937}
        .mobile-toc-panel.open{display:block}

        .article-body{font-family:'Lora',serif;font-size:15px;line-height:1.78;color:#1E293B}
        @media(min-width:640px){.article-body{font-size:15.5px}}
        @media(min-width:1024px){.article-body{font-size:16px}}
        .dark .article-body{color:#d1d5db}

        .article-body h2{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#0A0F1A;margin:40px 0 12px;padding-bottom:10px;border-bottom:2px solid #E5E7EB;letter-spacing:-.3px;line-height:1.3;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h2{font-size:20px;margin:48px 0 14px;scroll-margin-top:80px}}
        @media(min-width:1024px){.article-body h2{font-size:22px;margin:52px 0 14px;scroll-margin-top:84px}}
        .dark .article-body h2{color:#f9fafb;border-color:#1f2937}
        .article-body h2:first-child{margin-top:0}

        .article-body h3{font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0A0F1A;margin:24px 0 8px;letter-spacing:-.2px;scroll-margin-top:72px}
        @media(min-width:640px){.article-body h3{font-size:16px;margin:28px 0 10px}}
        @media(min-width:1024px){.article-body h3{font-size:17px;margin:32px 0 10px;scroll-margin-top:84px}}
        .dark .article-body h3{color:#f3f4f6}

        .article-body p{margin-bottom:14px;font-size:14.5px;line-height:1.78}
        @media(min-width:640px){.article-body p{font-size:15px;margin-bottom:16px}}
        .article-body ul,ol{margin:4px 0 16px 18px}
        @media(min-width:640px){.article-body ul,ol{margin:4px 0 18px 22px}}
        .article-body li{font-size:14px;line-height:1.72;margin-bottom:7px}
        @media(min-width:640px){.article-body li{font-size:15px;margin-bottom:8px}}
        .article-body li::marker{color:#F4500A}
        .article-body strong{font-weight:700;color:#0A0F1A}
        .dark .article-body strong{color:#f9fafb}
        .article-body a.al{color:#F4500A;font-weight:600;text-decoration:underline;text-decoration-color:rgba(244,80,10,.3);text-underline-offset:3px;transition:color .2s}
        .article-body a.al:hover{color:#D03D00}

        /* boxes */
        .box{border-radius:10px;padding:16px 18px;margin:18px 0}
        @media(min-width:640px){.box{padding:20px 22px;margin:24px 0}}
        .box-label{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif}
        @media(min-width:640px){.box-label{font-size:11px}}
        .box p{margin:0;font-size:13.5px;line-height:1.72;font-family:'Lora',serif}
        @media(min-width:640px){.box p{font-size:14.5px}}
        .box-blue{background:#EFF6FF;border-left:4px solid #3B82F6}
        .box-blue .box-label{color:#1D4ED8}
        .box-amber{background:#FFFBEB;border-left:4px solid #F59E0B}
        .box-amber .box-label{color:#B45309}
        .box-purple{background:#F5F3FF;border-left:4px solid #8B5CF6}
        .box-purple .box-label{color:#7C3AED}
        .box-teal{background:#F0FDFA;border-left:4px solid #0ABFA4}
        .box-teal .box-label{color:#0D9488}
        .box-green{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px}
        .box-green .box-label{color:#16A34A}
        .box-orange{background:#FFF7ED;border-left:4px solid #F4500A}
        .box-orange .box-label{color:#F4500A}
        .dark .box-blue{background:#0c1e3d;border-color:#1d4ed8}
        .dark .box-amber{background:#1c1507;border-color:#78350f}
        .dark .box-purple{background:#1e1b4b;border-color:#3730a3}
        .dark .box-teal{background:#042f2e;border-color:#134e4a}
        .dark .box-green{background:#052e16;border-color:#166534}
        .dark .box-orange{background:#1c0900;border-color:#9a3412}

        /* steps */
        .steps{display:flex;flex-direction:column;gap:0;margin:16px 0 22px;border-radius:10px;overflow:hidden;border:1px solid #E5E7EB}
        .dark .steps{border-color:#1f2937}
        .step{display:flex;gap:12px;padding:16px 18px;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.step{gap:16px;padding:18px 20px}}
        .dark .step{border-color:#1f2937}
        .step:last-child{border-bottom:none}
        .step-n{flex-shrink:0;width:32px;height:32px;background:#F4500A;color:white;border-radius:50%;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;margin-top:2px}
        @media(min-width:640px){.step-n{width:36px;height:36px;font-size:15px}}
        .step-body h4{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:#0A0F1A;margin-bottom:4px}
        @media(min-width:640px){.step-body h4{font-size:15px}}
        .dark .step-body h4{color:#f9fafb}
        .step-body p{margin:0;font-size:12.5px;color:#64748B;line-height:1.65;font-family:'Sora',sans-serif}
        @media(min-width:640px){.step-body p{font-size:13.5px}}

        /* tables */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.09);margin:18px 0 24px}
        @media(min-width:640px){.tbl-wrap{margin:24px 0 32px}}
        table.dt{width:100%;border-collapse:collapse;font-size:11.5px;font-family:'Sora',sans-serif;min-width:480px}
        @media(min-width:640px){table.dt{font-size:13px;min-width:560px}}
        table.dt thead tr{background:#0A0F1A}
        table.dt th{padding:10px 12px;color:white;font-weight:700;text-align:left;font-size:10.5px;letter-spacing:.2px;white-space:nowrap}
        @media(min-width:640px){table.dt th{padding:13px 16px;font-size:12px}}
        table.dt th.ai-head{background:#F4500A}
        table.dt th.fk-head{background:#0ABFA4}
        table.dt tbody tr{border-bottom:1px solid #E5E7EB;transition:background .15s}
        table.dt tbody tr:nth-child(even) td{background:#F7F8FC}
        table.dt tbody tr:hover td{background:#FFF7ED}
        table.dt td{padding:10px 12px;vertical-align:middle;color:#1E293B;font-size:11.5px}
        @media(min-width:640px){table.dt td{padding:12px 16px;font-size:13px}}
        .dark table.dt td{color:#d1d5db}
        .dark table.dt tbody tr{border-color:#1f2937}
        .dark table.dt tbody tr:nth-child(even) td{background:#0f172a}

        /* FAQ */
        .faq-item{border:1px solid #E5E7EB;border-radius:10px;margin-bottom:8px;overflow:hidden;background:#fff;transition:border-color .2s}
        .dark .faq-item{background:#111827;border-color:#1f2937}
        .faq-item.open{border-color:#F4500A}
        .faq-q{padding:14px 16px;font-size:13px;font-weight:700;color:#0A0F1A;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;user-select:none;font-family:'Sora',sans-serif}
        @media(min-width:640px){.faq-q{padding:16px 20px;font-size:14.5px}}
        .dark .faq-q{color:#f9fafb}
        .faq-q:hover{background:#F5F3FF}
        .dark .faq-q:hover{background:#1f2937}
        .faq-icon{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#EDE9FE;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .2s}
        .faq-icon.open{transform:rotate(45deg);background:#7C3AED;color:white}
        .faq-a{padding:0 16px 14px;font-size:13px;color:#64748B;line-height:1.75;font-family:'Lora',serif}
        @media(min-width:640px){.faq-a{padding:0 20px 16px;font-size:14px}}
        .dark .faq-a{color:#9ca3af}

        /* related */
        .related-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:480px){.related-grid{grid-template-columns:1fr 1fr;gap:14px}}
        @media(min-width:768px){.related-grid{grid-template-columns:repeat(2,1fr);gap:20px}}
        .rel-card{border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s;background:#fff;text-decoration:none;display:block}
        .dark .rel-card{background:#111827;border-color:#1f2937}
        .rel-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);transform:translateY(-2px)}
        .rel-thumb{width:100%;aspect-ratio:2.4/1;overflow:hidden;background:#0A0F1A;display:flex;align-items:center;justify-content:center}
        .rel-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .rel-body{padding:12px}
        @media(min-width:640px){.rel-body{padding:14px}}
        .rel-tag{font-size:10px;font-weight:700;color:#F4500A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-family:'Sora',sans-serif}
        .rel-title{font-size:12px;font-weight:700;color:#0A0F1A;line-height:1.4;font-family:'Sora',sans-serif}
        .dark .rel-title{color:#f9fafb}

        /* TOC links */
        .toc-link{display:block;font-size:11.5px;font-weight:500;color:#64748B;padding:5px 8px;border-radius:6px;cursor:pointer;border:none;background:none;text-align:left;width:100%;transition:all .15s;margin-bottom:2px;line-height:1.4;border-left:2px solid transparent}
        @media(min-width:1024px){.toc-link{font-size:12.5px;padding:6px 10px}}
        .toc-link:hover,.toc-link.active{color:#7C3AED;background:#F5F3FF;border-left-color:#7C3AED}
        .dark .toc-link{color:#9ca3af}
        .dark .toc-link:hover,.dark .toc-link.active{background:#1e1033;color:#a78bfa}

        /* stat strip */
        .stat-strip{display:flex;flex-wrap:wrap;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
        .dark .stat-strip{border-color:#1f2937;background:#111827}
        .stat-item{flex:1;min-width:50%;padding:14px 16px;border-right:1px solid #E5E7EB;text-align:center;border-bottom:1px solid #E5E7EB}
        @media(min-width:640px){.stat-item{min-width:140px;padding:18px 24px;border-bottom:none}}
        .dark .stat-item{border-color:#1f2937}
        .stat-item:last-child{border-right:none}

        /* takeaway */
        .takeaway-box{background:#0A0F1A;border-radius:10px;padding:22px 20px;margin:22px 0}
        @media(min-width:640px){.takeaway-box{padding:28px 30px;margin:28px 0}}
        .takeaway-box h3{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:white;margin:0 0 14px}
        @media(min-width:640px){.takeaway-box h3{font-size:18px;margin:0 0 16px}}
        .takeaway-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
        .takeaway-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#F4500A;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;margin-top:3px}
        @media(min-width:640px){.takeaway-dot{width:18px;height:18px;font-size:10px}}
        .takeaway-text{font-family:'Lora',serif;font-size:13px;color:#CBD5E1;line-height:1.6}
        @media(min-width:640px){.takeaway-text{font-size:14.5px}}

        /* hero image */
        .hero-img-cap{font-family:'Sora',sans-serif;font-size:12px;color:#94A3B8;font-style:italic;text-align:center;margin-bottom:32px;padding:6px 10px}

        /* sidebar */
        .sidebar-cta-title{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:white;margin-bottom:8px;line-height:1.35}
        @media(min-width:1024px){.sidebar-cta-title{font-size:16px}}
        .sidebar-cta-body{font-size:11.5px;color:#94A3B8;margin-bottom:14px;line-height:1.6;font-family:'Sora',sans-serif}

        /* breadcrumb */
        .breadcrumb{background:#F5F8FF;border-bottom:1px solid #E5E7EB;padding:8px 0}
        .breadcrumb-inner{max-width:1240px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:4px;font-size:11.5px;color:#94A3B8;flex-wrap:wrap;font-family:'Sora',sans-serif}
        @media(min-width:640px){.breadcrumb-inner{padding:0 20px;gap:6px;font-size:12.5px}}
        @media(min-width:1024px){.breadcrumb-inner{padding:0 24px}}

        /* hero */
        .article-hero{max-width:1240px;margin:0 auto;padding:28px 16px 0}
        @media(min-width:640px){.article-hero{padding:36px 20px 0}}
        @media(min-width:1024px){.article-hero{padding:48px 24px 0}}

        .final-cta-block { background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%); padding: clamp(48px,8vw,40px) 20px; text-align:center; margin:60px 0 0; }
      `}</style>

      <div className="read-progress" style={{ width: `${scrollPct}%` }} />

      {/* ═══ NAV ══════════════════════════════════════════════════════════════ */}
      <MarketingHeader />

      {/* BREADCRUMB */}
      <div
        className="breadcrumb"
        style={{
          marginTop: 80,
          background: resolvedTheme === "dark" ? "#0f172a" : "#F5F8FF",
          borderBottom:
            resolvedTheme === "dark"
              ? "1px solid #1e293b"
              : "1px solid #E5E7EB",
          padding: "8px 0",
        }}
      >
        <div
          className="breadcrumb-inner"
          style={{ color: resolvedTheme === "dark" ? "#94a3b8" : "#94A3B8" }}
        >
          <Link
            href="/"
            style={{
              color: resolvedTheme === "dark" ? "#cbd5e1" : "#64748B",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Home
          </Link>
          <span
            style={{ color: resolvedTheme === "dark" ? "#475569" : "#cbd5e1" }}
          >
            ›
          </span>
          <Link
            href="/resources/expert-blog"
            style={{
              color: resolvedTheme === "dark" ? "#cbd5e1" : "#64748B",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Blog
          </Link>
          <span
            style={{ color: resolvedTheme === "dark" ? "#475569" : "#cbd5e1" }}
          >
            ›
          </span>
          <span
            style={{ color: resolvedTheme === "dark" ? "#64748b" : "#94A3B8" }}
          >
            Competitor Undercutting Your Amazon India Price
          </span>
        </div>
      </div>

      {/* HERO SECTION - REVISED TO MATCH IMAGE */}
      <div
        style={{
          background: resolvedTheme === "dark" ? "#0f1120" : "#F1F2FF",
          padding: "48px 0",
          borderBottom:
            resolvedTheme === "dark"
              ? "1px solid #1f2937"
              : "1px solid #E2E8F0",
        }}
      >
        <div
          style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }}
          className="w-full"
        >
          <div className="w-full">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: resolvedTheme === "dark" ? "#1e1b4b" : "#E0E2FF",
                color: resolvedTheme === "dark" ? "#818cf8" : "#6366F1",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 20,
                marginBottom: 20,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              <span style={{ marginRight: 8, color: "#6366F1" }}>●</span>{" "}
              PRICING INTELLIGENCE
            </div>

            <h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "clamp(28px, 4.5vw, 48px)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: resolvedTheme === "dark" ? "white" : "#111827",
                letterSpacing: "-1px",
                marginBottom: 20,
              }}
            >
              How to Detect{" "}
              <span style={{ color: "#6366F1" }}>
                Competitor Price <br />
                Undercutting{" "}
              </span>{" "}
              on Amazon India
            </h1>

            <p
              style={{
                fontFamily: "'Lora',serif",
                fontSize: "clamp(14px,2vw,17px)",
                color: "#475569",
                lineHeight: 1.65,
                maxWidth: 760,
                marginBottom: 16,
              }}
              className="dark:text-gray-400"
            >
              A competitor can drop their price in the middle of the night, and
              you won't know until your Buy Box is gone and sales have already
              dipped. This guide covers how undercutting actually happens on
              Amazon India, how to catch it within minutes instead of hours, and
              exactly how to respond when it does.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap" as const,
                gap: "4px 14px",
                marginBottom: 20,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                👤{" "}
                <strong
                  className="text-[#0A0F1A] hover:text-orange-500 transition-colors cursor-pointer"
                  onClick={() => router.push("/author/vikrant-singh")}
                >
                  Vikrant Singh
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                🕐 May 2026
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "clamp(11px,2vw,13px)",
                  color: "#64748B",
                }}
              >
                📖 <strong>11 min read</strong>
              </div>
              <span
                style={{
                  background: "rgba(244,80,10,.12)",
                  color: "#F4500A",
                  fontSize: "clamp(9px,2vw,11px)",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                Updated for 2026
              </span>
              <span
                style={{
                  background: "rgba(10,191,164,.12)",
                  color: "#0ABFA4",
                  fontSize: "clamp(9px,2vw,11px)",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                Competitor Intelligence
              </span>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm w-full">
              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">
                  &lt;1 hr
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  target response window — after that, Buy Box loss compounds
                  into a ranking drop
                </div>
              </div>

              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 xl:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">
                  Minutes
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  for Amazon's Buy Box algorithm to respond to a competitor's
                  price change
                </div>
              </div>

              <div className="p-4 sm:p-5 text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">
                  50×/day
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  the average Indian seller checks WhatsApp — which is why
                  WhatsApp alerts beat email
                </div>
              </div>

              <div className="p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#F97316] mb-1 sm:mb-2">
                  ₹ 649
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  revenue lost per hour of Buy Box gap on a ₹799 product at 20
                  orders/day
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="my-10"
        style={{ maxWidth: 1240, margin: "20px auto 0", padding: "0 16px" }}
      >
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img
            src="/Detect Competitor Price Undercutting on Amazon India.png"
            alt="Amazon Sales Drop"
            className="w-full h-auto block"
          />
        </div>
        <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
          The 10-hour Buy Box gap — what happens between 11pm when a competitor
          drops price and 9am when most sellers find out. With Insydz, the alert
          fires at 11:01pm.
        </p>
      </div>

      {/* QUICK SUMMARY & TAKEAWAYS - MATCHING IMAGE */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        {/* Quick Answer Box */}
        <div
          style={{
            background: resolvedTheme === "dark" ? "#111827" : "#F8F9FF",
            borderLeft: "4px solid #6366F1",
            borderRadius: 8,
            padding: "24px 32px",
            marginBottom: 40,
          }}
          className="dark:border-indigo-500"
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#6366F1",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            QUICK ANSWER
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: resolvedTheme === "dark" ? "#d1d5db" : "#4B5563",
              lineHeight: 1.65,
              fontFamily: "'Lora', serif",
            }}
          >
            To know instantly if a competitor undercut you: search your main
            keyword in a private browser window and check who holds the Buy Box.
            If it is not you, they already undercut you. To catch this before it
            costs you hours of sales, use Insydz — it monitors your ASIN's
            competitor prices continuously and sends a WhatsApp alert within 1
            hour of any price change, with the gap amount and your current Buy
            Box status.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div
          id="guide-covers"
          style={{
            background: "#0F172A",
            borderRadius: 24,
            padding: "40px",
            marginBottom: 20,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "white",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <span style={{ fontSize: 24 }}>📋</span> Key Takeaways
          </h3>

          <div className="space-y-6">
            {[
              "Amazon's Buy Box algorithm responds within minutes of a competitor price change — not hours. Every hour of delay costs you measurable revenue.",
              "The seller who wins the Buy Box is not always the cheapest. It is the seller who responds first with a considered pricing decision.",
              "Manual checking in Seller Central is free but slow — you find out hours after the damage is done.",
              "Indian sellers check WhatsApp more than 50 times a day. A WhatsApp alert from Insydz arrives faster than you would ever check your email.",
              "Always set a price floor before you start monitoring. Alerts without a floor lead to blind matching and margin destruction.",
            ].map((text, i) => (
              <div key={i} className="flex gap-4">
                <div
                  style={{
                    background: "#6366F1",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "#94A3B8",
                    lineHeight: 1.6,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">
        {/* SIDEBAR */}
        <aside
          className="toc-sidebar"
          style={{
            background: resolvedTheme === "dark" ? "#111827" : "#fff",
            borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
          }}
        >
          <h4
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
              marginBottom: "16px",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Table of Contents
          </h4>
          <ul
            className="space-y-1"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {TOC.map((t) => (
              <li key={t.id}>
                <button
                  className={`toc-link${activeSection === t.id ? " active" : ""}`}
                  onClick={() => go(t.id)}
                  style={{
                    color:
                      activeSection === t.id
                        ? "#7C3AED"
                        : resolvedTheme === "dark"
                          ? "#94a3b8"
                          : "#64748B",
                    background:
                      activeSection === t.id
                        ? resolvedTheme === "dark"
                          ? "#1e1033"
                          : "#F5F3FF"
                        : "transparent",
                    borderLeft:
                      activeSection === t.id
                        ? "2px solid #7C3AED"
                        : "2px solid transparent",
                  }}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth: 0 }}>
          <button
            className="mobile-toc-btn"
            onClick={() => setTocOpen(!tocOpen)}
            style={{
              background: resolvedTheme === "dark" ? "#111827" : "#fff",
              color: resolvedTheme === "dark" ? "#f9fafb" : "#111",
              borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
            }}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div
            className={`mobile-toc-panel${tocOpen ? " open" : ""}`}
            style={{
              background: resolvedTheme === "dark" ? "#111827" : "#fff",
              borderColor: resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
            }}
          >
            {TOC.map((t) => (
              <button
                key={t.id}
                className="toc-link"
                style={{ display: "block", marginBottom: 3 }}
                onClick={() => go(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className="article-body">
            <h2
              id="what-is-private-label"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "0 0 28px",
              }}
            >
              Why Does Competitor Undercutting Happen Silently on Amazon India?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              Amazon India does not send you a notification when a competitor
              drops their price below yours. There is no alert in Seller
              Central, no email, no SMS. The price change happens, the Buy Box
              switches within minutes, and your orders stop arriving — and you
              are the last to know.
            </p>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              This is not a bug — it is how Amazon's marketplace is designed.
              Amazon rewards competitive pricing automatically. The platform has
              no incentive to tell you when you have been undercut; it already
              redirected the traffic to the cheaper seller.
            </p>

            <div
              className="box box-purple"
              style={{
                background: resolvedTheme === "dark" ? "#1e1b4b" : "#F5F3FF",
                borderLeft: "6px solid #8B5CF6",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(139,92,246,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#7C3AED",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚠️ The Silence Is the Problem
              </div>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                A competitor in Surat listed the same steel tiffin box at ₹649
                while yours sat at ₹699 — Amazon switched the Buy Box within 4
                minutes, at 11:47pm Tuesday. You found out at 8:30am Wednesday.
                Eight hours of Buy Box gone, no warning, no way to recover those
                sales.
              </p>
            </div>

            <p
              style={{
                margin: "0 0 16px",
                fontSize: 15.5,
                color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                lineHeight: 1.75,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              The result is that most Amazon India sellers are reactive by
              design. They check prices when they remember to, not when it
              matters. By the time they trace a drop in orders back to a
              competitor price change, the ranking damage has already started
              and sessions are already falling.
            </p>

            <h2
              id="product-selection"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              How Do You Check Manually If You Are Being Undercut?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              You have two manual options. Neither is fast enough to prevent
              damage, but they are free and they confirm what is happening.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Method 1: Check the Buy Box directly</strong> <br />
              Open Amazon India in a private browser window (so you are not
              logged in as a seller) and search your main keyword. Find your
              listing and look at the right side of the product page —
              specifically who is listed as the seller in the Buy Box. If it is
              not your seller name, a competitor has undercut you and Amazon has
              already given them the Buy Box.
            </p>
            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px",
                fontFamily: "'Lora', serif",
              }}
            >
              <strong>Method 2: Check in Seller Central</strong> <br />
              Go to Manage Inventory in Seller Central and look at the Buy Box
              percentage column for your ASIN. If it has dropped from near 100%
              to below 50%, a competitor is sharing or taking the Buy Box. Click
              the ASIN and go to the pricing tab to see all competing offers
              ranked by price.
            </p>
            <div
              className="box box-purple"
              style={{
                background:
                  resolvedTheme === "dark" ? "#4b421bff" : "#faf1ccff",
                borderLeft: "6px solid #ce9907ff",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(139,92,246,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#e2b22dff",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚠️ Why Manual Checking Is Not Enough
              </div>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Even if you check every morning, you have a 10 to 12 hour
                overnight blind spot. And checking 10 or more ASINs manually
                each morning is 30 to 45 minutes of work before you have done
                anything else. At scale, manual checking is not a strategy — it
                is a hope.
              </p>
            </div>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/image1_competitor-undercutting-amazon-india.png"
                  alt="Amazon Sales Drop"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                The Buy Box cascade Amazon's algorithm switches within 4 minutes
                of a competitor price drop, triggering a chain of ranking and
                revenue damage that compounds every hour without a response.
              </p>
            </div>

            <div className="space-y-3 mb-8 font-sans">
              <h2
                id="common-pitfalls"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "clamp(22px, 3vw, 28px)",
                  fontWeight: 900,
                  color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                  lineHeight: 1.2,
                  letterSpacing: "-0.5px",
                  paddingBottom: "16px",
                  borderBottom:
                    resolvedTheme === "dark"
                      ? "1px solid #1f2937"
                      : "1px solid #E5E7EB",
                  margin: "40px 0 28px",
                }}
              >
                What Does It Actually Cost You to Find Out 10 Hours Late?
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                The cost of delayed awareness is not hypothetical. You can
                calculate it precisely, and the number is large enough to
                justify automated monitoring many times over.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 font-sans">
                <div className="rounded-xl border border-[#F9C8C8] dark:border-red-900/50 bg-[#FEF4F4] dark:bg-red-950/20 p-6 flex flex-col items-center text-center">
                  <div
                    className="text-[32px] md:text-[38px] font-black text-[#CC292B] dark:text-red-500 mb-2"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      letterSpacing: "-1px",
                    }}
                  >
                    ₹649
                  </div>
                  <div className="text-[14px] text-[#546E7A] dark:text-gray-400 leading-snug">
                    lost revenue per hour on a ₹799 ASIN at 20 orders/day with
                    no Buy Box
                  </div>
                </div>

                <div className="rounded-xl border border-[#FDE38C] dark:border-amber-900/50 bg-[#FFF9E6] dark:bg-amber-950/20 p-6 flex flex-col items-center text-center">
                  <div
                    className="text-[32px] md:text-[38px] font-black text-[#E67E22] dark:text-amber-500 mb-2"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      letterSpacing: "-1px",
                    }}
                  >
                    ₹6,490
                  </div>
                  <div className="text-[14px] text-[#546E7A] dark:text-gray-400 leading-snug">
                    lost in a 10-hour overnight gap — before you even open
                    Seller Central in the morning
                  </div>
                </div>

                <div className="rounded-xl border border-[#BBE5C7] dark:border-emerald-900/50 bg-[#F1FAF4] dark:bg-emerald-950/20 p-6 flex flex-col items-center text-center">
                  <div
                    className="text-[32px] md:text-[38px] font-black text-[#1B9945] dark:text-emerald-500 mb-2"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      letterSpacing: "-1px",
                    }}
                  >
                    ₹2,499
                  </div>
                  <div className="text-[14px] text-[#546E7A] dark:text-gray-400 leading-snug">
                    monthly cost of Insydz — less than the revenue lost in 4
                    hours without an alert
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-tight m-0 mt-0.5">
                That ₹6,490 overnight figure assumes 20 orders a day at ₹799 —
                which is a conservative number for any seller doing ₹5L to ₹30L
                a month. For a seller with 50 orders a day, the overnight gap is
                closer to ₹16,000. And that does not account for the ranking
                damage that takes days to repair after a prolonged Buy Box
                absence.
              </p>
            </div>

            <div
              className="box box-purple"
              style={{
                background:
                  resolvedTheme === "dark" ? "#4b421bff" : "#f7f2cdff",
                borderLeft: "6px solid #ce9907ff",
                borderRadius: 20,
                padding: "32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.3)"
                    : "0 10px 30px rgba(139,92,246,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#e2b22dff",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 18,
                  fontFamily: "'Sora',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                💡 The Real Cost Is Not Just Lost Revenue
              </div>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 15.5,
                  color: resolvedTheme === "dark" ? "#cbd5e1" : "#4B5563",
                  lineHeight: 1.75,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Every hour without the Buy Box reduces your sales velocity, and
                Amazon interprets lower velocity as lower demand. This pushes
                keyword rankings down — usually within 6 to 12 hours of
                sustained Buy Box absence. The overnight undercut that cost
                ₹6,490 in direct revenue can cost another ₹10,000 to ₹15,000 in
                Sponsored Products spend to repair the ranking damage.
              </p>
            </div>

            <h2
              id="prevent-drops"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "48px 0 24px",
              }}
            >
              How Do You Set Up Real-Time Competitor Price Alerts for Amazon
              India?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              The only way to catch a price undercut before it costs you hours
              of Buy Box is automated monitoring with an instant alert. Here is
              how to set it up correctly.
            </p>

            <div className="space-y-4 mb-10">
              {[
                {
                  n: 1,
                  t: "Connect your ASINs to Insydz",
                  d: "Add each active ASIN to your Insydz tracking dashboard. Insydz pulls all competitor offers for each ASIN automatically — no manual competitor selection needed.",
                },
                {
                  n: 2,
                  t: "Set your alert threshold per ASIN",
                  d: "Choose the gap that triggers an alert. A ₹20 gap on a ₹399 product (5%) matters — a ₹20 gap on a ₹1,999 product (1%) usually does not. Set thresholds that match your category's price sensitivity rather than a blanket number across all ASINs.",
                },
                {
                  n: 3,
                  t: "Enable WhatsApp alerts",
                  d: "In Insydz notification settings, connect your WhatsApp number. Every alert arrives with the competitor's old price, their new price, your current price, the gap in rupees, and your current Buy Box percentage — everything you need to make a decision in under a minute.",
                },
                {
                  n: 4,
                  t: "Set your price floor before the first alert fires",
                  d: "Decide the minimum price at which you still make an acceptable margin — typically 20 to 25 percent net after COGS, Amazon commission, FBA fees, and ad spend. Write this number down for each ASIN. When an alert arrives, you already know your answer before you check the gap.",
                },
                {
                  n: 5,
                  t: "Test with one ASIN first",
                  d: "Run it for one week on your highest volume ASIN. See how many alerts you get, whether the thresholds are calibrated right, and how fast you can respond from the WhatsApp message. Then expand to all active ASINs.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: resolvedTheme === "dark" ? "#111827" : "white",
                    border:
                      resolvedTheme === "dark"
                        ? "1px solid #1f2937"
                        : "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "24px",
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    boxShadow:
                      resolvedTheme === "dark"
                        ? "none"
                        : "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      background: "#F97316",
                      color: "white",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      flexShrink: 0,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 15,
                        fontWeight: 800,
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {s.t}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: resolvedTheme === "dark" ? "#94a3b8" : "#64748B",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#0A1524",
                borderRadius: 12,
                padding: "clamp(24px,5vw,32px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3
                  style={{
                    color: "white",
                    fontSize: "clamp(18px,3vw,22px)",
                    fontWeight: 800,
                    marginBottom: 12,
                    fontFamily: "'Sora',sans-serif",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Insydz sends a WhatsApp alert within 1 hour of any competitor
                  price drop
                </h3>
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 15,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Try it free — connect your first ASIN and set your first alert
                  in under 5 minutes.
                </p>
              </div>
              <Link
                href="/login"
                style={{
                  background: "#F4500A",
                  color: "white",
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
                Try Free on Insydz →
              </Link>
            </div>

            <h2
              id="causes-fixes"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              When You Get the Alert — How Should You Respond?
            </h2>

            <p
              style={{
                color: resolvedTheme === "dark" ? "#94a3b8" : "#4B5563",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "32px",
                fontFamily: "'Lora', serif",
              }}
            >
              Speed matters, but the response has to be considered. The sellers
              who win the Buy Box back fastest are not the ones who immediately
              match price — they are the ones who already know their price floor
              and can make the decision in under a minute.
            </p>

            <div
              className="tbl-wrap"
              style={{
                marginBottom: 48,
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 16,
                overflowX: "auto" as const,
                overflowY: "hidden" as const,
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
              }}
            >
              <table
                className="dt"
                style={{
                  width: "100%",
                  minWidth: "820px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background:
                      resolvedTheme === "dark" ? "#1e293b" : "#0F172A",
                    color: "white",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "18px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Scenario
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Gap Size
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Your Margin Floor
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Right Response
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        fontSize: 13,
                        textAlign: "center",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Time to Act
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      scenario: "Competitor drops ₹30 below you",
                      gap: "₹30 (small)",
                      floor: "Matching still above floor",
                      response: "Match immediately",
                      time: "Within 15 min",
                      timeColor: "green",
                      alert: true,
                    },
                    {
                      scenario: "Competitor drops ₹100 below you",
                      gap: "₹100 (large)",
                      floor: "Matching is above floor",
                      response:
                        "Match — but check if they are a reseller first",
                      time: "Within 30 min",
                      timeColor: "green",
                      alert: false,
                    },
                    {
                      scenario: "Competitor drops below your floor",
                      gap: "Any",
                      floor: "Matching breaches floor",
                      response: "Hold price — improve listing quality instead",
                      time: "Within 1 hr — update listing",
                      timeColor: "yellow",
                      alert: true,
                    },
                    {
                      scenario: "Unverified reseller undercuts",
                      gap: "Any",
                      floor: "Any",
                      response:
                        "Do not match — their offer is unreliable; report if fake",
                      time: "Monitor — no price change",
                      timeColor: "gray",
                      alert: false,
                    },
                    {
                      scenario: "Multiple competitors drop simultaneously",
                      gap: "Category shift",
                      floor: "Any",
                      response:
                        "Check if a sale event triggered the category move",
                      time: "Assess before acting",
                      timeColor: "yellow",
                      alert: true,
                    },
                  ].map((row, i) => {
                    let timeBg = "";
                    let timeText = "";

                    if (row.timeColor === "green") {
                      timeBg = resolvedTheme === "dark" ? "#064e3b" : "#DCFCE7";
                      timeText =
                        resolvedTheme === "dark" ? "#34D399" : "#059669";
                    } else if (row.timeColor === "yellow") {
                      timeBg = resolvedTheme === "dark" ? "#422006" : "#FEF3C7";
                      timeText =
                        resolvedTheme === "dark" ? "#FBBF24" : "#B45309";
                    } else if (row.timeColor === "gray") {
                      timeBg = resolvedTheme === "dark" ? "#374151" : "#F1F5F9";
                      timeText =
                        resolvedTheme === "dark" ? "#CBD5E1" : "#475569";
                    }

                    return (
                      <tr
                        key={i}
                        style={{
                          background:
                            i % 2 === 0
                              ? resolvedTheme === "dark"
                                ? "transparent"
                                : "#F8F5F0"
                              : resolvedTheme === "dark"
                                ? "#1e293b50"
                                : "#FFFFFF",
                          borderBottom:
                            resolvedTheme === "dark"
                              ? "1px solid #1f2937"
                              : "1px solid #E5E7EB",
                        }}
                      >
                        <td
                          style={{
                            padding: "22px 20px",
                            fontWeight: 700,
                            fontSize: 14,
                            lineHeight: 1.6,
                            fontFamily: "'Sora', sans-serif",
                            color: row.alert
                              ? "#F97316"
                              : resolvedTheme === "dark"
                                ? "#F9FAFB"
                                : "#374151",
                            borderLeft: row.alert
                              ? "3px solid #F97316"
                              : "3px solid transparent",
                          }}
                        >
                          {row.scenario}
                        </td>

                        <td
                          style={{
                            padding: "22px 20px",
                            color:
                              resolvedTheme === "dark" ? "#CBD5E1" : "#334155",
                            fontSize: 14,
                            lineHeight: 1.8,
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {row.gap}
                        </td>

                        <td
                          style={{
                            padding: "22px 20px",
                            color:
                              resolvedTheme === "dark" ? "#CBD5E1" : "#334155",
                            fontSize: 14,
                            lineHeight: 1.8,
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {row.floor}
                        </td>

                        <td
                          style={{
                            padding: "22px 20px",
                            color:
                              resolvedTheme === "dark" ? "#CBD5E1" : "#334155",
                            fontSize: 14,
                            lineHeight: 1.8,
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {row.response}
                        </td>

                        <td
                          style={{
                            padding: "22px 20px",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              background: timeBg,
                              color: timeText,
                              padding: "10px 16px",
                              borderRadius: "999px",
                              fontSize: 12,
                              fontWeight: 700,
                              lineHeight: 1.4,
                              display: "inline-block",
                              maxWidth: "150px",
                              fontFamily: "'Sora', sans-serif",
                            }}
                          >
                            {row.time}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3 Options Callout */}
            <div
              style={{
                background: resolvedTheme === "dark" ? "#0f1f2e" : "#F0FAFA",
                borderLeft: "5px solid #0D9488",
                borderRadius: 12,
                padding: "28px 32px",
                margin: "40px 0",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "none"
                    : "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#0D9488",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1.2,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: "#0D9488",
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  ✓
                </span>
                THE 3 OPTIONS — NOT JUST MATCH OR IGNORE
              </div>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 20,
                }}
              >
                <li
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      color: "#0D9488",
                      fontSize: 20,
                      lineHeight: 1,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    •
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      color: resolvedTheme === "dark" ? "#cbd5e1" : "#334155",
                      lineHeight: 1.75,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    <strong
                      style={{
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#0F172A",
                      }}
                    >
                      Match their price:
                    </strong>{" "}
                    fastest way to recover the Buy Box. Works when the gap is
                    within your margin floor and the competitor is legitimate.
                    Do this within 15 minutes for maximum recovery.
                  </p>
                </li>
                <li
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      color: "#0D9488",
                      fontSize: 20,
                      lineHeight: 1,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    •
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      color: resolvedTheme === "dark" ? "#cbd5e1" : "#334155",
                      lineHeight: 1.75,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    <strong
                      style={{
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#0F172A",
                      }}
                    >
                      Beat their price by ₹1:
                    </strong>{" "}
                    takes the Buy Box decisively if they matched your old price
                    rather than undercutting by a large amount. Use this when
                    you need to break a Buy Box tie.
                  </p>
                </li>
                <li
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      color: "#0D9488",
                      fontSize: 20,
                      lineHeight: 1,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    •
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      color: resolvedTheme === "dark" ? "#cbd5e1" : "#334155",
                      lineHeight: 1.75,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    <strong
                      style={{
                        color: resolvedTheme === "dark" ? "#f9fafb" : "#0F172A",
                      }}
                    >
                      Hold your price:
                    </strong>{" "}
                    the right call when matching would breach your floor. Focus
                    on listing quality — better images, more reviews, stronger
                    A+ Content — so buyers choose you despite the gap. A
                    4.6-star listing with better images regularly wins over a
                    cheaper 4.1-star competitor.
                  </p>
                </li>
              </ul>
            </div>

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img
                  src="/image2_competitor-undercutting-amazon-india.png"
                  alt="Amazon Sales Drop"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                Price floor model for a ₹799 Amazon India ASIN the floor at 20%
                minimum net margin is ₹513, which means any competitor price
                above that is safe to match. Below it, hold and compete on
                listing quality.
              </p>
            </div>

            <h2
              id="temporary-or-structural"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "48px 0 24px",
              }}
            >
              Insydz vs Manual Checking vs Other Tools — How Do They Compare?
            </h2>

            <div
              className="tbl-wrap"
              style={{
                marginBottom: 48,
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 16,
                overflow: "hidden",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
              }}
            >
              <table
                className="dt"
                style={{
                  width: "100%",
                  minWidth: "1000px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background:
                      resolvedTheme === "dark" ? "#1e293b" : "#0F172A",
                    color: "white",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Feature
                    </th>

                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                        background: "#C96515",
                      }}
                    >
                      Insydz
                    </th>

                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Manual (Seller Central)
                    </th>

                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Helium 10
                    </th>

                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Jungle Scout
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      feature: "Real-time competitor price alerts",
                      insydz: "✓ Within 1 hour",
                      manual: "No — manual check",
                      helium: "Limited",
                      jungle: "No",
                      insydzColor: "green",
                      manualColor: "red",
                      heliumColor: "yellow",
                      jungleColor: "red",
                      alert: true,
                    },
                    {
                      feature: "WhatsApp alert delivery",
                      insydz: "✓ Yes",
                      manual: "No",
                      helium: "No",
                      jungle: "No",
                      insydzColor: "green",
                      manualColor: "red",
                      heliumColor: "red",
                      jungleColor: "red",
                      alert: false,
                    },
                    {
                      feature: "Amazon India + Flipkart tracking",
                      insydz: "✓ Both",
                      manual: "Amazon only",
                      helium: "Amazon only",
                      jungle: "US focused",
                      insydzColor: "green",
                      manualColor: "yellow",
                      heliumColor: "yellow",
                      jungleColor: "red",
                      alert: true,
                    },
                    {
                      feature: "Buy Box status monitoring",
                      insydz: "✓ Real time",
                      manual: "Delayed",
                      helium: "Limited",
                      jungle: "No",
                      insydzColor: "green",
                      manualColor: "yellow",
                      heliumColor: "yellow",
                      jungleColor: "red",
                      alert: false,
                    },
                    {
                      feature: "Price floor alert configuration",
                      insydz: "✓ Per ASIN",
                      manual: "No",
                      helium: "No",
                      jungle: "No",
                      insydzColor: "green",
                      manualColor: "red",
                      heliumColor: "red",
                      jungleColor: "red",
                      alert: true,
                    },
                    {
                      feature: "India first pricing",
                      insydz: "Free / ₹2,499",
                      manual: "Free",
                      helium: "₹7,000+/mo",
                      jungle: "₹5,500+/mo",
                      insydzColor: "green",
                      manualColor: "green",
                      heliumColor: "red",
                      jungleColor: "red",
                      alert: false,
                    },
                  ].map((row, i) => {
                    const getBadgeColors = (color: string) => {
                      if (color === "green") {
                        return {
                          bg: resolvedTheme === "dark" ? "#064e3b" : "#dcfce7",
                          text:
                            resolvedTheme === "dark" ? "#34d399" : "#059669",
                        };
                      }

                      if (color === "yellow") {
                        return {
                          bg: resolvedTheme === "dark" ? "#422006" : "#fef3c7",
                          text:
                            resolvedTheme === "dark" ? "#fbbf24" : "#b45309",
                        };
                      }

                      return {
                        bg: resolvedTheme === "dark" ? "#450a0a" : "#fee2e2",
                        text: resolvedTheme === "dark" ? "#f87171" : "#dc2626",
                      };
                    };

                    const insydzBadge = getBadgeColors(row.insydzColor);
                    const manualBadge = getBadgeColors(row.manualColor);
                    const heliumBadge = getBadgeColors(row.heliumColor);
                    const jungleBadge = getBadgeColors(row.jungleColor);

                    return (
                      <tr
                        key={i}
                        style={{
                          background:
                            i % 2 === 0
                              ? resolvedTheme === "dark"
                                ? "transparent"
                                : "#F8F5F0"
                              : resolvedTheme === "dark"
                                ? "#1e293b50"
                                : "#F1F5F9",
                          borderBottom:
                            resolvedTheme === "dark"
                              ? "1px solid #1f2937"
                              : "1px solid #E5E7EB",
                        }}
                      >
                        <td
                          style={{
                            padding: "18px 20px",
                            fontWeight: 700,
                            color: row.alert
                              ? "#F97316"
                              : resolvedTheme === "dark"
                                ? "#f9fafb"
                                : "#334155",
                            fontSize: 14,
                            lineHeight: 1.7,
                            fontFamily: "'Sora', sans-serif",
                            borderLeft: row.alert
                              ? "3px solid #F97316"
                              : "3px solid transparent",
                          }}
                        >
                          {row.feature}
                        </td>

                        <td style={{ padding: "18px 20px" }}>
                          <span
                            style={{
                              background: insydzBadge.bg,
                              color: insydzBadge.text,
                              padding: "8px 14px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 700,
                              display: "inline-block",
                              fontFamily: "'Sora', sans-serif",
                            }}
                          >
                            {row.insydz}
                          </span>
                        </td>

                        <td style={{ padding: "18px 20px" }}>
                          <span
                            style={{
                              background: manualBadge.bg,
                              color: manualBadge.text,
                              padding: "8px 14px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 700,
                              display: "inline-block",
                              fontFamily: "'Sora', sans-serif",
                            }}
                          >
                            {row.manual}
                          </span>
                        </td>

                        <td style={{ padding: "18px 20px" }}>
                          <span
                            style={{
                              background: heliumBadge.bg,
                              color: heliumBadge.text,
                              padding: "8px 14px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 700,
                              display: "inline-block",
                              fontFamily: "'Sora', sans-serif",
                            }}
                          >
                            {row.helium}
                          </span>
                        </td>

                        <td style={{ padding: "18px 20px" }}>
                          <span
                            style={{
                              background: jungleBadge.bg,
                              color: jungleBadge.text,
                              padding: "8px 14px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 700,
                              display: "inline-block",
                              fontFamily: "'Sora', sans-serif",
                            }}
                          >
                            {row.jungle}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h2
              id="faq"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 900,
                color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                paddingBottom: "16px",
                borderBottom:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
                margin: "40px 0 28px",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div
                  key={i}
                  className="faq-item"
                  style={{
                    background: resolvedTheme === "dark" ? "#111827" : "#fff",
                    borderColor:
                      resolvedTheme === "dark" ? "#1f2937" : "#E5E7EB",
                  }}
                >
                  <div
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      color: resolvedTheme === "dark" ? "#f9fafb" : "#0A0F1A",
                      background:
                        openFaq === i
                          ? resolvedTheme === "dark"
                            ? "#1e293b"
                            : "#F8FAFC"
                          : "transparent",
                    }}
                  >
                    {f.q}
                    <span className={`faq-icon${openFaq === i ? " open" : ""}`}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </div>
                  {openFaq === i && (
                    <div
                      className="faq-a"
                      style={{
                        color: resolvedTheme === "dark" ? "#9ca3af" : "#64748B",
                      }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* More Marketplace Playbooks */}
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
                More Marketplace Playbooks
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 24,
                }}
              >
                {[
                  {
                    tag: "REVIEW STRATEGY",
                    tagColor: "#059669",
                    title: "Amazon Vine India 2026: Cost, Worth & How to Enrol",
                    route:
                      "/resources/expert-blog/amazon-vine-program-india-2026",
                    image: "/Amazon-Vine-India-image1.png",
                  },
                  {
                    tag: "SEO STRATEGY",
                    tagColor: "#3B82F6",
                    title:
                      "Amazon India Keyword Ranking: How to Track and Improve in 2026",
                    route:
                      "/resources/expert-blog/how-to-rank-page-1-amazon-india",
                    image: "/twenty three.png",
                  },
                  {
                    tag: "REVIEW INTELLIGENCE",
                    tagColor: "#DC2626",
                    title:
                      "AI Review Analysis Tool for Amazon India & Flipkart: Complete Guide",
                    route:
                      "/resources/expert-blog/amazon-review-analysis-guide-india",
                    image: "/01_hero_review_intelligence_banner.png",
                  },
                ].map((card, i) => (
                  <Link
                    key={i}
                    href={card.route}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        background:
                          resolvedTheme === "dark" ? "#111827" : "white",
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
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 32px rgba(0,0,0,0.1)";
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
                          background:
                            resolvedTheme === "dark" ? "#1e293b" : "#f8fafc",
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                      <div style={{ padding: "20px 22px 24px" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: card.tagColor,
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
                            color:
                              resolvedTheme === "dark" ? "#f9fafb" : "#111827",
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
          </article>
        </main>
      </div>

      {/* Final CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
          padding: "clamp(48px,8vw,80px) 20px",
          textAlign: "center",
          margin: "60px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(28px, 4.5vw, 42px)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              marginBottom: 20,
            }}
          >
            Your Competitor Dropped Their Price Last Night. Do You Know?
          </h2>

          <p
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "#94a3b8",
              lineHeight: 1.6,
              maxWidth: 640,
              margin: "0 auto 36px",
            }}
          >
            Insydz monitors your Amazon India listings continuously and sends a
            WhatsApp alert the moment a competitor changes their price — so you
            respond in minutes, not hours.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px 28px",
              marginBottom: 40,
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
            }}
          >
            {[
              "WhatsApp alerts within 1 hour",
              "Amazon India + Flipkart",
              "Buy Box status monitoring",
              "Free to start",
            ].map((f, i) => (
              <span
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ color: "#F97316", fontWeight: 900 }}>✓</span> {f}
              </span>
            ))}
          </div>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "#F97316",
              color: "white",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(14px, 1.5vw, 16px)",
              padding: "16px 40px",
              borderRadius: 8,
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(249,115,22,0.2)",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = "#EA580C";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#F97316";
            }}
          >
            Set Up Your First Alert Free on Insydz &rarr;
          </Link>

          <p
            style={{
              marginTop: 24,
              fontSize: 14,
              color: "#94a3b8",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
            }}
          >
            5,000+ Indian sellers &middot; 2.5 Lakh+ reviews analysed &middot;
            24/7 live market data
          </p>
        </div>
      </div>
    </div>
  );
}
