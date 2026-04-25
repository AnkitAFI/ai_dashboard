// Isolated auth layout — does NOT use Navbar or Footer from marketing layout.
// Auth pages are standalone: centered, minimal, no site navigation.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900">
      {children}
    </div>
  );
}
