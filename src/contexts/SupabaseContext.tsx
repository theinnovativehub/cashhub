import { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/supabase';
import { AuthProvider } from '@/supabase_hooks/useAuth';

// Create context
const SupabaseContext = createContext(supabase);

// Provider component
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SupabaseContext.Provider>
  );
};

// Hook for using supabase client
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
