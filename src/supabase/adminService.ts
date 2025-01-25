import { supabase } from '@/supabase';
import { Task } from '@/types/index';
import { showToast } from '@/utils/toast';

// Create a new task
export const createTask = async (task: Omit<Task, "id" | "completed_by" | "created_at"> & {
  requirements?: string[];
  completionSteps?: string[];
}) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        reward: task.reward,
        url: task.url,
        type: task.type,
        created_by: task.created_by,
        active: task.active,
        completed_by: [],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    showToast.success('Task created successfully');
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get all tasks (for admin dashboard)
export const getAllTasks = async (page = 1, pageSize = 20) => {
  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    // Then get paginated data
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { data, totalCount, totalPages: Math.ceil((totalCount || 0) / pageSize) };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Toggle task status (activate/deactivate)
export const updateTaskStatus = async (taskId: string, active: boolean) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ active })
      .eq('id', taskId);

    if (error) throw error;
    showToast.success(`Task ${active ? 'activated' : 'deactivated'} successfully`);
    return;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  try {
    // First check if anyone has completed this task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('completed_by')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    if (task.completed_by && task.completed_by.length > 0) {
      // Just deactivate the task instead of deleting
      const { error } = await supabase
        .from('tasks')
        .update({ active: false })
        .eq('id', taskId);

      if (error) throw error;
      showToast.success('Task deactivated successfully');
      return;
    }

    // Only delete if no one has completed the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    showToast.success('Task deleted successfully');
    return;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) throw error;
    showToast.success('Task updated successfully');
    return;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get task completion statistics
export const getTaskStats = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, completed_by');

    if (error) throw error;

    return data.map(task => ({
      task_id: task.id,
      title: task.title,
      completions_count: task.completed_by?.length || 0
    }));
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get tasks by type
export const getTasksByType = async (type: Task['type']) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', type)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get all users for admin dashboard
export const getAllUsers = async (page = 1, pageSize = 20, searchTerm = '') => {
  try {
    let query = supabase.from('users').select('*', { count: 'exact' });
    
    if (searchTerm) {
      query = query.or(`fullname.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }
    
    // Get total count first
    const { count: totalCount } = await query.select('*');
    // , { count: 'exact', head: true }
    // Then get paginated data
    const { data, error } = await query
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { data, totalCount, totalPages: Math.ceil((totalCount || 0) / pageSize) };
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Update user VIP status
export const updateUserVipStatus = async (userId: string, is_vip: boolean) => {
  try {
    if (is_vip) {
      // Give user VIP signup bonus
      const { error: bonusError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: 1000, // VIP_SIGNUP_BONUS
          type: 'vip_bonus',
          status: 'completed'
        });

      if (bonusError) throw bonusError;

      // Update user's VIP status and balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('users')
        .update({ 
          is_vip,
          balance: (userData.balance || 0) + 1000 // Add VIP bonus to current balance
        })
        .eq('id', userId);

      if (error) throw error;
    } else {
      // Just remove VIP status
      const { error } = await supabase
        .from('users')
        .update({ is_vip })
        .eq('id', userId);

      if (error) throw error;
    }

    showToast.success(`User ${is_vip ? 'promoted to' : 'removed from'} VIP successfully`);
    return;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    // First get the total count
    const { count: totalCount, error: countError } = await supabase
      .from('users') // Changed to users table for more reliable count
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting total count:', countError);
      throw countError;
    }

    // Get VIP users count
    const { count: vipCount, error: vipCountError } = await supabase
      .from('users') // Changed to users table for more reliable count
      .select('*', { count: 'exact', head: true })
      .eq('is_vip', true);

    if (vipCountError) {
      console.error('Error getting VIP count:', vipCountError);
      throw vipCountError;
    }

    // Get aggregated stats
    const { data: aggregateData, error: aggregateError } = await supabase
      .from('users')
      .select(`
        balance,
        task_balance,
        num_tasks_done
      `);

    if (aggregateError) {
      console.error('Error getting aggregates:', aggregateError);
      throw aggregateError;
    }

    if (!aggregateData) {
      throw new Error('No data returned from aggregate query');
    }

    // Calculate totals
    const totals = aggregateData.reduce((acc, user) => ({
      totalBalance: acc.totalBalance + (user.balance || 0),
      totalTasks: acc.totalTasks + (user.num_tasks_done || 0)
    }), {
      totalBalance: 0,
      totalTasks: 0
    });

    const stats = {
      total_users: totalCount || 0,
      vip_users: vipCount || 0,
      total_tasks_completed: totals.totalTasks,
      total_balance: totals.totalBalance,
      average_balance: totalCount ? totals.totalBalance / totalCount : 0,
      average_tasks_per_user: totalCount ? totals.totalTasks / totalCount : 0,
    };

    console.log('Final stats:', stats);
    return stats;

  } catch (error: any) {
    console.error('getUserStats error:', error);
    showToast.error(error.message);
    throw error;
  }
};

// Get withdrawal requests
export const getWithdrawalRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        users (
          id,
          fullname,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Update withdrawal request status
export const updateWithdrawalStatus = async (withdrawalId: string, status: 'approved' | 'rejected', adminId: string) => {
  try {
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError) throw fetchError;

    // Start a transaction
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({
        status,
        processed_by: adminId,
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateError) throw updateError;

    // If rejected, refund the user's balance
    if (status === 'rejected') {
      const { error: refundError } = await supabase
        .from('users')
        .update({
          balance: withdrawal.amount
        })
        .eq('id', withdrawal.user_id);

      if (refundError) throw refundError;
    }

    showToast.success(`Withdrawal request ${status} successfully`);
    return;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Check if withdrawals are enabled
export const isWithdrawalEnabled = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('withdrawals_enabled')
      .single();

    if (error) throw error;
    return data?.withdrawals_enabled ?? true;
  } catch (error) {
    console.error('Error checking withdrawal status:', error);
    return true; // Default to enabled if there's an error
  }
};
