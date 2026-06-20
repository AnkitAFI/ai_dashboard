"use client";

import { Play, ExternalLink, LucideIcon } from "lucide-react";

interface VideoButtonProps {
  /** Button label. Default: "Watch video guide" */
  label?: string;
  /** YouTube or any video URL. Default: "https://www.youtube.com" */
  href?: string;
  /** Override the left icon */
  icon?: LucideIcon;
  /** Extra Tailwind classes */
  className?: string;
  onClick?: () => void;
}

/**
 * VideoButton — CTA button that opens a video (YouTube etc.) in a new tab.
 *
 * @example
 * <VideoButton />
 *
 * @example
 * <VideoButton label="See it in action" href="https://youtube.com/watch?v=xyz" />
 */
export function VideoButton({
  label = "Watch video guide",
  href = "https://www.youtube.com",
  icon: Icon = Play,
  className = "",
  onClick,
}: VideoButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-3 px-5 py-3 rounded-xl",
        "bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30",
        "text-white text-sm font-semibold",
        "transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        className,
      ].join(" ")}
    >
      {/* Play icon in a circle — mirrors the design in the screenshot */}
      <span className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3" />
      </span>
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
    </a>
  );
}

export default VideoButton;
