import { createClient } from '@supabase/supabase-js';

const providedUrl = import.meta.env.VITE_SUPABASE_URL;
const providedKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', { url: providedUrl ? 'Provided' : 'Empty', key: providedKey ? 'Provided' : 'Empty' });

export const isSupabaseConfigured = Boolean(providedUrl && providedKey);

const supabaseUrl = providedUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = providedKey || 'placeholder_key';

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
