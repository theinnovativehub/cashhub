import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { getUserDetails, updateUserDetails } from '@/supabase/authService';
import { 
  getUserBalance, 
  getUserReferrals, 
  getRecentTransactions, 
  getTopEarners, 
  getEarningsBreakdown,
  updateUserProfile,
  updateBankDetails,
  updateNotificationPreferences,
  getUserSettings
} from '@/supabase/userService';
import { 
  getUserCompletedTasks, 
  getAvailableTasks, 
  hasUserCompletedTask,
  completeTask,
  getTaskDetails,
  getUserTaskHistory,
  getUserTaskEarnings
} from '@/supabase/taskService';
import { getReferralStats, getReferrals, getUser } from '@/supabase/referralService';
import { 
  getAllUsers,
  getUserStats,
  updateUserVipStatus,
} from '@/supabase/adminService';
import {
  getAllWithdrawals,
  getAllLoans,
  updateWithdrawalStatus as updateWithdrawalStatusService,
  updateLoanStatus as updateLoanStatusService,
  createLoanRequest,
  getWithdrawalHistory,
  getLoanHistory,
  isWithdrawalEnabled
} from '@/supabase/loansAndWithdrawalsService';
import { User, Task } from '@/types';

// User Queries
export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => getUserDetails(userId),
    enabled: !!userId,
  });
};

export const useUserTasks = (userId: string) => {
  return useQuery({
    queryKey: ['userTasks', userId],
    queryFn: () => getUserCompletedTasks(userId),
    enabled: !!userId,
  });
};

export const useUserTransactions = (userId: string) => {
  return useQuery({
    queryKey: ['userTransactions', userId],
    queryFn: () => getRecentTransactions(userId),
    enabled: !!userId,
  });
};

export const useUserBalance = (userId: string) => {
  return useQuery({
    queryKey: ['userBalance', userId],
    queryFn: () => getUserBalance(userId),
    enabled: !!userId,
  });
};

export const useUserReferrals = (userId: string) => {
  return useQuery({
    queryKey: ['userReferrals', userId],
    queryFn: () => getUserReferrals(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    // cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data is cached
  });
};

export const useReferralStats = (userId: string) => {
  return useQuery({
    queryKey: ['referralStats', userId],
    queryFn: () => getReferralStats(userId),
    enabled: !!userId,
  });
};

export const useReferralsList = (userId: string) => {
  return useQuery({
    queryKey: ['referralsList', userId],
    queryFn: async () => {
      const referrals = await getReferrals(userId);
      const users = await Promise.all(
        referrals.map(ref => getUser(ref.referred_id))
      );
      return referrals.map((ref, i) => ({
        ...ref,
        user: users[i]
      }));
    },
    enabled: !!userId,
  });
};

export const useAvailableTasks = (userId: string, type?: 'visit' | 'signup' | 'share') => {
  return useQuery({
    queryKey: ['availableTasks', userId, type],
    queryFn: async () => {
      const tasks = await getAvailableTasks(userId, type);
      return tasks;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserCompletedTasks = (userId: string) => {
  return useQuery({
    queryKey: ['userCompletedTasks', userId],
    queryFn: async () => {
      const tasks = await getUserCompletedTasks(userId);
      return tasks;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTaskDetails = (taskId: string) => {
  return useQuery({
    queryKey: ['taskDetails', taskId],
    queryFn: async () => {
      const task = await getTaskDetails(taskId);
      return task;
    },
    enabled: !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserTaskHistory = (userId: string) => {
  return useQuery({
    queryKey: ['userTaskHistory', userId],
    queryFn: async () => {
      const history = await getUserTaskHistory(userId);
      return history;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserTaskEarnings = (userId: string) => {
  return useQuery({
    queryKey: ['userTaskEarnings', userId],
    queryFn: async () => {
      const earnings = await getUserTaskEarnings(userId);
      return earnings;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTaskCompletionStatus = (taskId: string, userId: string) => {
  return useQuery({
    queryKey: ['taskCompletion', taskId, userId],
    queryFn: () => hasUserCompletedTask(taskId, userId),
    enabled: !!userId && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Admin Task Queries
export const useTasks = (userId: string, type?: Task['type']) => {
  return useQuery({
    queryKey: ['adminTasks', userId, type],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Task Mutations
export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          completed_by: [],
          active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, active }: { taskId: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ active })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTasks'] });
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      await completeTask(taskId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTasks'] });
      queryClient.invalidateQueries({ queryKey: ['availableTasks'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['userTaskHistory'] });
      queryClient.invalidateQueries({ queryKey: ['userTaskEarnings'] });
    },
  });

  return {
    createTask: createTaskMutation,
    deleteTask: deleteTaskMutation,
    updateTaskStatus: updateTaskStatusMutation,
    completeTask: completeTaskMutation,
  };
};

// Withdrawal Queries and Mutations
export const useWithdrawals = (userId: string) => {
  return useQuery({
    queryKey: ['withdrawalHistory', userId],
    queryFn: async () => {
      const history = await getWithdrawalHistory(userId);
      return history;
    },
    enabled: !!userId,
  });
};

export const useWithdrawalStatus = () => {
  return useQuery({
    queryKey: ['withdrawalStatus'],
    queryFn: async () => {
      const enabled = await isWithdrawalEnabled();
      return enabled;
    },
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      userId: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }) => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .insert([{
            user_id: request.userId,
            amount: request.amount,
            bank_name: request.bankName,
            account_number: request.accountNumber,
            account_name: request.accountName,
            status: 'pending',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }
        return data;
      } catch (error: any) {
        console.error('Creation error:', error);
        throw new Error(error.message || 'Failed to create withdrawal request');
      }
    },
    onError: (error: Error) => {
      console.error('Withdrawal request failed:', error);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawalHistory', userId] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
    },
  });
};

// Loan Queries and Mutations
export const useLoanHistory = (userId: string) => {
  return useQuery({
    queryKey: ['loanHistory', userId],
    queryFn: async () => {
      const history = await getLoanHistory(userId);
      return history;
    },
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: any) => {
      const result = await createLoanRequest(request);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanHistory'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
    },
  });
};

// User Settings Queries
export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] });
      queryClient.invalidateQueries({ queryKey: ['userDetails', userId] });
    },
  });
};

// Bank Details Queries
export const useBankDetails = (userId: string) => {
  return useQuery({
    queryKey: ['bankDetails', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('account_name, account_number, bank_name')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return {
        account_name: data?.account_name || '',
        account_number: data?.account_number || '',
        bank_name: data?.bank_name || '',
      };
    },
    enabled: !!userId,
  });
};

export const useUpdateBankDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { 
      userId: string; 
      data: { 
        account_name: string;
        account_number: string;
        bank_name: string;
      }
    }) => {
      await updateBankDetails(userId, data);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] });
    },
  });
};

// Notification Settings Queries
// export const useNotificationSettings = (userId: string) => {
//   return useQuery({
//     queryKey: ['notificationSettings', userId],
//     queryFn: async () => {
//       const settings = await getUserSettings(userId);
//       return {
//         task_updates: settings?.notification_preferences?.task_updates ?? true,
//         new_tasks: settings?.notification_preferences?.new_tasks ?? true,
//         payment_updates: settings?.notification_preferences?.payment_updates ?? true,
//         referral_updates: settings?.notification_preferences?.referral_updates ?? true,
//       };
//     },
//     enabled: !!userId,
//   });
// };

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, preferences }: {
      userId: string;
      preferences: {
        task_updates: boolean;
        new_tasks: boolean;
        payment_updates: boolean;
        referral_updates: boolean;
      }
    }) => {
      await updateNotificationPreferences(userId, preferences);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSettings', userId] });
    },
  });
};

