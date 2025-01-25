import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gifwaminzgygougtanuh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZndhbWluemd5Z291Z3RhbnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODQ5NjAsImV4cCI6MjA1MjQ2MDk2MH0.ijD38w4YPcEHMyFIU5h5Gyny2ky5dlNohzY64HG8U3o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
