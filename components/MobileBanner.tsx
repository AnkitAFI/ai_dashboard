"use client";

import { useState, useEffect } from "react";
import { X, Monitor } from "lucide-react";

export function MobileBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const runCycle = () => {
      showTimeout = setTimeout(() => {
        setIsVisible(false);
        
        hideTimeout = setTimeout(() => {
          setIsVisible(true);
          runCycle();
        }, 1.5 * 60 * 1000); // 1.5 minutes
      }, 20 * 1000); // 20 seconds
    };

    runCycle();

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="md:hidden fixed top-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-purple-100/50 p-3 rounded-2xl z-[99999] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-3 flex-1">
        <div className="bg-purple-50 p-2 rounded-xl shrink-0">
          <Monitor className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-[13px] font-medium leading-snug text-gray-700">
          For the best dashboard experience, we recommend using Insydz on Laptop/desktop/Tab.
        </p>
      </div>
      <button 
        onClick={() => setIsDismissed(true)}
        className="p-1.5 ml-1 hover:bg-gray-100 rounded-full transition-colors shrink-0 text-gray-400 hover:text-gray-700 self-start mt-0.5"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}
