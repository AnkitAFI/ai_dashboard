"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin, Shield, Lock, EyeOff } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/seller-dashboard") return null;

  return (
    <footer className="bg-[#0a0f1e] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header Row with Logo and Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-8 border-b border-white/10">
          <a href="/" className="flex items-center space-x-3 mb-6 md:mb-0" aria-label="Insydz – Home">
            <img src="/logo.png" alt="Insydz Logo" className="w-10 h-10 object-contain p-0.5" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Insydz
            </span>
          </a>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <span className="font-semibold text-lg text-center md:text-left">
              Never miss insights into the e-commerce selling space
            </span>
            <form
              className="flex w-full md:w-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                console.log("Subscribed email:", formData.get("email"));
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="px-4 py-2 text-gray-900 rounded-l-md focus:outline-none w-full md:w-64"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-md font-semibold transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* 4 Column Grid for Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">

          {/* Column 1 – Solutions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Solutions</h4>
            <ul className="space-y-3">
              <li><Link href="/seller-dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/solutions/amazon-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Amazon Sellers</Link></li>
              <li><Link href="/solutions/amazon-advertising" className="text-sm text-gray-400 hover:text-white transition-colors">Amazon Advertising</Link></li>
              <li><Link href="/solutions/flipkart-sellers" className="text-sm text-gray-400 hover:text-white transition-colors">Flipkart Sellers</Link></li>
              <li><Link href="/solutions/ecommerce-agencies" className="text-sm text-gray-400 hover:text-white transition-colors">Agencies</Link></li>
              <li><Link href="/solutions/brand-managers" className="text-sm text-gray-400 hover:text-white transition-colors">Brand Managers</Link></li>
            </ul>
          </div>

          {/* Column 2 – Product */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/features/festive-trend-feature" className="text-sm text-gray-400 hover:text-white transition-colors">Festive Trends</Link></li>
              <li><Link href="/compare/insydzvshelium" className="text-sm text-gray-400 hover:text-white transition-colors">Compare</Link></li>
            </ul>
          </div>

          {/* Column 3 – Resources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/resources/expert-blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              {/* <li><Link href="/resources/guides" className="text-sm text-gray-400 hover:text-white transition-colors">E-commerce Guides</Link></li> */}
              <li><Link href="/resources/video-guides" className="text-sm text-gray-400 hover:text-white transition-colors">Video Tutorials</Link></li>
              {/* <li><Link href="/resources/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link></li> */}
              <li><Link href="/free-tools/free-amazon-product-analyzer" className="text-sm text-gray-400 hover:text-white transition-colors">Free Tools</Link></li>
            </ul>
          </div>

          {/* Column 4 – Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Company</h4>
            <ul className="space-y-3">
              <li><a href="/#About" className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><Link href="/about/our-vision" className="text-sm text-gray-400 hover:text-white transition-colors">Our Vision</Link></li>
              <li><Link href="/about/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/about/contact-us" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Trust Banner - Data Privacy Guarantee */}
        <div className="border-y border-white/10 bg-white/5 py-6 mb-8 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-bold text-gray-200 text-base">Data Privacy Guarantee</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-4xl mx-auto">
              Insydz strictly complies with Amazon's Acceptable Use Policy (Sections 4.4 and 4.5). All market insights are derived exclusively from public marketplace data. We never aggregate, share, or pool private internal seller data to provide insights.
            </p>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Social Icons Left */}
          <div className="flex space-x-4">
            <a title="Insydz on Facebook" href="https://www.facebook.com/profile.php?id=61586202582209" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a title="Insydz on Twitter / X" href="https://x.com/growwithinsydz" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a title="Insydz on Instagram" href="https://www.instagram.com/growwithinsydz/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a title="Insydz on LinkedIn" href="https://www.linkedin.com/company/insydz/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright & Legal Links Right */}
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 text-sm text-gray-500">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} <span className="text-purple-400 font-semibold">Insydz</span>. All Rights Reserved.
            </p>
            <div className="hidden sm:block">|</div>
            <Link href="/terms-service" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <div className="hidden sm:block">|</div>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
