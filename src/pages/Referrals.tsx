import { useState, useEffect } from "react";
import { Users, ArrowUpRight, Copy, Link } from "lucide-react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { useReferralStats, useReferralsList } from "@/hooks/queries";
import { showToast } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralStats {
  total_referrals: number;
  referral_balance: number;
  referral_code: string;
  total_earnings: number;
}

interface UserDetails {
  userId: string;
  fullname: string;
  email: string;
  createdAt: Date;
}

interface ReferredUser {
  fullname: string;
  email: string;
  created_at: string;
}

interface Referral {
  id: string;
  referred_user: ReferredUser;
}

interface ReferralWithUser {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
  reward: number;
  user: {
    id: string;
    fullname: string;
    email: string;
    created_at: string;
  };
}

export const Referrals = () => {
  const { user } = useAuth();
  
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useReferralStats(user?.id || '');

  const {
    data: referrals = [],
    isLoading: referralsLoading
  } = useReferralsList(user?.id || '');
  
  const isLoading = statsLoading || referralsLoading;
  const referralLink = `${window.location.origin}/signup?ref=${stats?.referral_code}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success('Copied to clipboard!');
    } catch (err) {
      showToast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-sm rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Total Referrals</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats?.total_referrals || 0}</p>  <p className="text-sm dark:text-[var(--text-primary-dark)] text-[var(--text-primary-light)]">
              Active referrals in the system
            </p>
          </div>
          
          <div className="p-6 rounded-xl border border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-sm rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">Earnings</h3>
            </div>
            <p className="text-2xl font-bold mt-2">₦{stats?.total_earnings || 0}</p>
            <p className="text-sm dark:text-[var(--text-primary-dark)] text-[var(--text-primary-light)]">
              Total earnings from referrals
            </p>
          </div>

          <div className="p-6 rounded-xl border border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-sm rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">Referral Code</h3>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xl font-bold">{stats?.referral_code || '-'}</p>
              <button
                onClick={() => copyToClipboard(stats?.referral_code || '')}
                className="p-1 hover:bg-muted rounded"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with friends
            </p>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="rounded-xl border border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Your Referral Link</h3>
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </button>
          </div>
          <p className="w-full sm:flex-1 px-3 py-2 bg-[var(--background-secondary-light)] dark:bg-gary-200 border rounded-md text-sm sm:text-md text-gray-600 overflow-x-auto">{referralLink}</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : stats?.total_referrals === 0 ? (
          <p className="text-center text-[var(--text-primary)] dark:text-[var(--text-primary)] py-8">
            You haven't referred anyone yet. Share your referral link to get started!
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-[var(--text-primary)] dark:text-[var(--text-primary)]">Your Referrals</h3>
              <p className="text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                Total Earnings: ₦{stats?.total_earnings || 0}
              </p>
            </div>
            <div className="rounded-xl border border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow flex flex-col gap-2 p-5">
              {referrals.map((referral: ReferralWithUser) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 glass-card"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{referral.user.fullname}</span>
                    <span className="text-sm text-muted-foreground">{referral.user.email}</span>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(referral.user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">₦{referral.reward}</span>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
