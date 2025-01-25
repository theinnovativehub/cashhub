import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/supabase_hooks/useAuth";
import {
  Home,
  Users,
  DollarSign,
  Award,
  Settings,
  FileText,
  Gift,
  CreditCard,
  LogOut,
ShoppingBag
} from "react-feather";
import { FaCrown } from "react-icons/fa";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ mobile, onClose }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isAdmin = user?.isAdmin;

  const navigation = [
    { name: "Dashboard", href: "/overview", icon: Home },
    { name: "Tasks", href: "/tasks", icon: FileText },
    { name: "Top Earners", href: "/topearners", icon: DollarSign },
    { name: "Earnings", href: "/earnings", icon: Award },
    { name: "Referrals", href: "/referrals", icon: Gift },
    { name: "Loans", href: "/loan", icon: CreditCard },
    { name: "Withdraw", href: "/withdraw", icon: ShoppingBag },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navigation.push({ name: "Admin", href: "/admin", icon: Users });
  }

  const baseClasses = `h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
    ${mobile ? 'w-full' : 'w-64'} flex flex-col`;

  return (
    <div className={baseClasses}>
      {/* Logo - Only show on desktop */}
      {/* {!mobile && (
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/icons/logo.png" alt="CashHub" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">CashHub</span>
          </Link>
        </div>
      )} */}

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.email}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              {user?.isVip && (
                <div className="flex items-center gap-1">
                  <FaCrown className="text-yellow-500" size={12} />
                  <span>VIP Member</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${
                  isActive
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${
                    isActive
                      ? "text-purple-500 dark:text-purple-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-white"
                  }
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={signOut}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white group"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-white" />
          Sign out
        </button>
      </div>
    </div>
  );
};
