"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

/**
 * InfoTip — click/tap to toggle a small popover explanation.
 * Works on desktop AND mobile (no hover required).
 * Uses Radix Popover (Portal) so it never gets clipped by overflow-hidden containers.
 */
export function InfoTip({ text, isDark }: { text: string; isDark?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <span onClick={(e) => e.stopPropagation()} className="inline-flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`ml-1 rounded-full p-0.5 transition-colors shrink-0 ${
              open
                ? isDark
                  ? "text-sky-400 bg-sky-900/30"
                  : "text-sky-600 bg-sky-100"
                : isDark
                ? "text-slate-500 hover:text-slate-300"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label="More info"
          >
            <Info className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="center"
          sideOffset={6}
          className={`w-52 rounded-xl px-3 py-2.5 text-xs shadow-xl border text-center leading-relaxed ${
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-200"
              : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          {text}
        </PopoverContent>
      </Popover>
    </span>
  );
}
