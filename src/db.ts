import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://usrbqeomlzvaqgmaqaoof.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcmJxZW9tbHp2YXFnbWFxYW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjIxNjIsImV4cCI6MjA5NDg5ODE2Mn0.tmveqlUHBV5bFiu-SwyM_BOVa0fv-toL8YJ1X5pRj9g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getPseudoEmail = (username: string) => `${username.toLowerCase()}@anonym-kbl.com`;

export async function loginWithUsername(username: string, password: string) {
  const email = getPseudoEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function registerWithUsername(username: string, password: string) {
  const email = getPseudoEmail(username);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
