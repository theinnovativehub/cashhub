import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { auth } from '@/firebase';
import { requestLoan } from '@/services/loanService';
import { isVipUser } from '@/services/userService';
import { showToast } from '@/utils/toast';

export const LoanRequest = () => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkVipStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          showToast.error('Please log in to continue');
          return;
        }
        const vipStatus = await isVipUser(user.uid);
        setIsVip(vipStatus);
      } catch (error) {
        console.error('Error checking VIP status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkVipStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      showToast.error('Please log in to continue');
      return;
    }

    try {
      setLoading(true);
      const numericAmount = parseFloat(amount);
      await requestLoan(user.uid, numericAmount);
      setAmount('');
      showToast.success('Loan request submitted successfully');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to submit loan request');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isVip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">VIP Access Only</h1>
            <p className="text-gray-600 mb-6">
              Sorry, loan requests are only available to VIP users. Upgrade your account to VIP to access this feature.
            </p>
            <Button variant="outline" asChild>
              <a href="/upgrade">Upgrade to VIP</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Request a Loan</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Loan Amount (₦)"
              type="number"
              min="1000"
              max="100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (₦1,000 - ₦100,000)"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum: ₦1,000 | Maximum: ₦100,000
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Loan Terms</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Loan duration: 30 days</li>
              <li>• Interest rate: 5% monthly</li>
              <li>• Early repayment allowed</li>
              <li>• Late payment fee: 1% per day</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit Loan Request'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>Note: All loan requests are subject to review and approval. We will notify you once your request has been processed.</p>
        </div>
      </Card>
    </div>
  );
};
