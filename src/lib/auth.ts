import { supabase } from './supabase';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { logger } from './logger';

export async function signIn(email: string, password: string) {
  // For demo purposes, hardcode the demo credentials
  if (email === 'director@demo.com' && password === 'demo123') {
    // First try to get the existing user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!profileError && profile) {
      return profile as User;
    }

    // If profile not found, throw error
    throw new Error('Demo user profile not found. Please ensure the database is properly seeded.');
  }

  // For non-demo users, proceed with normal authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      throw new Error('Invalid email or password. Please try again.');
    }
    throw error;
  }

  // Fetch additional user data from profiles
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    // If no profile exists, sign out the user
    await signOut();
    throw new Error('User profile not found');
  }

  return profile as User;
}

async function signUp(email: string, password: string, role: 'director' | 'manager', schoolId?: string, districtId: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert([
      {
        id: authData.user.id,
        email,
        role,
        school_id: schoolId,
        district_id: districtId,
      },
    ])
    .select()
    .single();

  if (profileError) {
    // If profile creation fails, clean up the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return profile as User;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  // Clear any cached profile data
  localStorage.removeItem('user_preferences');
  localStorage.removeItem('cached_profile');
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.error('Error getting session:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      return null;
    }

    // Refresh session if needed
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        logger.error('Error refreshing session:', refreshError);
        throw refreshError;
      }
      
      if (!newSession) {
        return null;
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      logger.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    return profile as User;
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('refresh_token_not_found')) {
        // Token expired or invalid, sign out user
        await signOut();
        toast.error('Your session has expired. Please sign in again.');
      } else {
        toast.error('Authentication error. Please try again.');
      }
    }
    
    return null;
  }
}