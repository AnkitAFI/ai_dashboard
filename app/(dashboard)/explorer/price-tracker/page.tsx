"use client";

import React, { Suspense } from "react";
import { PctDashboard } from "./_components/PctDashboard";
import { Loader2 } from "lucide-react";

export default function PriceTrackerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <PctDashboard />
    </Suspense>
  );
}
