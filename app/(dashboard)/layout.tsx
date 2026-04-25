"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import FiltersPanel from "@/components/dashboard/filters-panel";
import { FiltersProvider, useFilters } from "@/components/dashboard/FiltersContext";
import { X } from "lucide-react";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { filters } = useFilters();
  const selectedSource = filters.table || "amazon";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden transform transition-transform shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
        <DashboardHeader 
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)} 
          onFilterToggle={() => setShowFilters(prev => !prev)}
          showFilters={showFilters}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 sm:px-6 py-4 border border-sky-100 rounded-xl sm:rounded-2xl 
            bg-white/70 backdrop-blur-xl mx-4 sm:mx-6 mb-4 sm:mb-6 transition-all duration-300">
            <FiltersPanel selectedSource={selectedSource} />
          </div>
        )}

        <main className="px-4 sm:px-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-6">
          {children}
          
          {/* Disclaimer */}
          <div className="mt-1 pt-1 border-t border-slate-100">
            <p className="text-[10px] text-center text-slate-400 leading-tight opacity-60">
              <span className="font-medium">Disclaimer:</span> The data and insights presented in this dashboard are for informational purposes only.
              While we strive for accuracy, we cannot guarantee the completeness or reliability of the information.
              Please verify critical data independently before making business decisions.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <FiltersProvider>
      <DashboardShell>{children}</DashboardShell>
    </FiltersProvider>
  );
}
