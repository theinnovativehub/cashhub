import React, { useState } from "react";
import { Wallet, CreditCard, Loader2Icon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "@/supabase_hooks/useAuth";
import { showToast } from "@/utils/toast";
import { useWithdrawalStatus, useCreateWithdrawal } from "@/hooks/queries";

export const Withdraw = () => {
  const { user } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<any>({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const { 
    data: withdrawalsEnabled = false, 
    isLoading: checkingStatus 
  } = useWithdrawalStatus();

  const { 
    mutate: createWithdrawal, 
    isPending: submitting 
  } = useCreateWithdrawal();

  // const formatAmount = (amount: number) => {
  //   return new Intl.NumberFormat("en-NG", {
  //     style: "currency",
  //     currency: "NGN",
  //     minimumFractionDigits: 2,
  //   }).format(amount);
  // };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!withdrawalsEnabled) {
        throw new Error("Withdrawals are currently disabled by the administrator");
      }

      if (!user?.id) {
        throw new Error("You must be logged in to make a withdrawal");
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (amount < 100) {
        throw new Error("Minimum withdrawal amount is ₦100");
      }

      const userBalance = user?.balance || 0;
      if (amount > userBalance) {
        throw new Error("Insufficient balance");
      }

      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
        throw new Error("Please fill in all bank details");
      }

      await createWithdrawal({
        userId: user.id,
        amount,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName
      });

      setWithdrawAmount("");
      setBankDetails({
        accountName: "",
        accountNumber: "",
        bankName: "",
      });
      showToast.success("Withdrawal request submitted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process withdrawal";
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8 dark:text-gray-200">
          <Wallet className="w-8 h-8 mr-4 text-indigo-500" />
          <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        </div>

        {!withdrawalsEnabled ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
            Withdrawal is available for VIP members every <b className="dark:text-white text-black">Saturday</b> <br/>
            Withdrawal for regular members is every <b className="dark:text-white text-black">1st  - 5th</b> of the month
            </p>
          </div>
        ): (
        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2 dark:text-gray-300">
                Amount to Withdraw
              </label>
              <Input
                id="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium mb-2 dark:text-gray-300">
                Bank Name
              </label>
              <Input
                id="bankName"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="Enter bank name"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium mb-2 dark:text-gray-300">
                Account Number
              </label>
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter account number"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="accountName" className="block text-sm font-medium mb-2 dark:text-gray-300">
                Account Name
              </label>
              <Input
                id="accountName"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                placeholder="Enter account name"
                required
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={!withdrawalsEnabled || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Withdraw Funds
              </>
            )}
          </Button>
        </form>) }
      </div>
    </div>
  );
};

export default Withdraw;
