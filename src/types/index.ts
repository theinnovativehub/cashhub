// Define the basic structure of your app's types for Supabase

// User entity
export type User = {
  id: string; // Unique identifier for the user
  fullname: string; // Full name of the user
  email: string; // Email address of the user
  is_admin: boolean; // Indicates if the user is an admin
  referral_code?: string; // Referral code used during signup (optional)
  balance: number; // Current balance (sum of task and referral earnings)
  referral_balance: number; // Balance earned from referrals
  task_balance: number; // Balance earned from tasks
  num_referrals: number; // Number of users referred
  num_tasks_done: number; // Number of tasks completed
  is_vip: boolean; // Indicates if the user is a VIP member
  created_at?: string; // Timestamp of account creation
};

// Admin entity
export type Admin = {
  id: string; // Unique identifier for the admin
  fullname: string; // Full name of the admin
  email: string; // Email address of the admin
  created_at?: string; // Timestamp of admin account creation
};

// Task entity
export type Task = {
  id: string; // Unique identifier for the task
  title: string; // Task title
  description: string; // Description of the task
  reward: number; // Reward amount for completing the task
  created_by: string; // ID of the admin who created the task
  active: boolean; // Indicates if the task is currently active
  completed_by: string[]; // List of user IDs who completed the task
  url: string; // URL associated with the task
  type: 'share' | 'signup' | 'visit'; // Type of task
  created_at: string; // Timestamp of task creation
};

// Referral entity
export type Referral = {
  id: string; // Unique identifier for the referral
  referrer_id: string; // User ID of the referrer
  referred_id: string; // User ID of the referred user
  reward: number; // Reward amount for the referral
  created_at?: string; // Timestamp of referral creation
};

// Transaction entity
export type Transaction = {
  id: string; // Unique identifier for the transaction
  user_id: string; // ID of the user performing the transaction
  amount: number; // Transaction amount
  type: 'deposit' | 'withdrawal' | 'task' | 'referral' | 'loan' | 'vip' | 'vip_bonus'; // Type of transaction
  status: 'pending' | 'completed' | 'cancelled'; // Transaction status
  related_record_id?: string; // ID of the related withdrawal or loan record (if applicable)
  created_at?: string; // Timestamp of transaction
};

// Loan entity
export type Loan = {
  id: string; // Unique identifier for the loan
  user_id: string; // ID of the user requesting the loan
  reason: string; // Loan reason
  bank_name: string; // Bank name
  account_number: string; // Account number
  account_name: string; // Account name
  amount: number; // Loan amount
  status: 'pending' | 'approved' | 'rejected'; // Loan status
  created_at: string; // Timestamp of loan request
  approved_at?: string; // Timestamp of loan approval (optional)
};

// Payment entity
export type Payment = {
  id: string; // Unique identifier for the payment
  user_id: string; // ID of the user making the payment
  amount: number; // Payment amount
  created_at: string; // Timestamp of payment
};

// Withdrawal entity
export type Withdrawal = {
  id: string; // Unique identifier for the withdrawal
  user_id: string; // ID of the user making the withdrawal
  amount: number; // Withdrawal amount
  status: 'pending' | 'approved' | 'rejected'; // Withdrawal status
  created_at: string; // Timestamp of withdrawal
  bank_name: string; // Bank name
  account_number: string; // Account number
  account_name: string; // Account name
  user?: User; // User details
};

// Settings entity
export type Setting = {
  key: string; // Setting key
  value: string; // Setting value
  created_at?: string; // Timestamp of setting creation
  updated_at?: string; // Timestamp of last update
};

// Define a type for distinguishing between regular users and admins
export type AppUser = User | Admin;

// Enum for user actions
export enum UserActions {
  Login = 'login',
  Signup = 'signup',
  Refer = 'refer',
  RequestLoan = 'request_loan',
  CompleteTask = 'complete_task',
}

// Additional utility types if needed
export interface VipFeatures {
  canRequestLoan: boolean;
}

// Top Earner entity
export interface TopEarner {
  id: string;
  fullname: string;
  email: string;
  balance: number;
}

export interface TopEarnersResponse {
  data: TopEarner[];
  totalCount: number | null;
  totalPages: number;
}

// Earnings Breakdown entity
export interface EarningsBreakdown {
  totalBalance: number;
  breakdown: {
    tasks: number;
    referrals: number;
    signupBonus: number;
    withdrawals: number;
  };
  recentTransactions: Transaction[];
}

// Database schema representation for Supabase
export interface DatabaseSchema {
  users: User;
  admins: Admin;
  tasks: Task;
  referrals: Referral;
  transactions: Transaction;
  loans: Loan;
  payments: Payment;
  withdrawals: Withdrawal;
  settings: Setting;
}