"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

export function BookDemoButton({ className, text = "Book a Demo" }: { className?: string, text?: string }) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#9333ea" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <button
      data-cal-namespace=""
      data-cal-link="yatharth007/30min"
      data-cal-config='{"layout":"month_view"}'
      className={className}
    >
      {text}
    </button>
  );
}
