CREATE OR REPLACE FUNCTION public.get_user_overview(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'balance', u.balance,
    'total_referrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = user_id),
    'total_tasks', (SELECT COUNT(*) FROM completed_tasks WHERE user_id = user_id),
    'total_earnings', u.total_earnings
  )
  INTO result
  FROM users u
  WHERE u.id = user_id;

  RETURN result;
END;
$$;
