-- Create user_statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
SELECT 
    u.id,
    u.fullname,
    u.email,
    u.balance,
    u.task_balance,
    u.referral_balance,
    COALESCE(task_count.num_tasks_done, 0) as num_tasks_done,
    COALESCE(referral_count.num_referrals, 0) as num_referrals,
    u.is_vip,
    u.created_at,
    u.updated_at
FROM 
    users u
    LEFT JOIN (
        SELECT 
            t.completed_by[1] as user_id,
            COUNT(*) as num_tasks_done
        FROM 
            tasks t
        WHERE 
            array_length(t.completed_by, 1) > 0
        GROUP BY 
            t.completed_by[1]
    ) task_count ON u.id = task_count.user_id
    LEFT JOIN (
        SELECT 
            referrer_id,
            COUNT(*) as num_referrals
        FROM 
            referrals
        GROUP BY 
            referrer_id
    ) referral_count ON u.id = referral_count.referrer_id;

-- Create index on user_statistics
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_id ON user_statistics(id);

-- Function to refresh user statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh user_statistics
DROP TRIGGER IF EXISTS refresh_user_statistics_on_transaction ON transactions;
CREATE TRIGGER refresh_user_statistics_on_transaction
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_user_statistics();

DROP TRIGGER IF EXISTS refresh_user_statistics_on_task ON tasks;
CREATE TRIGGER refresh_user_statistics_on_task
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_user_statistics();

DROP TRIGGER IF EXISTS refresh_user_statistics_on_referral ON referrals;
CREATE TRIGGER refresh_user_statistics_on_referral
    AFTER INSERT OR UPDATE OR DELETE ON referrals
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_user_statistics();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id uuid)
RETURNS TABLE (
    id uuid,
    fullname text,
    email text,
    balance numeric,
    task_balance numeric,
    referral_balance numeric,
    num_tasks_done bigint,
    num_referrals bigint,
    is_vip boolean,
    created_at timestamptz,
    updated_at timestamptz
) 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.fullname,
        s.email,
        s.balance,
        s.task_balance,
        s.referral_balance,
        s.num_tasks_done,
        s.num_referrals,
        s.is_vip,
        s.created_at,
        s.updated_at
    FROM 
        user_statistics s
    WHERE 
        s.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON user_statistics TO authenticated;
GRANT SELECT ON user_statistics TO anon;
GRANT EXECUTE ON FUNCTION refresh_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_user_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_user_statistics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics(uuid) TO anon;

-- Grant permissions on related tables
GRANT SELECT, INSERT, UPDATE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;
GRANT SELECT, UPDATE ON users TO authenticated;

-- Allow authenticated users to use the sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
