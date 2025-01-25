import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UsersIcon, CheckCircleIcon, StarIcon, BanknoteIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/supabase";
import { showToast } from "@/utils/toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserStats } from "@/supabase/adminService";

interface AdminStats {
  total_users: number;
  vip_users: number;
  total_tasks_completed: number;
  total_balance: number;
  average_balance: number;
  average_tasks_per_user: number;
}

interface AdminSetting {
  name: string;
  value: string;
}

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getUserStats,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 2,
  });

  const { data: withdrawalSetting } = useQuery<AdminSetting | null, Error>({
    queryKey: ['admin_settings', 'withdrawals_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('name, value')
        .eq('name', 'withdrawals_enabled')
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Default to empty stats if data is not available
  const displayStats = stats || {
    total_users: 0,
    vip_users: 0,
    total_tasks_completed: 0,
    total_balance: 0,
    average_balance: 0,
    average_tasks_per_user: 0,
  };

  useEffect(() => {
    if (withdrawalSetting) {
      setWithdrawalsEnabled(withdrawalSetting.value === 'true');
    }
  }, [withdrawalSetting]);

  const updateWithdrawalSettingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          name: 'withdrawals_enabled',
          value: enabled.toString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_settings', 'withdrawals_enabled'] });
    }
  });

  const handleWithdrawalToggle = async (enabled: boolean) => {
    try {
      await updateWithdrawalSettingMutation.mutateAsync(enabled);
      showToast.success(`Withdrawals ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating withdrawal settings:', error);
      showToast.error('Failed to update withdrawal settings');
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: displayStats.total_users,
      icon: UsersIcon,
      color: "bg-blue-500",
      link: "/admin/users"
    },
    {
      title: "VIP Users",
      value: displayStats.vip_users,
      icon: StarIcon,
      color: "bg-yellow-500",
      link: "/admin/users"
    },
    {
      title: "Tasks Completed",
      value: displayStats.total_tasks_completed,
      icon: CheckCircleIcon,
      color: "bg-green-500",
      link: "/admin/tasks"
    },
    {
      title: "Total Balance",
      value: displayStats.total_balance,
      icon: BanknoteIcon,
      color: "bg-red-500",
      link: "/admin/withdrawals-loans"
    }
  ];

  // Show loading state while fetching initial data
  if (statsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24 mt-4" />
              <Skeleton className="h-8 w-full mt-4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center text-red-600">
          Failed to load admin statistics. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Switch
            checked={withdrawalsEnabled}
            onCheckedChange={(checked) => {
              setWithdrawalsEnabled(checked);
              updateWithdrawalSettingMutation.mutate(checked);
            }}
          />
          <span className="text-sm">Enable Withdrawals</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <stat.icon className={`h-8 w-8 ${stat.color} text-white p-1.5 rounded-lg`} />
              </div>
              <p className="text-2xl font-bold">
                {stat.title.includes('Balance') ? '₦' : ''}
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : '0'}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
