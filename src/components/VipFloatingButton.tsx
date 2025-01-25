import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '@/supabase_hooks/useAuth';
import VipMembershipPopup from './VipMembershipPopup';

export const VipFloatingButton: React.FC = () => {
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Don't show button if user is not logged in, is VIP, or is admin
  if (!user || user.is_vip || user.is_admin) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 "
        style={{ zIndex: 9999 }}
      >
        <Crown className="h-6 w-6" />
        <span className="font-semibold">Upgrade to VIP</span>
      </button>

      <VipMembershipPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default VipFloatingButton;
