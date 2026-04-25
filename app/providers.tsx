"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
// We will need to migrate AuthProvider from App.tsx eventually,
// but for now we import it. Wait, AuthProvider uses wouter! We must refactor AuthProvider to use Next.js router.
// Let's hold off on AuthProvider in the root if it uses wouter.
// Actually, marketing pages don't need AuthProvider if they are purely static, but it's used globally.
