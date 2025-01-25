import { useEffect, useState } from "react";
import { Withdrawal, User } from "@/types/index";
import { updateWithdrawalStatus } from "@/supabase/adminService";
import { showToast } from "@/utils/toast";
import { useAuth } from "@/supabase_hooks/useAuth";
import { supabase } from "@/supabase";

export const WithdrawalControl = () => {
  const { user: admin } = useAuth();
  const [withdrawals, setWithdrawals] = useState<(Withdrawal & { user: User })[]>([]);
  const [_loading, setLoading] = useState(false);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const { data: withdrawalData, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          user:users!withdrawals_user_id_fkey (
            id,
            fullname,
            email,
            balance
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setWithdrawals(withdrawalData);
    } catch (error) {
      showToast.error("Failed to load withdrawal requests");
      console.error("Failed to load withdrawal requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    if (!admin?.id) return;
    
    try {
      await updateWithdrawalStatus(withdrawalId, status, admin.id);
      loadWithdrawals();
      showToast.success(`Withdrawal request ${status}`);
    } catch (error) {
      showToast.error("Failed to update withdrawal status");
      console.error("Failed to update withdrawal status:", error);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Withdrawal Requests</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {withdrawal.user?.fullname || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {withdrawal.user?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ₦{withdrawal.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    withdrawal.status === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : withdrawal.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {withdrawal.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(withdrawal.id, 'approved')}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(withdrawal.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalControl;
