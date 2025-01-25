import { useTopEarners } from "@/hooks/queries";
// import { useAuth } from "@/supabase_hooks/useAuth";
import { Loader2Icon } from "lucide-react";
import { TopEarner } from "@/types";

export const TopEarners = () => {
  // const { user } = useAuth();
  const { 
    data: topEarnersResponse, 
    isLoading, 
    isError 
  } = useTopEarners();

  const topEarners = topEarnersResponse?.data || [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Generate avatar color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500'
    ];
    const index = username.length % colors.length;
    return colors[index];
  };

  // Get rank-based styling
  const getRankStyle = (index: number) => {
    switch(index) {
      case 0:
        return {
          number: 'text-yellow-500 dark:text-yellow-400',
          background: 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800',
          border: 'border-yellow-100 dark:border-yellow-900/30'
        };
      case 1:
        return {
          number: 'text-gray-400 dark:text-gray-300',
          background: 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800',
          border: 'border-gray-200 dark:border-gray-700'
        };
      case 2:
        return {
          number: 'text-amber-600 dark:text-amber-500',
          background: 'bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800',
          border: 'border-amber-100 dark:border-amber-900/30'
        };
      default:
        return {
          number: 'text-gray-400 dark:text-gray-500',
          background: 'bg-white dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  // Get initials from username
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Truncate email for mobile view
  const truncateEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length > 10) {
      return `${username.slice(0, 8)}...@${domain}`;
    }
    return email;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 min-h-screen flex items-center justify-center">
        Failed to load top earners. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Top Earners</h1>
        
        <div className="grid gap-4 max-w-3xl mx-auto">
          {topEarners.map((earner: TopEarner, index: number) => {
            const avatarColor = getAvatarColor(earner.fullname);
            const rankStyle = getRankStyle(index);
            return (
              <div
                key={earner.id}
                className={`relative p-4 rounded-xl border ${rankStyle.border} ${rankStyle.background}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${rankStyle.number} text-2xl font-bold min-w-[2rem]`}>
                    #{index + 1}
                  </div>
                  <div className={`flex-shrink-0 w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                    {getInitials(earner.fullname)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {earner.fullname}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {truncateEmail(earner.email)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(earner.balance)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Earnings
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopEarners;