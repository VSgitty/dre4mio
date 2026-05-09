import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const missingSupabaseConfigError = new Error('Supabase credentials not configured');

const createFallbackClient = () => ({
  auth: {
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    }),
    getSession: async () => ({ data: { session: null }, error: missingSupabaseConfigError }),
    signUp: async () => ({ data: { user: null, session: null }, error: missingSupabaseConfigError }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: missingSupabaseConfigError }),
    signOut: async () => ({ error: missingSupabaseConfigError }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: missingSupabaseConfigError }),
  },
});

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured');
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : (createFallbackClient() as any);
