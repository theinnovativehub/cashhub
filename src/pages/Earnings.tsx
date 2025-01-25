import { useAuth } from "@/supabase_hooks/useAuth";
import { Wallet, ArrowUpRight, ArrowDownRight, Loader2Icon } from "lucide-react";
import { useEarningsBreakdown } from "@/hooks/queries";
import { Transaction } from "@/types";

export const Earnings = () => {
  const { user } = useAuth();
  const { 
    data: earnings, 
    isLoading, 
    isError 
  } = useEarningsBreakdown(user?.id || '');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 min-h-screen flex items-center justify-center">
        Failed to load earnings data. Please try refreshing the page.
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="text-center text-gray-500 min-h-screen flex items-center justify-center">
        No earnings data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Total Balance Card */}
      <div className="rounded-xl border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow p-2">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-md font-medium">Total Balance</h3>
          <Wallet className="h-8 w-8 text-green-500" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-3xl font-bold">{formatAmount(earnings.totalBalance)}</div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="rounded-xl border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] p-2 shadow">
        <div className="p-6">
          <h3 className="font-semibold mb-4 text-xl">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-md">
              <span>Tasks Earnings</span>
              <span className="font-medium text-xl">{formatAmount(earnings.breakdown.tasks)}</span>
            </div>
            <div className="flex justify-between items-center text-md">
              <span>Referral Earnings</span>
              <span className="font-medium text-xl">{formatAmount(earnings.breakdown.referrals)}</span>
            </div>
            <div className="flex justify-between items-center text-md">
              <span>Signup Bonus</span>
              <span className="font-medium text-xl">{formatAmount(earnings.breakdown.signupBonus)}</span>
            </div>
            {user?.isVip !== undefined && user?.isVip && (
              <div className="flex justify-between items-center text-md">
                <span>VIP Bonus</span>
                <span className="font-medium text-xl">{formatAmount(1000)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-red-500 text-md">
              <span>Total Withdrawals</span>
              <span className="font-medium text-xl">{formatAmount(earnings.breakdown.withdrawals)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border dark:border-[var(--card-border)] bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] text-[var(--text-primary)] dark:text-[var(--text-primary)] p-2 shadow">
        <div className="p-6">
          <h3 className="font-semibold mb-4 text-xl">Recent Transactions</h3>
          <div className="space-y-4">
            {earnings.recentTransactions.map((transaction: Transaction, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {transaction.type === 'withdrawal' ? (
                    <ArrowUpRight className="text-red-500" />
                  ) : (
                    <ArrowDownRight className="text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-medium ${transaction.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}{formatAmount(transaction.amount)}
                </span>
              </div>
            ))}
            {earnings.recentTransactions.length === 0 && (
              <div className="text-center text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
