"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplorerHeroBannerProps {
  selectedSource: string;
}

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  path: string;
}

const JOURNEY_STEPS: StepItem[] = [
  {
    id: 1,
    title: "Find a Market",
    subtitle: "Explore high-potential categories",
    path: "/categories",
  },
  {
    id: 2,
    title: "Find a Product",
    subtitle: "Discover winning products",
    path: "/sales",
  },
  {
    id: 3,
    title: "Analyze Competition",
    subtitle: "Understand the market",
    path: "/explorer/white-space-finder",
  },
  {
    id: 4,
    title: "Calculate Profit",
    subtitle: "Check pricing & margins",
    path: "/explorer/profitability-optimizer",
  },
  {
    id: 5,
    title: "Launch",
    subtitle: "Go to market with confidence",
    path: "/keyword-intelligence",
  },
];

export default function ExplorerHeroBanner({
  selectedSource,
}: ExplorerHeroBannerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);

  // Dynamic User First Name or Fallback
  const firstName =
    user?.firstName || (user?.name ? user.name.split(" ")[0] : "Vikrant");

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Dynamic platform text
  const platformName =
    selectedSource === "flipkart"
      ? "Flipkart"
      : selectedSource === "both"
        ? "Ecommerce"
        : "Amazon";

  const handleStartGuidedJourney = () => {
    // Trigger existing SaaSTourGuide workflow
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-saas-guide"));
    }
  };

  const handleStepClick = (step: StepItem) => {
    setActiveStep(step.id);
    if (step.path) {
      router.push(step.path);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-sm overflow-hidden min-w-0 bg-white/70 dark:bg-slate-900/70">
      {/* ── TOP SECTION: Hero Greeting Banner ── */}
      <div className="relative px-6 sm:px-8 py-6 sm:py-6 lg:py-7 bg-gradient-to-r from-sky-100/70 via-blue-50/80 to-sky-100/90 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-800/90 border-b border-sky-200/50 dark:border-slate-800/80 overflow-hidden">
        {/* Background Soft Glow Accents */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-300/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 lg:gap-7 relative z-10">
          {/* Left Section: Greeting & Main Opportunity Heading */}
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 tracking-wide">
              <span>
                {getGreeting()}, {firstName}!
              </span>
              <span className="inline-block">👋</span>
            </p>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              Let's find your next{" "}
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                {platformName} opportunity.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed pt-0.5">
              We analyse real-time data to help you find profitable products,
              understand competition and make smarter decisions.
            </p>
          </div>

          {/* Center Illustration Icon (Amazon / Flipkart / Both) */}
          <div className="hidden lg:flex items-center justify-center shrink-0 px-2 select-none pointer-events-none">
            <img
              src={
                selectedSource === "both"
                  ? "/dashboard/flipkart-amazon-icon.svg"
                  : selectedSource === "flipkart"
                    ? "/dashboard/flipkart-icon.svg"
                    : "/dashboard/amazon-icon.svg"
              }
              alt={`${platformName} Icon`}
              className={cn(
                "w-auto object-contain drop-shadow-md transition-all duration-300",
                selectedSource === "both"
                  ? "h-26 sm:h-32 lg:h-36 max-w-[240px] scale-110"
                  : "h-20 sm:h-24 lg:h-28 max-w-[180px]"
              )}
            />
          </div>

          {/* Right Section: Guided Journey Card Box */}
          <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-md p-4 sm:p-4.5 rounded-2xl border border-white/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between shrink-0 w-full md:w-auto min-w-[220px] sm:min-w-[250px] lg:min-w-[270px]">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>New to {platformName} selling?</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Follow our 5-step guide to find and launch your first product.
              </p>
            </div>

            <Button
              onClick={handleStartGuidedJourney}
              className="mt-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs sm:text-sm py-2 px-4 h-9 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group w-full cursor-pointer"
            >
              <span>Start Guided Journey</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: 5-Step Guided Journey Pathway Bar ── */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-2.5">
          {JOURNEY_STEPS.map((step, idx) => {
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0 gap-2 sm:gap-2.5">
                <div
                  onClick={() => handleStepClick(step)}
                  className="group flex-1 flex items-center gap-2 sm:gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 min-w-0 bg-white/40 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-sky-300 dark:hover:border-slate-700 hover:shadow-xs"
                >
                  {/* Step Number Circle */}
                  <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 dark:group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-2xs">
                    {step.id}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate leading-tight text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Divider Chevron (desktop only) */}
                {idx < JOURNEY_STEPS.length - 1 && (
                  <ChevronRight className="hidden lg:block w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

