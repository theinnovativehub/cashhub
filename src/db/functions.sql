-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'task', 'referral', 'loan', 'vip', 'vip_bonus')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}'::jsonb,
    related_record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to increment balance
CREATE OR REPLACE FUNCTION increment(
    amount numeric
) RETURNS numeric
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT COALESCE(balance, 0) + amount
    FROM users
    WHERE id = auth.uid()
$$;

-- Function to increment user balance
CREATE OR REPLACE FUNCTION increment_user_balance(
    amount numeric,
    user_id uuid
) RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE users
    SET 
        balance = COALESCE(balance, 0) + amount,
        task_balance = COALESCE(task_balance, 0) + amount,
        num_tasks_done = COALESCE(num_tasks_done, 0) + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement user balance
CREATE OR REPLACE FUNCTION decrement_user_balance(
    amount numeric,
    user_id uuid
) RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE users
    SET 
        balance = COALESCE(balance, 0) - amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward NUMERIC NOT NULL CHECK (reward >= 0),
    created_by UUID NOT NULL REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    completed_by UUID[] DEFAULT ARRAY[]::UUID[],
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('share', 'signup', 'visit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_tasks_active_type ON tasks(active, type);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_by ON tasks USING gin(completed_by);

-- Grant necessary permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION increment(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_balance(numeric, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_balance(numeric, uuid) TO anon;
GRANT EXECUTE ON FUNCTION decrement_user_balance(numeric, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_user_balance(numeric, uuid) TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, UPDATE ON users TO authenticated;
