import { useAuth } from "@/supabase_hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('redirectPath', location.pathname + location.search);
    }
  }, [user, location]);

  if (!user) {
    return (
      <Navigate
        to='/login'
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};
