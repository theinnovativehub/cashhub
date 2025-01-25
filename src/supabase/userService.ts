import { supabase } from '@/supabase';
import { showToast } from '@/utils/toast';
import { Transaction } from '@/types';

export const getUserBalance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance, task_balance, referral_balance')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getUserReferrals = async (userId: string) => {
  try {
    // First get the count
    const { count, error: countError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    if (countError) throw countError;

    // Then get the referral details with foreign key reference
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_user:users!referrals_referred_user_id_fkey(
          id,
          fullname,
          email,
          created_at
        )
      `)
      .eq('referrer_id', userId);

    if (error) throw error;

    return {
      referrals: data || [],
      referrals_count: count || 0
    };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getRecentTransactions = async (userId: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Transaction[];
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getEarningsBreakdown = async (userId: string) => {
  try {
    // Get all transactions for the user
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (txError) throw txError;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance, task_balance, referral_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Calculate totals
    const withdrawals = transactions
      ?.filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;

    const taskEarnings = transactions
      ?.filter(tx => tx.type === 'task')
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return {
      totalBalance: userData.balance || 0,
      breakdown: {
        tasks: userData.task_balance || 0,
        referrals: userData.referral_balance || 0,
        signupBonus: 1000, // Default signup bonus
        withdrawals: withdrawals
      },
      recentTransactions: transactions?.slice(0, 5) || []
    };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getTopEarners = async (page = 1, pageSize = 20) => {
  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false);

    // Then get paginated data
    const { data, error } = await supabase
      .from('users')
      .select('id, fullname, email, balance, referral_balance, task_balance')
      .eq('is_admin', false)  // Exclude admin users
      .order('balance', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { data, totalCount, totalPages: Math.ceil((totalCount || 0) / pageSize) };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: {
  fullname?: string;
  username?: string;
}) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);

    if (error) throw error;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const updateBankDetails = async (userId: string, data: {
  account_name: string;
  account_number: string;
  bank_name: string;
}) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        account_name: data.account_name,
        account_number: data.account_number,
        bank_name: data.bank_name
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const updateNotificationPreferences = async (userId: string, preferences: {
  task_updates: boolean;
  new_tasks: boolean;
  payment_updates: boolean;
  referral_updates: boolean;
}) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .update(preferences)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select(`
        bank_name,
        account_name,
        account_number,
        task_updates,
        new_tasks,
        payment_updates,
        referral_updates
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};
