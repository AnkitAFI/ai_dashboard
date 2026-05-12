"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface FAQItem {
  id?: string;
  q: string;
  a: string;
}

export interface FAQAccordionProps {
  faqs: FAQItem[];
  /**
   * Accent color used for hover backgrounds, expanded icon color, and answer background.
   * Supports: "orange" | "blue" | "cyan" | "purple"
   */
  accentColor?: "orange" | "blue" | "cyan" | "purple";
  /**
   * Style variant:
   * - "default": border-2 border-gray-200, bg-white, font-semibold question, ChevronDown rotates
   * - "card":    border-2 border-gray-100 bg-gray-50, font-bold question, ChevronDown/ChevronRight swap, shadow-sm
   */
  variant?: "default" | "card";
}

// ─── Color Maps ─────────────────────────────────────────────────────────────────

const accentStyles = {
  orange: {
    hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-800/50",
    hoverBorder: "hover:border-orange-400",
    iconColor: "text-orange-500",
    answerBg: "bg-orange-50/30 dark:bg-orange-900/10",
    answerBorder: "border-gray-50 dark:border-gray-800",
  },
  blue: {
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
    hoverBorder: "",
    iconColor: "text-blue-600",
    answerBg: "bg-white dark:bg-gray-900",
    answerBorder: "border-gray-100 dark:border-gray-800",
  },
  cyan: {
    hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-700/50",
    hoverBorder: "hover:border-cyan-300",
    iconColor: "text-cyan-500",
    answerBg: "bg-gray-50 dark:bg-gray-700/30",
    answerBorder: "",
  },
  purple: {
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
    hoverBorder: "",
    iconColor: "text-purple-600",
    answerBg: "bg-white dark:bg-gray-900",
    answerBorder: "border-gray-100 dark:border-gray-800",
  },
};

// ─── "card" variant (used by amazon-sellers, ecommerce-agencies, solutions-index) ─

function CardFAQItem({
  faq,
  isExpanded,
  onToggle,
  accent,
}: {
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  accent: "orange" | "blue" | "cyan" | "purple";
}) {
  const styles = accentStyles[accent];

  // amazon-sellers style card FAQ
  if (accent === "orange") {
    return (
      <div className={`bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden ${styles.hoverBorder} transition-all shadow-sm`}>
        <button
          onClick={onToggle}
          className={`w-full px-6 py-5 flex items-center justify-between text-left ${styles.hoverBg} transition-colors gap-4`}
        >
          <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg leading-relaxed">{faq.q}</span>
          {isExpanded
            ? <ChevronDown className={`w-5 h-5 ${styles.iconColor} flex-shrink-0`} />
            : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          }
        </button>
        {isExpanded && (
          <div className={`px-6 pb-6 ${styles.answerBg} border-t ${styles.answerBorder}`}>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-5 font-medium">{faq.a}</p>
          </div>
        )}
      </div>
    );
  }

  // ecommerce-agencies & solutions-index style card FAQ
  return (
    <div className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden ${styles.hoverBorder} transition-all`}>
      <button
        onClick={onToggle}
        className={`w-full px-6 py-5 flex items-center justify-between text-left ${styles.hoverBg} transition-colors`}
      >
        <span className="font-bold text-gray-900 dark:text-white pr-4 text-lg">{faq.q}</span>
        {isExpanded
          ? <ChevronDown className={`w-5 h-5 ${styles.iconColor} flex-shrink-0`} />
          : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        }
      </button>
      {isExpanded && (
        <div className={`px-6 pb-5 ${styles.answerBg}`}>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── "default" variant (used by flipkart-sellers, brand-managers) ────────────

function DefaultFAQItem({
  faq,
  accent,
}: {
  faq: FAQItem;
  accent: "orange" | "blue" | "cyan" | "purple";
}) {
  const [open, setOpen] = useState(false);
  const styles = accentStyles[accent];

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-6 py-5 text-left bg-white dark:bg-gray-900 ${styles.hoverBg} transition-colors`}
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
        <ChevronDown className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`px-6 pb-5 ${styles.answerBg} border-t ${styles.answerBorder}`}>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-4">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FAQAccordion({
  faqs,
  accentColor = "orange",
  variant = "default",
}: FAQAccordionProps) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  if (variant === "card") {
    return (
      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const id = faq.id || `faq-${i}`;
          return (
            <CardFAQItem
              key={id}
              faq={faq}
              isExpanded={expandedFaq === id}
              onToggle={() => setExpandedFaq(expandedFaq === id ? null : id)}
              accent={accentColor}
            />
          );
        })}
      </div>
    );
  }

  // "default" variant — each FAQ manages its own state
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <DefaultFAQItem
          key={faq.id || `faq-${i}`}
          faq={faq}
          accent={accentColor}
        />
      ))}
    </div>
  );
}
