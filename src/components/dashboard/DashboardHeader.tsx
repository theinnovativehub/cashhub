
import { LogOut } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
// import { Button } from "../ui/Button";
import { FaCrown } from "react-icons/fa";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 lg:left-64 h-16 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            

            {/* Logo - Only visible on desktop */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/cashhub.jpg" alt="CashHub" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">CashHub</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            
            
            {/* User menu */}
            <div className="relative flex items-center justify-between gap-5">
              {user?.isVip && (
                <div className="flex items-center gap-2 text-white text-sm">
                  <FaCrown className="text-yellow-500" size={16} title="VIP Member" />
                </div>
              )}
              <ThemeToggle />
           
              <button
                type="button"
                onClick={() => signOut()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 dark:text-white text-sm"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
              <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open menu</span>
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile sidebar */}
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <img src="/icons/logo.png" alt="CashHub" className="h-8 w-8" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">CashHub</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DashboardSidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
