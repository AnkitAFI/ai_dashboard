"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { useTheme } from "next-themes";
import KeyTakeawaysBox from "../components/KeyTakeawaysBox";
import InfoBanner from "../components/InfoBanner";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";

export const dynamic = "force-static";

// ── Schema ─────────────────────────────────────────────────────────────────────
const schemaPrivateLabel = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://insydz.com/#organization",
      "name": "Insydz",
      "url": "https://insydz.com",
      "logo": { "@type": "ImageObject", "url": "https://insydz.com/logo.png" },
      "sameAs": [
        "https://www.instagram.com/growwithinsydz",
        "https://www.linkedin.com/company/insydz/",
        "https://www.facebook.com/profile.php?id=61586202582209",
        "https://x.com/growwithinsydz"
      ],
      "description": "AI-powered ecommerce analytics platform for Amazon and Flipkart sellers."
    },
    {
      "@type": "WebPage",
      "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      "url": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india",
      "name": "Competitor Undercutting Your Amazon India Price",
      "description": "A competitor cut your Amazon India price by ₹200 and you lost 90% of sales overnight. Here is how to detect undercutting within 1 hour and respond before your listing collapses.",
      "isPartOf": { "@type": "WebSite", "name": "Insydz", "url": "https://insydz.com" },
      "breadcrumb": { "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",         "item": "https://insydz.com" },
        { "@type": "ListItem", "position": 2, "name": "Resources",    "item": "https://insydz.com/resources" },
        { "@type": "ListItem", "position": 3, "name": "Expert Blog",  "item": "https://insydz.com/resources/expert-blog" },
        { "@type": "ListItem", "position": 4, "name": "Competitor Undercutting Your Amazon India Price", "item": "https://insydz.com/resources/expert-blog/competitor-undercutting-amazon-india" }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://insydz.com/resources/expert-blog/amazon-private-label-india-2026#article",
      "headline": "Amazon Private Label Guide India 2026: Everything You Need to Know",
      "description": "A comprehensive guide to starting an Amazon Private Label business in India for 2026. Replicating the success of top brands.",
      "image": "https://insydz.com/Amazon-Vine-India-image1.png",
      "author": { "@type": "Person", "name": "Vikrant Singh", "url": "https://insydz.com/author/vikrant-singh" },
      "publisher": { "@id": "https://insydz.com/#organization" },
      "datePublished": "2026-05-15",
      "dateModified": "2026-05-15",
      "keywords": ["amazon private label india","private label amazon 2026","sell on amazon india","ecommerce brand building india"],
      "articleSection": "Seller Tools & Strategy",
      "inLanguage": "en-IN",
      "wordCount": 4400,
      "timeRequired": "PT12M"
    }
  ]
};

const keyTakeaways = [
            "Effective March 16, 2026, Amazon India eliminated referral fees on products priced up to ₹999 across 1,800+ categories including fashion, accessories, earphones, T-shirts, jewellery, and stationery.",
            "The fee saving is 5% to 12% of selling price depending on category. At volume, this is a meaningful margin improvement—not a rounding error.",
            "The strategic window is narrow. Sellers who reprice or reinvest within the first 4 to 6 weeks gain ranking and Buy Box advantage before the category recalibrates.",
            "Indian buyers have a strong psychological preference for sub-₹1,000 pricing. If your product sits between ₹1,000 and ₹1,199, repricing to ₹999 may unlock significant conversion improvement on top of the fee saving.",
            "Sellers who do not adjust will be undercut by those who do. Use Insydz to track how competitors in your category are repricing so you are not the last to know.",
        ];

// ── TOC ───────────────────────────────────────────────────────────────────────

