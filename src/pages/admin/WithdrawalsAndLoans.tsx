import { useState } from "react";
import { Withdrawal } from "@/types/index";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/utils/toast";
import { useAdminWithdrawals, useAdminLoans, useAdminMutations } from "@/hooks/queries";
import { Loader2Icon } from "lucide-react";

export const WithdrawalsAndLoans = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'loans'>('withdrawals');
  const pageSize = 20;

  const { 
    data: withdrawalsData, 
    isLoading: isLoadingWithdrawals 
  } = useAdminWithdrawals(currentPage, pageSize);

  const { 
    data: loansData, 
    isLoading: isLoadingLoans 
  } = useAdminLoans(currentPage, pageSize);

  const { 
    updateWithdrawalStatus, 
    updateLoanStatus 
  } = useAdminMutations();

  const handleLoanStatusUpdate = async (loanId: string, status: 'approved' | 'rejected') => {
    try {
      await updateLoanStatus.mutateAsync({ loanId, status });
      showToast.success(`Loan ${status} successfully`);
    } catch (error) {
      console.error("Error updating loan status:", error);
      showToast.error("Failed to update loan status");
    }
  };

  const handleWithdrawalStatusUpdate = async (withdrawalId: string, status: 'approved' | 'rejected') => {
    try {
      await updateWithdrawalStatus.mutateAsync({ withdrawalId, status });
      showToast.success(`Withdrawal ${status} successfully`);
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
      showToast.error("Failed to update withdrawal status");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderWithdrawalsTable = () => {
    if (isLoadingWithdrawals) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {withdrawalsData?.data.map((withdrawal: Withdrawal) => (
            <tr key={withdrawal.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{withdrawal.user?.fullname}</div>
                <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatAmount(withdrawal.amount)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  withdrawal.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : withdrawal.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {withdrawal.status === 'pending' && (
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleWithdrawalStatusUpdate(withdrawal.id, 'approved')}
                      disabled={updateWithdrawalStatus.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {updateWithdrawalStatus.isPending ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button
                      onClick={() => handleWithdrawalStatusUpdate(withdrawal.id, 'rejected')}
                      disabled={updateWithdrawalStatus.isPending}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      {updateWithdrawalStatus.isPending ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderLoansTable = () => {
    if (isLoadingLoans) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2Icon className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loansData?.data.map((loan: any) => (
            <tr key={loan.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{loan.user?.fullname}</div>
                <div className="text-sm text-gray-500">{loan.user?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatAmount(loan.amount)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  loan.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : loan.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(loan.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {loan.status === 'pending' && (
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleLoanStatusUpdate(loan.id, 'approved')}
                      disabled={updateLoanStatus.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {updateLoanStatus.isPending ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        'Approve'
                      )}
                    </Button>
                    <Button
                      onClick={() => handleLoanStatusUpdate(loan.id, 'rejected')}
                      disabled={updateLoanStatus.isPending}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      {updateLoanStatus.isPending ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <Tabs defaultValue="withdrawals" className="w-full" onValueChange={(value) => {
          setActiveTab(value as 'withdrawals' | 'loans');
          setCurrentPage(1);
        }}>
          <div className="border-b border-gray-200 px-6 py-4">
            <TabsList>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="withdrawals">
            <div className="overflow-x-auto">
              {renderWithdrawalsTable()}
            </div>
          </TabsContent>

          <TabsContent value="loans">
            <div className="overflow-x-auto">
              {renderLoansTable()}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default WithdrawalsAndLoans;
