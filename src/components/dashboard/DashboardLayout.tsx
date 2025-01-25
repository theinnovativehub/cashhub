import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header - Fixed */}
      <div className="lg:hidden">
        <DashboardHeader />
      </div>

      <div className="flex">
        {/* Sidebar - Fixed on desktop, hidden on mobile */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Desktop Header - Fixed */}
          <div className="hidden lg:block fixed top-0 right-0 left-64 z-40 bg-gray-50 dark:bg-gray-900">
            <DashboardHeader />
          </div>

          {/* Content - Scrollable */}
          <div className="pt-16 lg:pt-20">
            <main className="px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
