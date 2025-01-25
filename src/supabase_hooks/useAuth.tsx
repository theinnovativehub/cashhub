import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/index';
import { loginUser, logoutUser, signUpUser, getUserDetails } from '@/supabase/authService';
import { supabase } from '@/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

type AuthUser = User & {
  isAdmin: boolean;
  isVip: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullname: string, referralCode?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEY = 'auth_user_cache';
const SESSION_CACHE_KEY = 'auth_session_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const SESSION_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Initialize from cache if available
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const processUser = useCallback((userData: User | null): AuthUser | null => {
    if (!userData) return null;

    const processedUser: AuthUser = {
      ...userData,
      isAdmin: userData.email.endsWith('@admin.com'),
      isVip: userData.is_vip,
    };
    
    // Cache the processed user with metadata
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: processedUser,
      timestamp: Date.now()
    }));
    
    return processedUser;
  }, []);

  const handleAuthUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!authUser) {
      setUser(null);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(SESSION_CACHE_KEY);
      setLoading(false);
      return;
    }

    try {
      // Check session cache first
      const sessionCache = localStorage.getItem(SESSION_CACHE_KEY);
      if (sessionCache) {
        const { data, timestamp } = JSON.parse(sessionCache);
        if (Date.now() - timestamp < SESSION_CACHE_DURATION) {
          setUser(data);
          setLoading(false);
          return;
        }
        localStorage.removeItem(SESSION_CACHE_KEY);
      }

      const userData = await getUserDetails(authUser.id);
      if (!userData) {
        throw new Error('Failed to fetch user details');
      }
      const processedUser = processUser(userData);
      setUser(processedUser);

      // Cache the session data
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        data: processedUser,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser(null);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(SESSION_CACHE_KEY);
    } finally {
      setLoading(false);
    }
  }, [processUser]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      // Check session cache first
      const sessionCache = localStorage.getItem(SESSION_CACHE_KEY);
      if (sessionCache) {
        const { data, timestamp } = JSON.parse(sessionCache);
        if (Date.now() - timestamp < SESSION_CACHE_DURATION) {
          if (mounted) {
            setUser(data);
            setLoading(false);
          }
          return;
        }
        localStorage.removeItem(SESSION_CACHE_KEY);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        handleAuthUser(session?.user ?? null);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        handleAuthUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthUser]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: authUser, error } = await loginUser(email, password);
      if (error) throw error;
      if (!authUser) throw new Error('No user returned from login');
      setUser(processUser(authUser));
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullname: string, referralCode?: string) => {
    setLoading(true);
    try {
      const { data: userData, error } = await signUpUser(email, password, fullname, referralCode);
      if (error) throw error;
      if (!userData) throw new Error('No user data returned from signup');

      const processedUser = processUser(userData);
      setUser(processedUser);
      
      // Cache the user data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: processedUser,
        timestamp: Date.now()
      }));

      return processedUser;
    } catch (error: any) {
      console.error('Signup error:', error);
      setUser(null);
      localStorage.removeItem(CACHE_KEY);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await logoutUser();
      if (error) throw error;
      setUser(null);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(SESSION_CACHE_KEY);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
