"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { DashboardHeader } from "@/client/src/components/layout/DashboardHeader";
import { FiltersProvider } from "@/components/dashboard/filters-context";
import { AlertProvider } from "@/components/dashboard/alert-context";
import FiltersPanel from "@/components/dashboard/filters-panel";
import AlertDetailsDialog from "@/components/dashboard/alert-details-dialog";

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <FiltersProvider>
      <AlertProvider>
        <div className="min-h-screen bg-slate-50">
          {/* Sidebar - Desktop: fixed, Mobile: handled by state */}
          <Sidebar 
            isMobileOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
          
          <div className="lg:ml-64 flex flex-col min-h-screen">
            <DashboardHeader 
              onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              onFilterToggle={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
            />
            
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {showFilters && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <FiltersPanel />
                </div>
              )}
              {children}
            </main>
          </div>
          <AlertDetailsDialog />
        </div>
      </AlertProvider>
    </FiltersProvider>
  );
}
