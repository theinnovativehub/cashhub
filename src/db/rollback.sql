-- Drop all functions first
DROP FUNCTION IF EXISTS refresh_user_statistics();
DROP FUNCTION IF EXISTS increment_user_balance(numeric, uuid);
DROP FUNCTION IF EXISTS decrement_user_balance(numeric, uuid);
DROP FUNCTION IF EXISTS increment(numeric);
DROP FUNCTION IF EXISTS get_user_statistics(uuid);
DROP FUNCTION IF EXISTS create_transaction_partition();

-- Drop all views
DROP MATERIALIZED VIEW IF EXISTS user_statistics;

-- Drop all triggers
DROP TRIGGER IF EXISTS refresh_user_statistics_tasks ON tasks;
DROP TRIGGER IF EXISTS refresh_user_statistics_transactions ON transactions;
DROP TRIGGER IF EXISTS refresh_user_statistics_on_transaction ON transactions;
DROP TRIGGER IF EXISTS refresh_user_statistics_on_task ON tasks;
DROP TRIGGER IF EXISTS refresh_user_statistics_on_referral ON referrals;
DROP TRIGGER IF EXISTS create_transaction_partition_trigger ON transactions_partitioned;

-- Drop all tables
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS transactions_partitioned CASCADE;
DROP TABLE IF EXISTS transactions_y2024m01;
DROP TABLE IF EXISTS transactions_y2024m02;

-- Drop row level security policies if they exist
DROP POLICY IF EXISTS users_see_own_data ON users;
DROP POLICY IF EXISTS admins_see_all_data ON users;
DROP POLICY IF EXISTS transactions_policy ON transactions;

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;

-- Drop constraints if they exist
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS check_withdrawal_amount;
ALTER TABLE loans DROP CONSTRAINT IF EXISTS check_loan_amount;
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS fk_withdrawals_user;
ALTER TABLE loans DROP CONSTRAINT IF EXISTS fk_loans_user;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_users_balance;
DROP INDEX IF EXISTS idx_users_is_admin;
DROP INDEX IF EXISTS idx_users_is_vip;
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_tasks_active_type;
DROP INDEX IF EXISTS idx_transactions_user_type;
DROP INDEX IF EXISTS idx_withdrawals_user_status;
DROP INDEX IF EXISTS idx_loans_user_status;
DROP INDEX IF EXISTS idx_referrals_referrer;
DROP INDEX IF EXISTS idx_active_tasks;
DROP INDEX IF EXISTS idx_pending_withdrawals;
DROP INDEX IF EXISTS idx_pending_loans;
DROP INDEX IF EXISTS idx_tasks_title_description_trgm;
DROP INDEX IF EXISTS idx_tasks_completed_by;
