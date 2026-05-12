"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Sticky mobile CTA bar that appears at the bottom of the screen on mobile devices.
 * Used across solution pages. Update the CTA text or destination once → reflected everywhere.
 */

interface StickyMobileCTAProps {
  /** Button label text */
  label: string;
  /** Navigation destination (defaults to "/signup") */
  href?: string;
  /** Gradient className for the button (defaults to orange→red) */
  gradient?: string;
  /** Border color className for the bar (defaults to orange-300) */
  borderColor?: string;
}

export default function StickyMobileCTA({
  label,
  href = "/signup",
  gradient = "from-orange-500 to-red-500",
  borderColor = "border-orange-300 dark:border-orange-700",
}: StickyMobileCTAProps) {
  const router = useRouter();

  return (
    <>
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 ${borderColor} p-4 shadow-2xl z-40`}
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Button
          onClick={() => router.push(href)}
          className={`w-full bg-gradient-to-r ${gradient} text-white font-black py-4 rounded-full shadow-xl text-base`}
        >
          {label}
        </Button>
      </div>
      {/* Spacer to prevent content from being hidden behind the sticky CTA */}
      <div className="lg:hidden h-20" />
    </>
  );
}
