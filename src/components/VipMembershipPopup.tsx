import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { useAuth } from '@/supabase_hooks/useAuth';
import { showToast } from '@/utils/toast';
import { X } from 'lucide-react';
import { FlutterWaveButton } from 'flutterwave-react-v3';
import closePaymentModal from 'flutterwave-react-v3/src/closeModal';
import { upgradeToVip } from '@/supabase/vipService';

interface VipMembershipPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIP_COST = 1000;
const pk = "FLWPUBK-d39c3c9469242518f8a6138d6e3f2991-X";

export const VipMembershipPopup: React.FC<VipMembershipPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!user || !isOpen) return null;

  const config = {
    public_key: pk,
    tx_ref: `tx_${Date.now()}`,
    amount: VIP_COST,
    currency: 'NGN',
    payment_options: 'mobilemoney,card,ussd',
    customer: {
      email: user.email,
      phone_number: '',
      name: user.email,
    },
    customizations: {
      title: 'CashHub VIP Membership',
      description: 'Upgrade to VIP Membership',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
    meta: {
      userId: user.id,
      type: 'vip_subscription'
    },
    text: 'Pay Now',
    callback: async (response: any) => {
      closePaymentModal();
      
      try {
        if (!response || response.status !== 'completed') {
          showToast.error('Payment was not successful');
          return;
        }

        setIsProcessing(true);

        // Use the VIP service to handle the upgrade
        const success = await upgradeToVip(
          user.id,
          response.transaction_id || response.id,
          VIP_COST
        );

        if (success) {
          onClose();
        }
      } catch (error: any) {
        console.error('Error processing payment:', error);
        showToast.error('Failed to activate VIP membership. Please contact support if payment was deducted.');
      } finally {
        setIsProcessing(false);
      }
    },
    onClose: () => {
      closePaymentModal();
      setIsProcessing(false);
      showToast.error('Payment cancelled');
    },
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="w-[350px] h-[400px] md:w-[500px] md:h-[600px] bg-cover bg-center relative rounded-xl overflow-hidden"
             style={{backgroundImage: 'url(/images/banner.jpg)'}}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6">
            <div className="w-full md:w-1/2 ml-auto">
              {isProcessing ? (
                <Button disabled className="w-full">Processing...</Button>
              ) : (
                <div className="w-full">
                  <FlutterWaveButton
                    {...config}
                    className="w-full !bg-yellow-500 hover:!bg-yellow-600 !text-white font-semibold !px-5 !py-4 !rounded-xl cursor-pointer transition-all duration-200 !border-0 !outline-none focus:!outline-none active:!scale-95"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default VipMembershipPopup;