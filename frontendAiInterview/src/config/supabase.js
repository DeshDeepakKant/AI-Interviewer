import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace('/storage/v1/s3', ''); // Remove any storage path
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY; // Add this to your .env

// Log environment variables for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '***' : 'Not found');
console.log('Supabase Service Key:', supabaseServiceKey ? '***' : 'Not found');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Client for regular operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Admin client for operations that need elevated permissions
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if no service key

export { supabase, supabaseAdmin };
export default supabase;
