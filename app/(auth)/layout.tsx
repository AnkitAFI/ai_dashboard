import { Toaster } from "@/components/ui/toaster";

// Isolated auth layout — does NOT use Navbar or Footer from marketing layout.
// Auth pages are standalone: centered, minimal, no site navigation.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100 dark:from-slate-950 dark:via-background dark:to-slate-950 text-foreground">
      {children}
      <Toaster />
    </div>
  );
}
