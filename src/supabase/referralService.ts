import { supabase } from '@/supabase';
import { showToast } from '@/utils/toast';

export const getReferrals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referrer_id,
        referred_id,
        created_at,
        reward
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, fullname, email, is_vip, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

export const getReferralStats = async (userId: string) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_balance, num_referrals, referral_code')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('reward')
      .eq('referrer_id', userId);

    if (referralsError) throw referralsError;

    const totalEarnings = referrals?.reduce((sum, ref) => sum + (ref.reward || 0), 0) || 0;

    return {
      total_referrals: user?.num_referrals || 0,
      referral_balance: user?.referral_balance || 0,
      referral_code: user?.referral_code || '',
      total_earnings: totalEarnings
    };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};
