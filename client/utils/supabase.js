import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmieadnlrhumjefvbibe.supabase.co';
const supabaseAnonKey = 'sb_publishable_nLbe-JKFlkUhNgEGUR2rFw_5XQComKM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