// User Mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      await updateUserDetails(userId, data);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userDetails', userId] });
    },
  });
};

// New hooks for top earners and earnings breakdown
export const useTopEarners = () => {
  return useQuery({
    queryKey: ['topEarners'],
    queryFn: async () => {
      const data = await getTopEarners();
      return data;
    },
  });
};

export const useEarningsBreakdown = (userId: string) => {
  return useQuery({
    queryKey: ['earningsBreakdown', userId],
    queryFn: async () => {
      const data = await getEarningsBreakdown(userId);
      return data;
    },
    enabled: !!userId,
  });
};

// Admin Queries
export const useAdminUsers = (page: number, pageSize: number, searchTerm: string) => {
  return useQuery({
    queryKey: ['adminUsers', page, pageSize, searchTerm],
    queryFn: async () => {
      const result = await getAllUsers(page, pageSize, searchTerm);
      return {
        data: result.data,
        totalCount: result.totalCount,
        totalPages: result.totalPages
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    // keepPreviousData: true,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const stats = await getUserStats();
      return stats;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminWithdrawals = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['adminWithdrawals', page, pageSize],
    queryFn: async () => {
      const result = await getAllWithdrawals(page, pageSize);
      return {
        data: result.data.map((withdrawal: any) => ({
          ...withdrawal,
          user: withdrawal.users // Map users to user for consistency
        })),
        totalCount: result.totalCount,
        totalPages: result.totalPages
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    // keepPreviousData: true,
  });
};

export const useAdminLoans = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['adminLoans', page, pageSize],
    queryFn: async () => {
      const result = await getAllLoans(page, pageSize);
      return {
        data: result.data.map((loan: any) => ({
          ...loan,
          user: loan.users // Map users to user for consistency
        })),
        totalCount: result.totalCount,
        totalPages: result.totalPages
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    // keepPreviousData: true,
  });
};

export const useAdminMutations = () => {
  const queryClient = useQueryClient();

  const updateUserVip = useMutation({
    mutationFn: async ({ userId, isVip }: { userId: string; isVip: boolean }) => {
      await updateUserVipStatus(userId, isVip);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });

  const updateWithdrawalStatus = useMutation({
    mutationFn: async ({ withdrawalId, status }: { withdrawalId: string; status: 'approved' | 'rejected' }) => {
      await updateWithdrawalStatusService(withdrawalId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
    },
  });

  const updateLoanStatus = useMutation({
    mutationFn: async ({ loanId, status }: { loanId: string; status: 'approved' | 'rejected' }) => {
      await updateLoanStatusService(loanId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLoans'] });
    },
  });

  return {
    updateUserVip,
    updateWithdrawalStatus,
    updateLoanStatus,
  };
};
