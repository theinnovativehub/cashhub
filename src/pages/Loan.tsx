import React, { useState } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { showToast } from "@/utils/toast";
import { Loader2Icon } from "lucide-react";
import { useLoanHistory, useCreateLoan } from "@/hooks/queries";

export const LoanPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const { 
    data: loanHistory = [], 
    isLoading: loadingHistory 
  } = useLoanHistory(user?.id || '');

  const { 
    mutate: createLoan, 
    isPending: submitting 
  } = useCreateLoan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast.error('Please log in to continue');
      return;
    }

    if (!user.isVip) {
      showToast.error('Only VIP users can request loans');
      return;
    }

    try {
      const amount = Number(formData.amount);
      
      // Validate amount
      if (amount < 1000 || amount > 100000) {
        showToast.error('Loan amount must be between ₦1,000 and ₦100,000');
        return;
      }

      createLoan({
        user_id: user.id,
        amount,
        reason: formData.reason,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
      }, {
        onSuccess: () => {
          showToast.success("Loan application submitted successfully!");
          // Reset form
          setFormData({
            amount: "",
            reason: "",
            accountName: "",
            accountNumber: "",
            bankName: "",
          });
        },
        onError: (error: any) => {
          console.error("Error submitting loan application:", error);
          showToast.error("Failed to submit loan application");
        }
      });
    } catch (error) {
      console.error("Error submitting loan application:", error);
      showToast.error("Failed to submit loan application");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loadingHistory) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Loan Request</h1>

        {!user?.isVip && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg p-4 mb-6">
            Only VIP users can request loans. Upgrade your account to access this feature.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loan Request Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Request a Loan</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (₦)</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    min="1000"
                    max="100000"
                    required
                    disabled={!user?.isVip || submitting}
                    className="text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                  />
                  <p className="text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] mt-1">Min: ₦1,000 | Max: ₦100,000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reason for Loan</label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain why you need this loan"
                    required
                    disabled={!user?.isVip || submitting}
                    className="text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Enter bank name"
                    required
                    disabled={!user?.isVip || submitting}
                    className="text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    required
                    disabled={!user?.isVip || submitting}
                    className="text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Name</label>
                  <Input
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Enter account name"
                    required
                    disabled={!user?.isVip || submitting}
                    className="text-[var(--text-primary)] dark:text-[var(--text-primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!user?.isVip || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Loan Request'
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Loan History */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Loan History</h2>
              <div className="space-y-4">
                {loanHistory.length === 0 ? (
                  <p className="text-gray-500">No loan history available</p>
                ) : (
                  loanHistory.map((loan: any, index: number) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{formatAmount(loan.amount)}</p>
                          <p className="text-sm text-gray-500">{loan.reason}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              loan.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : loan.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(loan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanPage;
