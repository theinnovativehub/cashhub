import { supabase } from '@/supabase';
import { showToast } from '@/utils/toast';

export const VIP_REFERRAL_BONUS = 800;
export const NORMAL_REFERRAL_BONUS = 500;
export const VIP_SIGNUP_BONUS = 1000;
export const REFERRER_VIP_BONUS = 2000;

export const upgradeToVip = async (userId: string, paymentRef: string, amount: number) => {
  try {
    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Create VIP bonus transaction
    const { error: bonusError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: VIP_SIGNUP_BONUS,
        type: 'vip_bonus',
        status: 'completed'
      });

    if (bonusError) throw bonusError;

    // Update user's VIP status and balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        is_vip: true,
        balance: (userData.balance || 0) + VIP_SIGNUP_BONUS
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Find who referred this user from the referrals table
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referred_id', userId)
      .single();

    if (referralError && referralError.code !== 'PGRST116') throw referralError;

    // Process referral bonus if user was referred
    if (referralData?.referrer_id) {
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, balance, referral_balance')
        .eq('id', referralData.referrer_id)
        .single();

      if (referrerError) throw referrerError;

      if (referrer) {
        // Give referrer the VIP bonus
        const { error: referrerBonusError } = await supabase
          .from('transactions')
          .insert({
            user_id: referrer.id,
            amount: REFERRER_VIP_BONUS,
            type: 'vip_bonus',
            status: 'completed'
          });

        if (referrerBonusError) throw referrerBonusError;

        // Update referrer's balances
        const { error: referrerUpdateError } = await supabase
          .from('users')
          .update({ 
            balance: (referrer.balance || 0) + REFERRER_VIP_BONUS,
            referral_balance: (referrer.referral_balance || 0) + REFERRER_VIP_BONUS
          })
          .eq('id', referrer.id);

        if (referrerUpdateError) throw referrerUpdateError;
      }
    }

    showToast.success('VIP membership activated successfully!');
    return true;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};
