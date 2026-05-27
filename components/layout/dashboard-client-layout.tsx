"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FiltersProvider } from "@/components/dashboard/filters-context";
import { AlertProvider } from "@/components/dashboard/alert-context";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import FiltersPanel from "@/components/dashboard/filters-panel";
import AlertDetailsDialog from "@/components/dashboard/alert-details-dialog";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, toggle } = useSidebar();
  const [showFilters, setShowFilters] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const isDashboardPage = pathname === "/dashboard" || pathname === "/overview" || pathname === "/";
  const hasCustomHeader = !isDashboardPage;

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
        
        {hasCustomHeader && (
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-md border-b border-sky-100 shadow-sm sticky top-0 z-20">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-sky-100 transition-colors text-sky-900"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Insydz Logo" className="w-7 h-7 object-contain rounded-md" />
              <span className="font-bold text-sm text-[#003366] tracking-tight">Insydz</span>
            </div>
            <div className="w-9" /> {/* balance/spacer */}
          </header>
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
        {/* Disclaimer Footer */}
        <footer className="mt-auto px-4 sm:px-6 py-4 border-t border-sky-100">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            <span className="font-medium text-gray-500">Disclaimer:</span>{" "}
            The data and insights presented in this dashboard are for informational purposes only.
            While we strive for accuracy, we cannot guarantee the completeness or reliability of
            the information. Please verify critical data independently before making business decisions.
          </p>
        </footer>
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



