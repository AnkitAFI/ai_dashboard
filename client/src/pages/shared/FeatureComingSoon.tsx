import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Rocket, ArrowLeft, Sparkles } from "lucide-react";

export default function FeatureComingSoon() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      {/* <div className="relative mb-8">
        <div className="absolute -inset-4 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
          <Rocket className="w-16 h-16 text-orange-500 animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
        </div>
      </div> */}

      <h1 className="text-4xl font-bold text-[#003366] mb-4 tracking-tight">
        Feature Coming Soon!
      </h1>

      <p className="text-lg text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
        We're currently building something amazing for you. This feature will be available in our next major update. Stay tuned!
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Link href="/dashboard">
          <a>
            <Button size="lg" className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white rounded-2xl px-8 shadow-lg hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </a>
        </Link>
        <Button variant="outline" size="lg" className="rounded-2xl border-orange-500/50 text-orange-600 hover:bg-orange-50">
          Get Notified
        </Button>
      </div>

    </div>
  );
}
