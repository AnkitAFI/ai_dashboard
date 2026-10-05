import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

// Isolated auth layout — does NOT use Navbar or Footer from marketing layout.
// Auth pages are standalone: centered, minimal, no site navigation.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100 dark:from-slate-950 dark:via-background dark:to-slate-950 text-foreground">
      <Script id="openai-pixel-auth" strategy="afterInteractive">
        {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"Dz9tBctDJhRqtPEES1YJiZ",debug:true});`}
      </Script>
      {children}
      <Toaster />
    </div>
  );
}
