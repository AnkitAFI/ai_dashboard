"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nClientProvider } from "@/lib/i18n-provider";
import { GoogleProvider } from "@/components/google-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nClientProvider>
        <GoogleProvider>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </GoogleProvider>
      </I18nClientProvider>
    </ThemeProvider>
  );
}


