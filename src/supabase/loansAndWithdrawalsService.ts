import { supabase } from '@/supabase';
import { Loan, Withdrawal } from '@/types';
import { showToast } from '@/utils/toast';

const MIN_WITHDRAWAL_AMOUNT = 1000; // ₦1,000
const MAX_WITHDRAWAL_AMOUNT = 100000; // ₦100,000
const MAX_WITHDRAWALS_PER_DAY = 3;
const WITHDRAWAL_COOLDOWN_HOURS = 8;

// Helper function to check withdrawal limits
const checkWithdrawalLimits = async (userId: string, amount: number) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hoursAgo = new Date(now.getTime() - (WITHDRAWAL_COOLDOWN_HOURS * 60 * 60 * 1000));

  // Check amount limits
  if (amount < MIN_WITHDRAWAL_AMOUNT) {
    throw new Error(`Minimum withdrawal amount is ₦${MIN_WITHDRAWAL_AMOUNT}`);
  }
  if (amount > MAX_WITHDRAWAL_AMOUNT) {
    throw new Error(`Maximum withdrawal amount is ₦${MAX_WITHDRAWAL_AMOUNT}`);
  }

  // Check daily limit
  const { data: todayWithdrawals, error: countError } = await supabase
    .from('withdrawals')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', today);

  if (countError) throw countError;
  if (todayWithdrawals && todayWithdrawals.length >= MAX_WITHDRAWALS_PER_DAY) {
    throw new Error(`You have reached the maximum number of withdrawals (${MAX_WITHDRAWALS_PER_DAY}) for today`);
  }

  // Check cooldown
  const { data: recentWithdrawal, error: cooldownError } = await supabase
    .from('withdrawals')
    .select('created_at')
    .eq('user_id', userId)
    .gt('created_at', hoursAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cooldownError && cooldownError.code !== 'PGRST116') throw cooldownError;
  if (recentWithdrawal) {
    const hoursLeft = WITHDRAWAL_COOLDOWN_HOURS - Math.floor((now.getTime() - new Date(recentWithdrawal.created_at).getTime()) / (1000 * 60 * 60));
    throw new Error(`Please wait ${hoursLeft} hours before making another withdrawal`);
  }
};

// Loan Services
export const createLoanApplication = async (userId: string, amount: number): Promise<Loan | null> => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .insert([
        {
          user_id: userId,
          amount,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating loan application:', error);
    showToast.error('Failed to create loan application');
    return null;
  }
};

export const getLoansByUserId = async (userId: string): Promise<Loan[]> => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user loans:', error);
    showToast.error('Failed to fetch loans');
    return [];
  }
};

export const getAllLoans = async (page = 1, pageSize = 20): Promise<{ data: Loan[], totalCount: number, totalPages: number }> => {
  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true });

    // Then get paginated data
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        users!loans_user_id_fkey (
          id,
          fullname,
          email,
          is_vip,
          balance
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { 
      data: data || [], 
      totalCount: totalCount || 0, 
      totalPages: Math.ceil((totalCount || 0) / pageSize) 
    };
  } catch (error) {
    console.error('Error fetching all loans:', error);
    showToast.error('Failed to fetch loans');
    return { data: [], totalCount: 0, totalPages: 0 };
  }
};

export const updateLoanStatus = async (loanId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('loans')
      .update({ 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', loanId);

    if (error) throw error;
    
    if (status === 'approved') {
      // Get loan details to create transaction
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loan) {
        // Create transaction record
        await supabase
          .from('transactions')
          .insert([
            {
              user_id: loan.user_id,
              amount: loan.amount,
              type: 'loan',
              status: 'approved',
              related_record_id: loanId,
              created_at: new Date().toISOString(),
            }
          ]);

        // Update user balance
        await supabase
          .rpc('increment_user_balance', {
            user_id: loan.user_id,
            amount: loan.amount
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating loan status:', error);
    showToast.error('Failed to update loan status');
    return false;
  }
};

interface LoanRequest {
  user_id: string;
  amount: number;
  reason: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface WithdrawalRequest {
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export const createLoanRequest = async (request: LoanRequest) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .insert([{
        user_id: request.user_id,
        amount: request.amount,
        reason: request.reason,
        bank_name: request.bank_name,
        account_number: request.account_number,
        account_name: request.account_name,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getLoanHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        id,
        amount,
        reason,
        status,
        created_at,
        bank_name,
        account_number,
        account_name
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Withdrawal Services
export const isWithdrawalEnabled = async (): Promise<boolean> => {
  try {
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('name', 'withdrawals_enabled')
      .single();

    return settings?.value === 'true';
  } catch (error) {
    console.error('Error checking withdrawal status:', error);
    return false;
  }
};

export const createWithdrawalRequest = async (
  userId: string, 
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
): Promise<Withdrawal | null> => {
  try {
    // Check if withdrawals are enabled
    const enabled = await isWithdrawalEnabled();
    if (!enabled) {
      showToast.error('Withdrawals are currently disabled');
      return null;
    }

    // Check withdrawal limits
    await checkWithdrawalLimits(userId, amount);

    // Get user's current balance
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (!user || user.balance < amount) {
      showToast.error('Insufficient balance');
      return null;
    }

    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Create transaction record
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: -amount, // Negative amount for withdrawal
          type: 'withdrawal',
          status: 'pending',
          related_record_id: withdrawal.id,
          created_at: new Date().toISOString(),
        }
      ]);

    return withdrawal;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    showToast.error('Failed to create withdrawal request');
    return null;
  }
};

export const getWithdrawalsByUserId = async (userId: string): Promise<Withdrawal[]> => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user withdrawals:', error);
    showToast.error('Failed to fetch withdrawals');
    return [];
  }
};

export const getAllWithdrawals = async (page = 1, pageSize = 20): Promise<{ data: Withdrawal[], totalCount: number, totalPages: number }> => {
  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('withdrawals')
      .select('*', { count: 'exact', head: true });

    // Then get paginated data
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        users!fk_withdrawals_user (
          id,
          fullname,
          email,
          is_vip,
          balance
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { 
      data: data || [], 
      totalCount: totalCount || 0, 
      totalPages: Math.ceil((totalCount || 0) / pageSize) 
    };
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    showToast.error('Failed to fetch withdrawals');
    return { data: [], totalCount: 0, totalPages: 0 };
  }
};

export const updateWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status })
      .eq('id', withdrawalId);

    if (error) throw error;

    // Get withdrawal details
    const { data: withdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (withdrawal) {
      // Update the transaction status
      await supabase
        .from('transactions')
        .update({ status })
        .eq('related_record_id', withdrawalId)
        .eq('type', 'withdrawal');

      if (status === 'approved') {
        // Deduct from user balance
        await supabase
          .rpc('decrement_user_balance', {
            user_id: withdrawal.user_id,
            amount: withdrawal.amount
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    showToast.error('Failed to update withdrawal status');
    return false;
  }
};

export const createWithdrawalRequestNew = async (request: WithdrawalRequest) => {
  try {
    // Check withdrawal limits
    await checkWithdrawalLimits(request.user_id, request.amount);

    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: request.user_id,
        amount: request.amount,
        bank_name: request.bank_name,
        account_number: request.account_number,
        account_name: request.account_name,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getWithdrawalHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        id,
        amount,
        status,
        created_at,
        bank_name,
        account_number,
        account_name
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};
