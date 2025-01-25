import { NavLink, Outlet } from "react-router-dom";
import { User, Shield } from "lucide-react";
import clsx from "clsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const categories = [
  { id: "profile", name: "Profile", icon: User },
  { id: "security", name: "Security", icon: Shield },
];

export const Settings = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {categories.map((category) => (
              <NavLink
                key={category.id}
                to={`/settings/${category.id}`}
                className={({ isActive }) =>
                  clsx(
                    "w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors",
                    isActive
                      ? "bg-purple-200 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  )
                }
              >
                <category.icon className="h-5 w-5 mr-3" />
                {category.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="settings-content flex-1 border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] rounded-xl shadow-sm p-6 max-w-3xl">
          <ErrorBoundary fallback={
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We encountered an error while loading your settings. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reload page
              </button>
            </div>
          }>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Settings;
