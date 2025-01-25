import { supabase } from '@/supabase';
import { User, Referral, Transaction, Admin } from '@/types/index';

// Implement request debouncing
const debounceMap = new Map<string, NodeJS.Timeout>();
const debounce = <T>(key: string, fn: () => Promise<T>, delay: number): Promise<T> => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key)!);
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(async () => {
      debounceMap.delete(key);
      resolve(await fn());
    }, delay);
    debounceMap.set(key, timeout);
  });
};

// Cache for user details
const userCache = new Map<string, { data: User; timestamp: number }>();
const USER_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Function to sign up a new user
export const signUpUser = async (
  email: string,
  password: string,
  fullname: string,
  referralCode?: string
): Promise<{ data: User | null; error: any }> => {
  try {
    const isAdmin = email.endsWith('@admin.com');

    // Create auth user first to get the ID
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullname,
          isAdmin,
        },
      },
    });

    if (signUpError) {
      return { data: null, error: signUpError };
    }

    if (!authData.user) {
      return { data: null, error: new Error('Failed to create auth user') };
    }

    // Insert user record with the auth ID
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        fullname,
        is_admin: isAdmin,
        balance: isAdmin ? 0 : 1000,
        task_balance: 0,
        referral_balance: 0,
        num_referrals: 0,
        num_tasks_done: 0,
        referral_code: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        is_vip: false,
      });

    if (userError) {
      return { data: null, error: userError };
    }

    // Fetch the created user separately
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select()
      .eq('id', authData.user.id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    return { data: userData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Function to log in a user
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from login');

    const userId = data.user.id;
    
    // Check cache first
    const cachedUser = userCache.get(userId);
    if (cachedUser && Date.now() - cachedUser.timestamp < USER_CACHE_DURATION) {
      return { user: cachedUser.data, error: null };
    }

    // Get user details
    const user = await getUserDetails(userId);
    if (!user) throw new Error('Failed to get user details');

    return { user, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { user: null, error };
  }
};

// Function to log out a user
export const logoutUser = async (): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear all caches on logout
    userCache.clear();
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error };
  }
};

// Function to fetch user details
export const getUserDetails = async (userId: string): Promise<User | null> => {
  // Check cache first
  const cachedUser = userCache.get(userId);
  if (cachedUser && Date.now() - cachedUser.timestamp < USER_CACHE_DURATION) {
    return cachedUser.data;
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!user) return null;

    // Cache the result
    userCache.set(userId, { data: user, timestamp: Date.now() });

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

// Function to update user details
export const updateUserDetails = async (
  userId: string,
  updates: Partial<User>
): Promise<{ data: User | null; error: any }> => {
  return await debounce(`update_user_${userId}`, async () => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!user) throw new Error('No user returned from update');

      // Update cache
      userCache.set(userId, { data: user, timestamp: Date.now() });

      return { data: user, error: null };
    } catch (error: any) {
      console.error('Error updating user details:', error);
      return { data: null, error };
    }
  }, 300); // 300ms debounce
};
