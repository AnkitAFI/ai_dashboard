"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  HelpCircle, Shield, Handshake,
  HeadphonesIcon, ChevronDown,
  Plus, Minus, Clock, CheckCircle2, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-static";

const faqs = [
  { q: "How quickly do you respond?", a: "We typically respond within 24–48 hours on business days. For urgent support issues, please mention it in your message subject." },
  { q: "Where is INSYDZ based?", a: "INSYDZ is headquartered in New Delhi, India. We are an India-first SaaS platform built specifically for Indian marketplace sellers." },
  { q: "Can I request a feature?", a: "Absolutely. We actively build based on seller feedback. Use the contact form below and select 'Other' as your inquiry type, then describe the feature you need." },
  { q: "Do you offer enterprise plans?", a: "Yes. We have custom plans for agencies and large seller operations. Reach out to partnerships@insydz.com or book a demo to discuss your requirements." },
  { q: "How do I cancel my subscription?", a: "You can cancel your subscription anytime from your account settings. For help, email support@insydz.com and our team will assist you promptly." },
];

export default function ContactUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({ name: "", email: "", company: "", inquiry: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormState({ ...formState, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState) });
      if (res.ok) setSubmitted(true);
      else alert("Failed to send. Please try again.");
    } catch { alert("An error occurred. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f4f4fa" }}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="pt-28 pb-16 px-4" style={{ background: "linear-gradient(135deg, #f0eeff 0%, #f7f4ff 50%, #eef1ff 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[520px]">

            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <div className="inline-flex items-center gap-2 border border-orange-300 bg-orange-50 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block" />
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Let's Connect</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-5">
                Got a question?<br />
                We're{" "}
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  one message away.
                </span>
              </h1>

              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
                Product questions, partnership ideas, or you're just stuck setting up — our team replies in plain language, no ticket numbers, no bots.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => document.getElementById("contact-form-section")?.scrollIntoView({ behavior: "smooth" })}
                  id="hero-send-message-btn"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
                >
                  Send a Message
                </button>
                <a href="mailto:support@insydz.com" id="hero-email-directly-btn" className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-600 font-semibold px-6 py-3 rounded-full transition-all">
                  Email Us Directly
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Clock className="w-4 h-4 text-orange-500" />, title: "Quick Response", desc: "We reply within 24 hours" },
                  { icon: <CheckCircle2 className="w-4 h-4 text-violet-500" />, title: "Real People", desc: "Talk to our own team, always" },
                  { icon: <Shield className="w-4 h-4 text-green-500" />, title: "Trusted & Safe", desc: "Your data stays private" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Static Owl + Chat bubble */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="relative flex flex-col justify-center items-center lg:items-end"
            >
              {/* Team online badge */}
              <div className="absolute top-0 right-0 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">Team is online</span>
              </div>

              {/* Replies badge */}
              <div className="absolute bottom-0 left-0 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100 z-10">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-semibold text-gray-700">Replies within 24–48 hrs</span>
              </div>

              <div className="flex flex-col items-center">
                {/* Static owl image */}
                <Image
                  src="/owl.png"
                  alt="Insydz mascot Apex"
                  width={340}
                  height={380}
                  unoptimized
                  className="w-auto h-[300px] sm:h-[340px] object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — HOW CAN WE HELP
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">How can we help?</h2>
            <p className="text-gray-500 text-base">Pick the team that fits your question best — it gets you to the right inbox faster.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <HelpCircle className="w-6 h-6 text-rose-500" />, bg: "bg-rose-50", title: "Product Questions", desc: "For feature clarifications and onboarding help.", email: "support@insydz.com" },
              { icon: <HeadphonesIcon className="w-6 h-6 text-violet-500" />, bg: "bg-violet-50", title: "Customer Support", desc: "For account issues, billing, or technical help.", email: "support@insydz.com" },
              { icon: <Handshake className="w-6 h-6 text-amber-500" />, bg: "bg-amber-50", title: "Partnerships", desc: "For agencies, integrations, and collaborations.", email: "partnerships@insydz.com" },
              { icon: <Briefcase className="w-6 h-6 text-teal-500" />, bg: "bg-teal-50", title: "Careers", desc: "For job-related inquiries and open positions.", email: "careers@insydz.com" },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col" style={{ boxShadow: "0 1px 8px 0 rgba(80,60,140,0.06)" }}>
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>{card.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5 flex-1">{card.desc}</p>
                <a href={`mailto:${card.email}`} className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 group-hover:gap-2 transition-all">{card.email} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — CONTACT FORM + SIDEBAR
      ══════════════════════════════════════════ */}
      <section id="contact-form-section" className="py-20 px-4" style={{ background: "#f4f4fa" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
            <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-10 border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-8">Fill this in and our team will get back to you shortly.</p>
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Message Received</h3>
                  <p className="text-gray-500 text-base">We'll get back to you within 24–48 business hours.</p>
                  <button onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", company: "", inquiry: "", message: "" }); }} className="mt-6 text-sm text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-2">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                      <input type="text" name="name" required value={formState.name} onChange={handleFormChange} placeholder="Rahul Sharma" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                      <input type="email" name="email" required value={formState.email} onChange={handleFormChange} placeholder="rahul@brand.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-gray-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Company / Brand</label>
                    <input type="text" name="company" value={formState.company} onChange={handleFormChange} placeholder="Your company or brand name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Inquiry Type <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select name="inquiry" required value={formState.inquiry} onChange={handleFormChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 appearance-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition bg-gray-50 cursor-pointer">
                        <option value="" disabled>Select inquiry type</option>
                        <option value="support">Support</option>
                        <option value="sales">Sales</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
                    <textarea name="message" required rows={5} value={formState.message} onChange={handleFormChange} placeholder="Describe your question or request in detail..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition resize-none bg-gray-50" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                    <button type="submit" id="contact-form-submit-btn" disabled={isSubmitting} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold px-7 py-3 rounded-full shadow-md transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed">
                      {isSubmitting ? "Sending..." : "Send Message →"}
                    </button>
                    <p className="text-xs text-gray-400 leading-relaxed">We typically respond within <span className="font-semibold text-gray-500">24–48 hours</span> on business days.</p>
                  </div>
                </form>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {[
                { icon: "📧", title: "Email Us", value: "contact@insydz.com", href: "mailto:contact@insydz.com", sub: "General enquiries" },
                { icon: "📍", title: "Registered Office", value: "New Delhi, India", href: null as string | null, sub: "Serving sellers nationwide" },
                { icon: "⏱️", title: "Response Time", value: "24–48 hours on business days", href: null as string | null, sub: null as string | null },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{item.title}</p>
                    {item.href ? <a href={item.href} className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">{item.value}</a> : <p className="text-sm font-bold text-gray-800">{item.value}</p>}
                    {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">We respect your privacy. Your information is never shared with third parties.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — FAQ
      ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Common Questions</h2>
            <p className="text-gray-500 text-base">Quick answers before you write in.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button id={`faq-toggle-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === i ? <Minus className="w-4 h-4 text-violet-500 flex-shrink-0" /> : <Plus className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-12 px-4" style={{ background: "#f4f4fa" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl px-8 py-8 shadow-xl" style={{ background: "linear-gradient(90deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)" }}>
            <div>
              <h3 className="text-xl font-black text-white mb-1">Have an idea or project?</h3>
              <p className="text-white/80 text-sm">Let's turn it into something amazing — talk to us before you commit.</p>
            </div>
            <a href="/pricing" id="cta-start-trial-btn" className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105">
              Start Free Trial →
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
