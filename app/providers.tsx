"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nClientProvider } from "@/lib/i18n-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nClientProvider>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </I18nClientProvider>
    </ThemeProvider>
  );
}


