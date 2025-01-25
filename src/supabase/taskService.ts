import { supabase } from '@/supabase';
import { Task, User } from '@/types';
import { showToast } from '@/utils/toast';

const TASK_COOLDOWN_MS = 3000; // 3 seconds cooldown
const MAX_TASKS_PER_HOUR = 50;
const lastTaskCompletions: { [key: string]: number } = {};
const taskCountsByHour: { [key: string]: number } = {};

// Get available tasks for a user
export const getAvailableTasks = async (userId: string, type?: Task['type']) => {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('active', true)
      .not('completed_by', 'cs', `{${userId}}`)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to prevent excessive data fetching

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get tasks completed by a user
export const getUserCompletedTasks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .contains('completed_by', [userId])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Complete a task
export const completeTask = async (taskId: string, userId: string) => {
  try {
    // Check cooldown
    const lastCompletion = lastTaskCompletions[userId] || 0;
    const now = Date.now();
    if (now - lastCompletion < TASK_COOLDOWN_MS) {
      throw new Error('Please wait a few seconds before completing another task');
    }

    // Check hourly limit
    const hourKey = `${userId}_${new Date().getHours()}`;
    const hourlyCount = taskCountsByHour[hourKey] || 0;
    if (hourlyCount >= MAX_TASKS_PER_HOUR) {
      throw new Error('You have reached the maximum tasks limit for this hour');
    }

    // Start a Supabase transaction
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;
    if (!task) throw new Error('Task not found');
    if (!task.active) throw new Error('This task is no longer active');
    if (task.completed_by.includes(userId)) throw new Error('You have already completed this task');

    // Update task completions
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        completed_by: [...task.completed_by, userId]
      })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // Update user balance and task count using RPC
    const { error: balanceError } = await supabase
      .rpc('increment_user_balance', {
        amount: task.reward,
        user_id: userId
      });

    if (balanceError) throw balanceError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: task.reward,
        type: 'task',
        status: 'completed',
        related_record_id: taskId
      });

    if (transactionError) throw transactionError;

    // Update rate limiting trackers
    lastTaskCompletions[userId] = now;
    taskCountsByHour[hourKey] = hourlyCount + 1;

    showToast.success(`Task completed! You earned ₦${task.reward}`);
    return task;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get task details
export const getTaskDetails = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        completed_by:users!completed_by (
          id,
          fullname,
          email
        )
      `)
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get task completion count for a specific task
export const getTaskCompletionCount = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed_by')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data.completed_by?.length || 0;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Check if a user has completed a specific task
export const hasUserCompletedTask = async (taskId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed_by')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data?.completed_by?.includes(userId) || false;
  } catch (error: any) {
    console.error('Error checking task completion:', error);
    return false;
  }
};

// Get task completion history for a user
export const getUserTaskHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        task:tasks (*)
      `)
      .eq('user_id', userId)
      .eq('type', 'task')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};

// Get task earnings summary for a user
export const getUserTaskEarnings = async (userId: string) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'task')
      .eq('status', 'approved');

    if (error) throw error;

    const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    return totalEarnings;
  } catch (error: any) {
    showToast.error(error.message);
    throw error;
  }
};
