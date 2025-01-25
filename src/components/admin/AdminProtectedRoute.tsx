import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { useAuth } from "@/supabase_hooks/useAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
