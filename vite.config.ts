import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@headlessui/react", "@heroicons/react"],
          "vendor-utils": ["date-fns", "react-hot-toast"],
          "feature-auth": [
            "./src/components/auth/LoginForm.tsx",
            "./src/components/auth/SignupForm.tsx",
            "./src/components/auth/AuthLayout.tsx",
          ],
          "feature-dashboard": [
            "./src/components/dashboard/DashboardLayout.tsx",
            "./src/components/dashboard/DashboardHeader.tsx",
            "./src/components/dashboard/DashboardSidebar.tsx",
          ],
          "feature-admin": [
            "./src/components/admin/AdminDashboard.tsx",
            "./src/components/admin/TaskManagement.tsx",
            "./src/components/admin/UserManagement.tsx",
          ],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
