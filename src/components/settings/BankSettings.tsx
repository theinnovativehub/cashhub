import { useState, useEffect } from "react";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CreditCard, Building2, User, Loader2Icon } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useBankDetails, useUpdateBankDetails } from "@/hooks/queries";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Fidelity Bank",
  "First Bank",
  "First City Monument Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export const BankSettings = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: bankDetails } = useBankDetails(user?.id || '');
  const { mutate: updateBank, isLoading: loading } = useUpdateBankDetails();

  const [bankData, setBankData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  useEffect(() => {
    if (bankDetails) {
      setBankData({
        accountName: bankDetails.account_name || "",
        accountNumber: bankDetails.account_number || "",
        bankName: bankDetails.bank_name || "",
      });
    }
  }, [bankDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBankData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);

    try {
      // Validate inputs
      if (!bankData.accountName.trim()) {
        throw new Error("Account name is required");
      }
      if (!bankData.accountNumber.trim()) {
        throw new Error("Account number is required");
      }
      if (!bankData.bankName) {
        throw new Error("Bank name is required");
      }
      if (bankData.accountNumber.length !== 10) {
        throw new Error("Account number must be 10 digits");
      }
      if (!/^\d+$/.test(bankData.accountNumber)) {
        throw new Error("Account number must contain only digits");
      }

      updateBank({
        userId: user.id,
        data: {
          account_name: bankData.accountName.trim(),
          account_number: bankData.accountNumber.trim(),
          bank_name: bankData.bankName,
        }
      }, {
        onSuccess: () => {
          showToast.success("Bank details updated successfully!");
        },
        onError: (err: any) => {
          console.error("Error updating bank details: ", err);
          setError(err instanceof Error ? err.message : "Failed to update bank details");
        }
      });
    } catch (err) {
      console.error("Error updating bank details: ", err);
      setError(err instanceof Error ? err.message : "Failed to update bank details");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bank Details</h2>
        <p className="text-muted-foreground">
          Update your bank account information for withdrawals
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Account Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="accountName"
              className="pl-10 w-full rounded-xl font-semibold text-gray-900 dark:text-white"
              placeholder="John Doe"
              value={bankData.accountName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Account Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="accountNumber"
              className="pl-10 w-full rounded-xl font-semibold text-gray-900 dark:text-white"
              placeholder="0123456789"
              value={bankData.accountNumber}
              onChange={handleChange}
              disabled={loading}
              maxLength={10}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Bank Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <select
              name="bankName"
              className="pl-10 w-full h-10 rounded-xl font-semibold text-gray-900 dark:text-white bg-background border border-input"
              value={bankData.bankName}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Bank</option>
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <Button
          onClick={handleSave}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BankSettings;
