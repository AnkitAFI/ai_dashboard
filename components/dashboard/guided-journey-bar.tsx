"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

export default function GuidedJourneyBar({ selectedSource }: { selectedSource: string }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleStepClick = (step: StepItem) => {
    setActiveStep(step.id);
    if (step.path) {
      router.push(step.path);
    }
  };

  return (
    <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-slate-800/80 p-2.5 sm:p-3 shadow-xs min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 relative">
        {JOURNEY_STEPS.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isCompleted = step.id < activeStep;

          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(step)}
              className={cn(
                "group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all duration-200 border",
                isActive
                  ? "bg-sky-50/80 dark:bg-slate-800/90 border-blue-400/80 dark:border-blue-500 shadow-xs"
                  : "bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              )}
            >
              {/* Step Number Circle */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors shadow-2xs",
                  isActive
                    ? "bg-blue-600 text-white ring-2 ring-blue-100 dark:ring-blue-900/50"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                )}
              >
                {step.id}
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0 flex-1">
                <h4
                  className={cn(
                    "text-xs font-bold truncate leading-tight",
                    isActive
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                >
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">
                  {step.subtitle}
                </p>
              </div>

              {/* Step Separator Arrow (desktop only) */}
              {idx < JOURNEY_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10 font-bold text-xs pointer-events-none">
                  ›
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
