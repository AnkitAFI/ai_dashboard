import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Lock, Award } from "lucide-react";

interface IsoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "logo" | "pill" | "compact" | "card" | "seal";
  theme?: "light" | "dark" | "auto";
  showIaf?: boolean;
}

/**
 * Official Hawk Eye & EGAC Certified ISO 27001:2022 Client Mark
 */
export function IsoLogo({
  className = "h-8 w-auto",
  alt = "Hawk Eye Certified ISO 27001:2022",
}: {
  className?: string;
  theme?: "light" | "dark" | "auto";
  alt?: string;
}) {
  return (
    <img
      src="/hawk.png"
      alt={alt}
      className={cn("object-contain shrink-0 select-none rounded-[2px]", className)}
      loading="lazy"
    />
  );
}

/**
 * Certification Logo Mark Badge
 */
export function IafLogo({ className = "h-4" }: { className?: string }) {
  return (
    <img
      src="/hawk.png"
      alt="Hawk Eye Certified ISO 27001:2022"
      className={cn("h-4 w-auto object-contain inline-block shrink-0 rounded-[2px]", className)}
      loading="lazy"
    />
  );
}

export function IsoBadge({
  variant = "pill",
  theme = "auto",
  showIaf = true,
  className,
  ...props
}: IsoBadgeProps) {
  if (variant === "logo") {
    return <IsoLogo className={className} />;
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-xs",
          className
        )}
        title="ISO/IEC 27001:2022 Certified Information Security"
        {...props}
      >
        <img src="/hawk.png" alt="ISO 27001" className="h-3.5 w-auto object-contain shrink-0 rounded-[2px]" />
        <span>ISO 27001:2022</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xs",
          className
        )}
        {...props}
      >
        <img src="/hawk.png" alt="Hawk Eye ISO 27001" className="h-10 w-auto object-contain shrink-0 rounded-[3px] bg-white p-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-xs sm:text-sm">ISO/IEC 27001:2022</span>
          </div>
          <p className="text-[11px] text-slate-300 dark:text-slate-400 truncate">
            Information Security Management System
          </p>
        </div>
      </div>
    );
  }

  // Default: Pill variant
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-white border border-blue-500/30 shadow-xs backdrop-blur-xs transition-all hover:border-blue-400/60",
        className
      )}
      title="ISO/IEC 27001:2022 Certified Information Security System"
      {...props}
    >
      <img src="/hawk.png" alt="ISO 27001" className="h-4 w-auto object-contain shrink-0 rounded-[2px] bg-white p-0.5" />
      <span className="font-semibold tracking-tight text-[11px] sm:text-xs">
        ISO 27001:2022 Certified
      </span>
    </div>
  );
}
