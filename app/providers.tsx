"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nClientProvider } from "@/lib/i18n-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { GoogleProvider } from "@/components/google-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nClientProvider>
          <GoogleProvider>
          <TooltipProvider delayDuration={300}>
              {children}
            </TooltipProvider>
          </GoogleProvider>
      </I18nClientProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