const TOC = [
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "what-changed", label: "What Changed in March 2026" },
  { id: "categories", label: "Which Categories Are Affected" },
  { id: "profit-math", label: "Real Math: Profit Per Unit" },
  { id: "drop-to-999", label: "Drop to ₹999 or Pocket Margin?" },
  { id: "competitor-reaction", label: "How Competitors Are Reacting" },
  { id: "reinvest-margin", label: "Reinvest the Freed Margin" },
  { id: "faq", label: "FAQs" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Which Amazon India products now have zero referral fee after March 2026?",
    a: "Products priced up to ₹999 across 1,800+ categories now attract zero referral fee — including fashion and apparel, jewellery, mobile accessories, earphones, T-shirts, stationery, toys, and personal care. Products priced at ₹1,000 and above continue to attract the standard referral fee for their category.",
  },
  {
    q: "Should I reprice my products below ₹1,000 to take advantage of zero fees?",
    a: "Only if the ₹200 price reduction is more than offset by the referral fee saving — typically 5 to 12 percent of selling price. Run the unit economics before repricing. The ₹999 price point also unlocks significantly higher conversion rates among Indian buyers due to strong sub-₹1,000 price psychology.",
  },
  {
    q: "How much money can I actually save per unit under the new fee structure?",
    a: "For a ₹799 product at 8% referral fee, the saving is ₹63.92 per unit; for a ₹499 product at 5%, it is ₹24.95. At 200 units a month, the ₹799 earphones seller saves ₹12,784 per month in referral fees alone — without changing price or volume.",
  },
  {
    q: "Does zero referral fee change how I should set my competitive price?",
    a: "Yes. If competitors have not yet repriced to reflect their fee saving, you can offer a lower price and maintain the same net margin as before. This competitive window closes once the category adjusts. Sellers who reprice in weeks 1 to 4 after March 16 gain ranking and Buy Box share before the category equilibrium resets.",
  },
  {
    q: "Are there hidden costs that offset the zero referral fee benefit?",
    a: "FBA fees, Easy Ship charges, storage, and ad spend all remain unchanged — zero referral fee only eliminates that one component. For products under ₹300, an Easy Ship fee reduction also applies. Run the full P&L before deciding how to reprice.",
  },
  {
    q: "Can I use Insydz to track how competitors are repricing after the fee cut?",
    a: "Yes. Insydz monitors competitor prices on your tracked ASINs across Amazon India and Flipkart in real time. You can see which competitors have already repriced, by how much, and whether they have taken the Buy Box as a result — giving you the data to decide your own response before the category competitive floor resets.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmazonZeroReferralFeeContent() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("what-is-private-label");
  const [scrollPct, setScrollPct]   = useState(0);
  const [tocOpen, setTocOpen]       = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(0);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const id = "insydz-private-label-schema";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id   = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaPrivateLabel);
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min((window.scrollY / total) * 100, 100));
      for (let i = TOC.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC[i].id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(TOC[i].id); break; }
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
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveSection(TOC[i].id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  interface ArticleImgProps { src: string; alt: string; caption?: string; }
function ArticleImg({ src, alt, caption }: ArticleImgProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="article-img-wrap">
      {!loaded && <div className="img-shimmer" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "auto", display: loaded ? "block" : "none" }}
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

        .article-layout{max-width:1240px;margin:0 auto;padding:32px 16px 60px;display:grid;grid-template-columns:1fr;gap:0}
        @media(min-width:768px){.article-layout{padding:40px 20px 70px;grid-template-columns:220px 1fr;gap:28px}}
        @media(min-width:1024px){.article-layout{padding:48px 24px 80px;grid-template-columns:280px 1fr;gap:40px}}
        @media(min-width:1280px){.article-layout{grid-template-columns:308px 1fr;gap:52px}}

        .toc-sidebar{display:none}
        @media(min-width:768px){.toc-sidebar{display:block;position:sticky;top:76px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.05);max-height:calc(100vh - 96px);overflow-y:auto}}
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
          background: resolvedTheme === 'dark' ? "#0f172a" : "#F5F8FF",
          borderBottom: resolvedTheme === 'dark' ? "1px solid #1e293b" : "1px solid #E5E7EB",
          padding: "8px 0"
        }}
      >
        <div className="breadcrumb-inner" style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#94A3B8" }}>
          <Link href="/" style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#64748B", fontWeight:500, textDecoration:"none" }}>Home</Link>
          <span style={{ color: resolvedTheme === 'dark' ? "#475569" : "#cbd5e1" }}>›</span>
          <Link href="/resources/expert-blog" style={{ color: resolvedTheme === 'dark' ? "#cbd5e1" : "#64748B", fontWeight:500, textDecoration:"none" }}>Blog</Link>
          <span style={{ color: resolvedTheme === 'dark' ? "#475569" : "#cbd5e1" }}>›</span>
          <span style={{ color: resolvedTheme === 'dark' ? "#64748b" : "#94A3B8" }}>Competitor Undercutting Your Amazon India Price</span>
        </div>
      </div>

      {/* HERO SECTION - REVISED TO MATCH IMAGE */}
      <div 
        style={{ 
          background: resolvedTheme === 'dark' ? "#0f1120" : "#F1F2FF", 
          padding: "48px 0", 
          borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E2E8F0" 
        }} 
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 16px" }} className="w-full">
          
          <div className="w-full">
            <div style={{ 
              display:"inline-flex", 
              alignItems:"center", 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#E0E2FF", 
              color: resolvedTheme === 'dark' ? "#818cf8" : "#6366F1", 
              fontSize:11, fontWeight:800, letterSpacing:0.5, textTransform:"uppercase", padding:"6px 16px", borderRadius:20, marginBottom:20, fontFamily:"'Sora',sans-serif" 
            }}>
              <span style={{ marginRight: 8, color: "#6366F1" }}>●</span> PRICING INTELLIGENCE
            </div>
            
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px, 4.5vw, 48px)", fontWeight:900, lineHeight:1.1, color: resolvedTheme === 'dark' ? "white" : "#111827", letterSpacing:"-1px", marginBottom:20 }}>
              Amazon <span style={{ color: "#6366F1" }}>Zero Referral Fee Undercutting< br/></span> India 2026: How to Rebuild Your <br/>Pricing Strategy and Keep More Profit
            </h1>

            <p style={{ margin: 0, fontSize: 16, color: resolvedTheme === 'dark' ? "#d1d5db" : "#4B5563", lineHeight: 1.65, fontFamily: "'Lora', serif" }}>
              Amazon handed Indian sellers a margin gift in March 2026. Zero referral fees on 1,800+ categories for products priced up to ₹999. Most sellers know it happened. Most are leaving money on the table because they have not acted on it strategically.
            </p>


            
            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" as const, gap:"4px 14px", marginBottom:20, marginTop:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>👤 <strong className="text-[#0A0F1A] hover:text-orange-500 transition-colors cursor-pointer" onClick={() => router.push("/author/vikrant-singh")}>Vikrant Singh</strong></div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>🕐 June 2026</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"clamp(11px,2vw,13px)", color:"#64748B" }}>📖 <strong>11 min read</strong></div>
              <span style={{ background:"rgba(244,80,10,.12)", color:"#F4500A", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Updated for 2026</span>
              <span style={{ background:"rgba(10,191,164,.12)", color:"#0ABFA4", fontSize:"clamp(9px,2vw,11px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Competitor Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-10" style={{ maxWidth: 1040, margin: "20px auto 0", padding: "0 16px" }}>
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img 
            src="/amazon-zero-referral-fee-india_blogbanner.png" 
            // src="/amazon-zero-referral-fee-india_Image2.png" 
            alt="Amazon Sales Drop" 
            className="w-full h-auto block"
          />
        </div>
        <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
          Amazon India zero referral fee the March 2026 fee cut applies to all products priced up to ₹999 across 1,800+ categories. An earphones seller at 200 units/month saves ₹12,784 in referral fees every month from this date.
        </p>
      </div>

      {/* QUICK SUMMARY & TAKEAWAYS - MATCHING IMAGE */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px 0" }}>
        
        {/* Quick Answer Box */}
        <div style={{ 
          background: resolvedTheme === 'dark' ? "#111827" : "#F8F9FF", 
          borderLeft: "4px solid #6366F1", 
          borderRadius: 8, padding: "24px 32px", marginBottom: 40 
        }} className="dark:border-indigo-500">
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: "'Sora', sans-serif" }}>
            QUICK ANSWER
          </div>
          <p style={{ margin: 0, fontSize: 16, color: resolvedTheme === 'dark' ? "#d1d5db" : "#4B5563", lineHeight: 1.65, fontFamily: "'Lora', serif" }}>
            Amazon India eliminated referral fees on products priced up to ₹999 across 1,800+ categories effective March 16, 2026. The strategic options are: keep your current price and bank the freed margin, drop price to gain Buy Box share before competitors adjust, or reinvest the freed margin into ads and inventory. The right choice depends on your category's competitive intensity and your current margin floor.
          </p>
        </div>

        <div id="key-takeaways">
          <KeyTakeawaysBox
            title="Key Takeaways: Amazon Zero Referral Fee India 2026"
            items={keyTakeaways}
            accentColor="#2fcf44ff"
          />
        </div>
      </div>

      {/* ARTICLE LAYOUT */}
      <div className="article-layout">

        {/* SIDEBAR */}
        <aside className="toc-sidebar" style={{ 
          background: resolvedTheme === 'dark' ? "#111827" : "#fff",
          borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
        }}>
          <h4 style={{ 
            fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", 
            color: resolvedTheme === 'dark' ? "#94a3b8" : "#64748B", marginBottom: "16px",
            fontFamily: "'Sora', sans-serif" 
          }}>Table of Contents</h4>
          <ul className="space-y-1" style={{ listStyle:"none", padding:0, margin:0 }}>
            {TOC.map(t => (
              <li key={t.id}>
                <button 
                  className={`toc-link${activeSection === t.id ? " active" : ""}`} 
                  onClick={() => go(t.id)}
                  style={{
                    color: activeSection === t.id ? "#7C3AED" : (resolvedTheme === 'dark' ? "#94a3b8" : "#64748B"),
                    background: activeSection === t.id ? (resolvedTheme === 'dark' ? "#1e1033" : "#F5F3FF") : "transparent",
                    borderLeft: activeSection === t.id ? "2px solid #7C3AED" : "2px solid transparent"
                  }}
                >{t.label}</button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN */}
        <main style={{ minWidth:0 }}>
          <button 
            className="mobile-toc-btn" 
            onClick={() => setTocOpen(!tocOpen)}
            style={{ 
              background: resolvedTheme === 'dark' ? "#111827" : "#fff",
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#111",
              borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
            }}
          >
            Table of Contents <span>{tocOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`mobile-toc-panel${tocOpen ? " open" : ""}`} style={{ 
            background: resolvedTheme === 'dark' ? "#111827" : "#fff",
            borderColor: resolvedTheme === 'dark' ? "#1f2937" : "#E5E7EB"
          }}>
            {TOC.map(t => (
              <button key={t.id} className="toc-link" style={{ display:"block", marginBottom:3 }} onClick={() => go(t.id)}>{t.label}</button>
            ))}
          </div>

          <article className="article-body">

            <h2 id="what-changed" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "0 0 28px"
            }}>
              What Changed on March 16, 2026 and Why It Matters
            </h2>
            
            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "20px", fontFamily: "'Lora', serif" }}>
              Amazon India made its largest seller-facing fee cut in the history of the India marketplace on March 16, 2026. Products priced up to ₹999 (inclusive) in over 1,800 categories now attract zero referral fee. Previously, sellers were paying 5 to 12 percent of the selling price as a referral fee on every transaction money that went directly to Amazon before you even calculated your own margin.
            </p>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              For a seller doing 500 units a month at ₹799 in a category with an 8 percent referral fee, that was ₹31,960 per month leaving your account in referral fees alone. From March 16, 2026 that number is zero.
            </p>

            <div className="box box-purple" style={{ 
              background: resolvedTheme === 'dark' ? "#1e1b4b" : "#F5F3FF", 
              borderLeft: "6px solid #8B5CF6", 
              borderRadius: 20, padding: "32px", margin: "40px 0",
              boxShadow: resolvedTheme === 'dark' ? "0 4px 20px rgba(0,0,0,0.3)" : "0 10px 30px rgba(139,92,246,0.08)"
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#7C3AED", textTransform:"uppercase", letterSpacing:1.2, marginBottom:18, fontFamily:"'Sora',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                📌 What "Zero Referral Fee" Actually Means
              </div>
              <p style={{ margin:"0 0 16px", fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Sora', sans-serif" }}>
              The referral fee is the percentage Amazon charges on each completed sale separate from FBA fees, Easy Ship fees, and storage. Zero referral fee means that specific component drops to zero for qualifying ASINs. All other fees remain unchanged.
              </p>
            </div>

            <p style={{ margin:"0 0 16px", fontSize:15.5, color: resolvedTheme === 'dark' ? "#cbd5e1" : "#4B5563", lineHeight:1.75, fontFamily: "'Sora', sans-serif" }}>
              This is a permanent fee change not a promotion. Amazon India structured it as part of a broader push to compete with Flipkart's fee structure and accelerate onboarding of new sellers from tier-2 and tier-3 cities.
            </p>             

            <h2 id="categories" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              Which Categories and Products Are Affected?
            </h2>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              The zero referral fee applies broadly across product categories where the listed price is ₹999 or below. The affected categories include most everyday consumer products. Here are the most commercially significant ones:
            </p>

            <div
              className="tbl-wrap"
              style={{
                marginBottom: 48,
                background: resolvedTheme === "dark" ? "#111827" : "#fff",
                borderRadius: 16,
                overflowX: "auto",
                overflowY: "hidden",
                border:
                  resolvedTheme === "dark"
                    ? "1px solid #1f2937"
                    : "1px solid #E5E7EB",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "900px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background: "#071827",
                    color: "#FFFFFF",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      Category
                    </th>

                    <th
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      Previous Referral Fee
                    </th>

                    <th
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      Fee After March 2026
                    </th>

                    <th
                      style={{
                        padding: "16px 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      Saving Per ₹799 Unit
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      category: "Fashion and apparel (T-shirts, kurtas)",
                      previousFee: "5–7%",
                      newFee: "0%",
                      savings: "₹40–₹56",
                      highlight: true,
                    },
                    {
                      category: "Fashion jewellery and accessories",
                      previousFee: "5%",
                      newFee: "0%",
                      savings: "₹40",
                      highlight: false,
                    },
                    {
                      category: "Mobile accessories and phone cases",
                      previousFee: "8%",
                      newFee: "0%",
                      savings: "₹63.92",
                      highlight: true,
                    },
                    {
                      category: "Earphones and audio accessories",
                      previousFee: "8%",
                      newFee: "0%",
                      savings: "₹63.92",
                      highlight: false,
                    },
                    {
                      category: "Stationery and school supplies",
                      previousFee: "5%",
                      newFee: "0%",
                      savings: "₹40",
                      highlight: true,
                    },
                    {
                      category: "Personal care and beauty (mass market)",
                      previousFee: "5–8%",
                      newFee: "0%",
                      savings: "₹40–₹64",
                      highlight: false,
                    },
                    {
                      category: "Toys and games (under ₹799)",
                      previousFee: "8–12%",
                      newFee: "0%",
                      savings: "₹64–₹96",
                      highlight: true,
                    },
                    {
                      category: "Home and kitchen basics",
                      previousFee: "8%",
                      newFee: "0%",
                      savings: "₹63.92",
                      highlight: false,
                    },
                  ].map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        background:
                          index % 2 === 0
                            ? resolvedTheme === "dark"
                              ? "#1E293B20"
                              : "#EEF3F1"
                            : resolvedTheme === "dark"
                            ? "#111827"
                            : "#FFFFFF",
                        borderBottom:
                          resolvedTheme === "dark"
                            ? "1px solid #1f2937"
                            : "1px solid #DDE7E2",
                      }}
                    >
                      <td
                        style={{
                          padding: "20px 18px",
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: "#007A5E",
                          borderLeft: row.highlight
                            ? "3px solid #10B981"
                            : "3px solid transparent",
                          fontFamily: "'Sora', sans-serif",
                          maxWidth: 240,
                        }}
                      >
                        {row.category}
                      </td>

                      <td
                        style={{
                          padding: "20px 18px",
                          fontSize: 14,
                          color:
                            resolvedTheme === "dark"
                              ? "#CBD5E1"
                              : "#0F172A",
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        {row.previousFee}
                      </td>

                      <td
                        style={{
                          padding: "20px 18px",
                        }}
                      >
                        <span
                          style={{
                            background: "#DDF5E8",
                            color: "#00875A",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {row.newFee}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "20px 18px",
                        }}
                      >
                        <span
                          style={{
                            background: "#DDF5E8",
                            color: "#00875A",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {row.savings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <InfoBanner
              accentColor="#E67E22"
              title="Products That Still Pay Referral Fee"
              content="Electronics (smartphones, laptops, tablets), books, grocery and FSSAI products, and any product priced at ₹1,000 or above continue to attract the standard referral fee for their category. The zero fee applies only to the price-qualifying products in the 1,800+ eligible categories."
            />

            <div className="my-10">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <img 
                  src="/amazon-zero-referral-fee-india_Image2.png" 
                  alt="Amazon Sales Drop" 
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                  Amazon India zero referral fee impact monthly savings at 200 units for four common sub ₹1,000 product types. An earphones seller saves ₹12,784 per month in referral fees from March 16, 2026.
              </p>
            </div>

            <h2 id="profit-math" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              The Real Math: How Much Extra Profit Per Unit?
            </h2>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Here are three concrete before-and-after unit economics examples. These use actual typical fee structures for each category prior to March 2026. FBA fees are unchanged.
            </p>

            <div style={{ marginBottom: 48 }}>
              {[
                {
                  title: "Example 1: Fashion T-shirt priced at ₹499",
                  rows: [
                    {
                      component: "Selling price",
                      before: "₹499",
                      after: "₹499",
                      change: "—",
                    },
                    {
                      component: "Referral fee (5%)",
                      before: "₹24.95",
                      after: "₹0",
                      change: "+₹24.95",
                      highlight: true,
                    },
                    {
                      component: "FBA fees",
                      before: "₹65",
                      after: "₹65",
                      change: "—",
                    },
                    {
                      component: "COGS (estimate)",
                      before: "₹120",
                      after: "₹120",
                      change: "—",
                    },
                    {
                      component: "Net profit per unit",
                      before: "₹289.05",
                      after: "₹314",
                      change: "+8.6%",
                      profit: true,
                    },
                  ],
                },
                {
                  title: "Example 2: Earphones priced at ₹799",
                  rows: [
                    {
                      component: "Selling price",
                      before: "₹799",
                      after: "₹799",
                      change: "—",
                    },
                    {
                      component: "Referral fee (8%)",
                      before: "₹63.92",
                      after: "₹0",
                      change: "+₹63.92",
                      highlight: true,
                    },
                    {
                      component: "FBA fees",
                      before: "₹95",
                      after: "₹95",
                      change: "—",
                    },
                    {
                      component: "COGS (estimate)",
                      before: "₹240",
                      after: "₹240",
                      change: "—",
                    },
                    {
                      component: "Net profit per unit",
                      before: "₹400.08",
                      after: "₹464",
                      change: "+16%",
                      profit: true,
                    },
                  ],
                },
                {
                  title: "Example 3: Fashion jewellery priced at ₹699",
                  rows: [
                    {
                      component: "Selling price",
                      before: "₹699",
                      after: "₹699",
                      change: "—",
                    },
                    {
                      component: "Referral fee (5%)",
                      before: "₹34.95",
                      after: "₹0",
                      change: "+₹34.95",
                      highlight: true,
                    },
                    {
                      component: "FBA fees",
                      before: "₹65",
                      after: "₹65",
                      change: "—",
                    },
                    {
                      component: "COGS (estimate)",
                      before: "₹150",
                      after: "₹150",
                      change: "—",
                    },
                    {
                      component: "Net profit per unit",
                      before: "₹449.05",
                      after: "₹484",
                      change: "+7.8%",
                      profit: true,
                    },
                  ],
                },
              ].map((example, exampleIndex) => (
                <div key={exampleIndex} style={{ marginBottom: 42 }}>
                  <h3
                    style={{
                      color: "#007A5E",
                      fontSize: 24,
                      fontWeight: 700,
                      marginBottom: 16,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {example.title}
                  </h3>

                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border:
                        resolvedTheme === "dark"
                          ? "1px solid #1F2937"
                          : "1px solid #DDE7E2",
                      background:
                        resolvedTheme === "dark" ? "#111827" : "#FFFFFF",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "750px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#071827",
                            color: "#fff",
                          }}
                        >
                          <th
                            style={{
                              padding: "18px 16px",
                              textAlign: "left",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Sora', sans-serif",
                              textTransform: "uppercase",
                            }}
                          >
                            P&L Component
                          </th>

                          <th
                            style={{
                              padding: "18px 16px",
                              textAlign: "left",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Sora', sans-serif",
                              textTransform: "uppercase",
                            }}
                          >
                            Before March 2026
                          </th>

                          <th
                            style={{
                              padding: "18px 16px",
                              textAlign: "left",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Sora', sans-serif",
                              textTransform: "uppercase",
                            }}
                          >
                            After March 2026
                          </th>

                          <th
                            style={{
                              padding: "18px 16px",
                              textAlign: "left",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'Sora', sans-serif",
                              textTransform: "uppercase",
                            }}
                          >
                            Change
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {example.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            style={{
                              background:
                                rowIndex % 2 === 0
                                  ? resolvedTheme === "dark"
                                    ? "#1E293B20"
                                    : "#EEF3F1"
                                  : resolvedTheme === "dark"
                                  ? "#111827"
                                  : "#FFFFFF",
                              borderBottom:
                                resolvedTheme === "dark"
                                  ? "1px solid #1F2937"
                                  : "1px solid #DDE7E2",
                            }}
                          >
                            <td
                              style={{
                                padding: "18px 16px",
                                fontSize: 14,
                                fontFamily: "'Sora', sans-serif",
                                fontWeight: row.profit ? 700 : 500,
                                color: row.profit ? "#007A5E" : undefined,
                                borderLeft: row.profit
                                  ? "3px solid #10B981"
                                  : "3px solid transparent",
                              }}
                            >
                              {row.component}
                            </td>

                            <td
                              style={{
                                padding: "18px 16px",
                                fontSize: 14,
                                fontFamily: "'Sora', sans-serif",
                              }}
                            >
                              {row.before}
                            </td>

                            <td
                              style={{
                                padding: "18px 16px",
                                fontSize: 14,
                                fontFamily: "'Sora', sans-serif",
                              }}
                            >
                              {row.highlight ? (
                                <span
                                  style={{
                                    background: "#DDF5E8",
                                    color: "#00875A",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  ₹0
                                </span>
                              ) : (
                                row.after
                              )}
                            </td>

                            <td
                              style={{
                                padding: "18px 16px",
                                fontSize: 14,
                                fontFamily: "'Sora', sans-serif",
                                fontWeight:
                                  row.change !== "—" ? 700 : 500,
                                color:
                                  row.change !== "—"
                                    ? "#00A63E"
                                    : resolvedTheme === "dark"
                                    ? "#CBD5E1"
                                    : "#334155",
                              }}
                            >
                              {row.change}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div
            >
              {/* Heading */}
              
                <h2 id="drop-to-999" style={{ 
                          fontFamily: "'Sora', sans-serif",
                          fontSize: "clamp(22px, 3vw, 28px)", 
                          fontWeight: 900, 
                          color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
                          lineHeight: 1.2,
                          letterSpacing: "-0.5px",
                          paddingBottom: "16px",
                          borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
                          margin: "40px 0 28px"
                        }}>
                          Should You Drop Your Price to ₹999 or Pocket the Margin?
                        </h2>

              {/* Content */}
              <div
                style={{
                  padding: "24px 28px 32px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 32px",
                    fontSize: 16,
                    lineHeight: 2,
                    color:
                      resolvedTheme === "dark"
                        ? "#CBD5E1"
                        : "#334155",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  This is the central strategic question and the answer is not
                  the same for every seller. There are two distinct scenarios
                  depending on where your product is currently priced.
                </p>

                {/* Scenario A */}
                <div style={{ marginBottom: 36 }}>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      color: "#007A5E",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.6,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Scenario A: Your product is already priced below ₹999
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 2,
                      color:
                        resolvedTheme === "dark"
                          ? "#CBD5E1"
                          : "#334155",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    The fee saving arrives automatically. You now have a choice:
                    hold the current price and improve your net margin, or pass
                    part of the saving to buyers through a price reduction to gain
                    ranking and Buy Box share. The right choice depends on how
                    competitively priced you already are and whether your category
                    is seeing competitor repricing.
                  </p>
                </div>

                {/* Scenario B */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      color: "#007A5E",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.6,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Scenario B: Your product is priced between ₹1,000 and ₹1,199
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 2,
                      color:
                        resolvedTheme === "dark"
                          ? "#CBD5E1"
                          : "#334155",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    This is the highest-value decision point. Repricing from
                    ₹1,099 to ₹999 gives you two simultaneous advantages: zero
                    referral fee on the new price, and access to the powerful
                    sub-₹1,000 price psychology that drives significantly higher
                    conversion rates among Indian buyers.
                  </p>
                </div>
              </div>
            </div>

            <div className="my-10" style={{ maxWidth: 1040, margin: "20px auto 0", padding: "0 16px" }}>
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
              <img 
                src="/amazon-zero-referral-fee-india_image3.png"  
                alt="Amazon Sales Drop" 
                className="w-full h-auto block"
              />
            </div>
            <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                    Pricing model for a ₹1,099 product repriced to ₹999 the fee saving of ₹87.92 nearly offsets the ₹100 price drop, and the conversion rate uplift from sub-₹1,000 pricing more than compensates at typical Indian marketplace volumes.
            </p>
          </div>

            <InfoBanner
              accentColor="#16A34A"
              title="The ₹999 Threshold Rule"
              content="If the gap between your current price and ₹999 is smaller than the referral fee you were paying, repricing to ₹999 is margin-neutral or better — plus you get the conversion lift from Indian buyer price psychology. If the gap is larger than the fee saving, hold your price and take the margin improvement instead."
            />

            <div style={{ background:"#0A1524", borderRadius:12, padding:"clamp(24px,5vw,32px)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap", marginBottom:40 }}>
              <div style={{ flex:1, minWidth:280 }}>
                <h3 id="competitor-reaction" style={{ color:"white", fontSize:"clamp(18px,3vw,22px)", fontWeight:800, marginBottom:12, fontFamily:"'Sora',sans-serif", border:"none", padding:0 }}>Track how competitors are repricing after the fee cut</h3>
                <p style={{ color:"#94A3B8", fontSize:15, margin:0, lineHeight:1.6 }}>Insydz shows competitor price changes across your category in real time. See who moved and by how much — and decide your response before the market settles.</p>
              </div>
              <Link href="/login" style={{ background:"#F4500A", color:"white", padding:"12px 24px", borderRadius:8, fontWeight:700, fontSize:14, whiteSpace:"nowrap", textDecoration:"none", fontFamily:"'Sora',sans-serif" }} className="sm:w-auto w-full text-center">Check Competitor Prices Free →</Link>
            </div>

            <div className="my-10" style={{ maxWidth: 1040, margin: "20px auto 0", padding: "0 16px" }}>
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
              <img 
                src="/amazon-zero-referral-fee-india_image4.png" 
                alt="Amazon Sales Drop" 
                className="w-full h-auto block"
              />
            </div>
            <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
                        Insydz category price tracking 3 of the top 5 sellers in an earphones category have already repriced downward after the March 2026 fee cut. Sellers who have not moved are now ₹50 to ₹70 above the competitive midpoint.
            </p>
          </div>

            <h2 id="reinvest-margin" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              The Hidden Opportunity: Reinvest the Freed Margin Instead of Discounting
            </h2>

            <p style={{ color: resolvedTheme === 'dark' ? "#94a3b8" : "#4B5563", fontSize: "16px", lineHeight: 1.7, marginBottom: "32px", fontFamily: "'Lora', serif" }}>
              Dropping price is the most obvious response to the fee saving. It is not always the best one. For sellers who are already competitively priced and winning their Buy Box, the smarter move is reinvestment.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20,
                marginBottom: 48,
              }}
            >
              {[
                {
                  icon: "✓",
                  iconBg: "#DDF5E8",
                  iconColor: "#059669",
                  title: "Reinvest into Sponsored Products",
                  text:
                    "A ₹12,784/month fee saving on an earphones ASIN at 200 units is exactly enough to run a competitive Sponsored Products campaign. More ad spend → more visibility → more organic rank → more sales. The freed fee compounds through the ad flywheel.",
                  tag: "High ROI",
                  tagBg: "#DDF5E8",
                  tagColor: "#047857",
                },
                {
                  icon: "+",
                  iconBg: "#F8F1DF",
                  iconColor: "#D97706",
                  title: "Build Stock Depth",
                  text:
                    "Sellers who run out of inventory during a sales surge lose ranking that takes weeks to rebuild. The freed margin is an FBA inventory buffer fund. Buy 30 to 50 extra units now and never lose ranking to stockouts again.",
                  tag: "Category Moat",
                  tagBg: "#F8F1DF",
                  tagColor: "#B45309",
                },
                {
                  icon: "◎",
                  iconBg: "#E8F0FF",
                  iconColor: "#2563EB",
                  title: "Pass Some to Price, Keep Some",
                  text:
                    "A split reinvestment approach: drop price by half the fee saving (e.g. ₹799 → ₹769) and keep the other half as margin improvement. You gain ranking and Buy Box competitiveness while also improving unit economics.",
                  tag: "Balanced",
                  tagBg: "#E8F0FF",
                  tagColor: "#1D4ED8",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  style={{
                    background:
                      resolvedTheme === "dark" ? "#111827" : "#FFFFFF",
                    border: "1px solid #D7ECE4",
                    borderRadius: 28,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 360,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: card.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.iconColor,
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: "0 0 14px",
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color:
                        resolvedTheme === "dark"
                          ? "#F8FAFC"
                          : "#071827",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      margin: 0,
                      flex: 1,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color:
                        resolvedTheme === "dark"
                          ? "#94A3B8"
                          : "#64748B",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {card.text}
                  </p>

                  {/* Footer Pill */}
                  <div
                    style={{
                      marginTop: 24,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        minWidth: 120,
                        textAlign: "center",
                        borderRadius: 999,
                        background: card.tagBg,
                        color: card.tagColor,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-10" style={{ maxWidth: 1040, margin: "20px auto 0", padding: "0 16px" }}>
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img 
            src="/amazon-zero-referral-fee-india_image5.png"  
            alt="Amazon Sales Drop" 
            className="w-full h-auto block"
          />
        </div>
        <p className="mt-4 text-center text-[13px] text-gray-400 italic font-medium font-sans px-4">
              Insydz rank tracking a Pune earphones seller moved from #34 to #17 in 4 weeks after March 2026 by repricing from ₹799 to ₹769. Revenue up 31%, unit margin up ₹33.92 versus the pre-fee-cut baseline.
        </p>
      </div>

            <h2 id="faq" style={{ 
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)", 
              fontWeight: 900, 
              color: resolvedTheme === 'dark' ? "#f9fafb" : "#0A0F1A", 
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              paddingBottom: "16px",
              borderBottom: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #E5E7EB",
              margin: "40px 0 28px"
            }}>
              Frequently Asked Questions
            </h2>

            <FAQ
              accentColor="#34D399"
              faqs={faqs}
            />

            {/* More Marketplace Playbooks */}
            <div style={{ marginTop: 48 }}>
              <h3 style={{ 
                fontFamily: "'Sora', sans-serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, 
                color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", marginBottom: 32, letterSpacing: "-0.5px"
              }}>
                More Marketplace Playbooks
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
                {[
                  { 
                    tag: "REVIEW STRATEGY", tagColor: "#059669",
                    title: "Amazon Vine India 2026: Cost, Worth & How to Enrol", 
                    route: "/resources/expert-blog/amazon-vine-program-india-2026",
                    image: "/Amazon-Vine-India-image1.png"
                  },
                  { 
                    tag: "SEO STRATEGY", tagColor: "#3B82F6",
                    title: "Amazon India Keyword Ranking: How to Track and Improve in 2026", 
                    route: "/resources/expert-blog/how-to-rank-page-1-amazon-india",
                    image: "/twenty three.png"
                  },
                  { 
                    tag: "REVIEW INTELLIGENCE", tagColor: "#DC2626",
                    title: "AI Review Analysis Tool for Amazon India & Flipkart: Complete Guide", 
                    route: "/resources/expert-blog/amazon-review-analysis-guide-india",
                    image: "/01_hero_review_intelligence_banner.png"
                  },
                ].map((card, i) => (
                  <Link key={i} href={card.route} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ 
                      background: resolvedTheme === 'dark' ? "#111827" : "white",
                      borderRadius: 20, overflow: "hidden",
                      border: resolvedTheme === 'dark' ? "1px solid #1f2937" : "1px solid #F1F5F9",
                      boxShadow: resolvedTheme === 'dark' ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
                      transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = resolvedTheme === 'dark' ? "none" : "0 4px 16px rgba(0,0,0,0.04)"; }}
                    >
                      <div style={{ overflow: "hidden", background: resolvedTheme === 'dark' ? "#1e293b" : "#f8fafc" }}>
                        <img src={card.image} alt={card.title} style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                      <div style={{ padding: "20px 22px 24px" }}>
                        <span style={{ 
                          fontSize: 10, fontWeight: 800, color: card.tagColor, 
                          textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora', sans-serif", marginBottom: 8, display: "block"
                        }}>
                          {card.tag}
                        </span>
                        <h4 style={{ 
                          margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.4, 
                          color: resolvedTheme === 'dark' ? "#f9fafb" : "#111827", fontFamily: "'Sora', sans-serif"
                        }}>
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
      <FinalCTA
        title="Amazon Gave You a Margin Gift. Use It Before Your Competitors Do."
        description="Track how competitors in your category are repricing after the March 2026 fee cut. Make a deliberate pricing decision — not a reactive one."
        primaryButtonText="Track Competitor Prices Free →"
        primaryButtonHref="/signup"
        secondaryButtonText="See Plans"
        secondaryButtonHref="/pricing"
        primaryColor="#0D8B63"
        secondaryColor="#08A37A"
        stats={[
          {
            value: "5,000+",
            label: "Indian sellers",
          },
          {
            value: "Free",
            label: "To start",
          },
          {
            value: "Daily",
            label: "Price tracking",
          },
          {
            value: "WhatsApp",
            label: "Alerts in 1 hr",
          },
        ]}
      />

      
      
    </div>
  );
}
