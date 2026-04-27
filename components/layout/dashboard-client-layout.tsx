"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { DashboardHeader } from "@/client/src/components/layout/DashboardHeader";
import { FiltersProvider } from "@/components/dashboard/filters-context";
import { AlertProvider } from "@/components/dashboard/alert-context";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import FiltersPanel from "@/components/dashboard/filters-panel";
import AlertDetailsDialog from "@/components/dashboard/alert-details-dialog";
import { usePathname } from "next/navigation";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, toggle } = useSidebar();
  const [showFilters, setShowFilters] = useState(false);
  const pathname = usePathname();

  // Pages that have their own custom header
  const PAGES_WITH_CUSTOM_HEADER = [
    "/product/",
    "/category-products/",
    "/sentiment-analysis/",
    "/seller/my-watchlist",
    "/seller/ai-advisor",
    "/product-tracker/history",
    "/seller/price-comparison",
    "/seller/review-comparison",
    "/seller/keyword-gap"
  ];

  const hasCustomHeader = PAGES_WITH_CUSTOM_HEADER.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      {/* Sidebar - Desktop: fixed, Mobile: handled by state */}
      <Sidebar 
        isMobileOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {!hasCustomHeader && (
          <DashboardHeader 
            onMobileMenuToggle={toggle} 
            onFilterToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
          />
        )}
        
        <main className={`flex-1 ${hasCustomHeader ? 'p-0' : 'px-4 sm:px-6'}`}>
          {!hasCustomHeader && showFilters && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <FiltersPanel />
            </div>
          )}
          <div className={hasCustomHeader ? 'p-4 sm:p-6 lg:p-8' : ''}>
            {children}
          </div>
        </main>
      </div>
      <AlertDetailsDialog />
    </div>
  );
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <FiltersProvider>
      <AlertProvider>
        <SidebarProvider>
          <DashboardLayoutContent>
            {children}
          </DashboardLayoutContent>
        </SidebarProvider>
      </AlertProvider>
    </FiltersProvider>
  );
}
