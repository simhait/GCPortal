import { createClient } from '@supabase/supabase-js';
import { toast } from '../components/common/Toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" to set up your connection.');
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).then(async (response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: response.statusText
          }));
          throw new Error(error.message || 'An error occurred while fetching data');
        }
        return response;
      }).catch(err => {
        console.error('Supabase fetch error:', err);
        throw new Error(err.message || 'Network error occurred. Please check your connection and try again.');
      });
    }
  }
});

// Helper to handle Supabase errors consistently
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST301') {
    throw new Error('Database connection error. Please try again later.');
  }
  
  if (error.code === '42501') {
    throw new Error('You do not have permission to perform this action.');
  }
  
  if (error.code === '23505') {
    throw new Error('A record with this information already exists.');
  }
  
  if (error.message?.includes('FetchError')) {
    throw new Error('Network error occurred. Please check your connection and try again.');
  }
  
  throw new Error(error.message || 'An unexpected error occurred. Please try again.');
};