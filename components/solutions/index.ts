/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ Shared Solutions Components                                                │
 * │                                                                            │
 * │ All reusable components and constants for the /solutions pages.            │
 * │ Update once here → changes reflect across ALL solution pages.              │
 * │                                                                            │
 * │ Components:                                                                │
 * │   - FAQAccordion:    Configurable FAQ accordion (card or default variant)  │
 * │   - TrustBadges:     "No credit card · Setup in 2 min · Cancel anytime"   │
 * │   - FadeInStyles:    Shared @keyframes fade-in animation CSS              │
 * │   - StickyMobileCTA: Fixed bottom mobile CTA bar                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

export { default as FAQAccordion } from "./faq-accordion";
export type { FAQItem, FAQAccordionProps } from "./faq-accordion";
export { default as TrustBadges } from "./trust-badges";
export { default as FadeInStyles } from "./fade-in-styles";
export { default as StickyMobileCTA } from "./sticky-mobile-cta";
