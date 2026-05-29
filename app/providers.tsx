"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider delayDuration={300}>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}


