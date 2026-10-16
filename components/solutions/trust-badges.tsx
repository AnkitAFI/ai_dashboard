/**
 * Shared trust badges footer used across all solution pages.
 * Update text here once → reflected everywhere.
 */

interface TrustBadgesProps {
  /**
   * Text color theme:
   * - "light": white text on colored backgrounds (used in gradient CTA sections)
   * - "dark":  black text on white/light backgrounds (used in regular sections)
   */
  theme?: "light" | "dark";
}

export default function TrustBadges({ theme = "light" }: TrustBadgesProps) {
  if (theme === "dark") {
    return (
      <p className="text-black/80 mt-6 text-sm flex items-center justify-center gap-2 flex-wrap">
        <span>✓ No credit card required</span>
        <span className="text-black/40">·</span>
        <span>✓ Setup in 2 minutes</span>
        <span className="text-black/40">·</span>
        <span>✓ Cancel anytime</span>
        <span className="text-black/40">·</span>
        <span className="font-medium text-black inline-flex items-center gap-1.5">
          <img src="/hawk.png" alt="Hawk Eye ISO 27001" className="h-4 w-auto object-contain rounded-[2px]" />
          <span>✓ ISO 27001:2022 Certified</span>
        </span>
      </p>
    );
  }

  return (
    <p className="text-white/80 mt-6 text-sm flex items-center justify-center gap-2 flex-wrap">
      <span>✓ No credit card required</span>
      <span className="text-white/40">·</span>
      <span>✓ Setup in 2 minutes</span>
      <span className="text-white/40">·</span>
      <span>✓ Cancel anytime</span>
      <span className="text-white/40">·</span>
      <span className="font-medium text-sky-200 inline-flex items-center gap-1.5">
        <img src="/hawk.png" alt="Hawk Eye ISO 27001" className="h-4 w-auto object-contain rounded-[2px] bg-white/90 p-0.5" />
        <span>✓ ISO 27001:2022 Certified</span>
      </span>
    </p>
  );
}
