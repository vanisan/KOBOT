import { createClient } from '@supabase/supabase-js';

const providedUrl = import.meta.env.VITE_SUPABASE_URL || 'https://usrbqeomlzvaqgmaqaoof.supabase.co';
const providedKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcmJxZW9tbHp2YXFnbWFxYW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjIxNjIsImV4cCI6MjA5NDg5ODE2Mn0.tmveqlUHBV5bFiu-SwyM_BOVa0fv-toL8YJ1X5pRj9g';

console.log('Supabase Config:', { url: providedUrl ? 'Provided' : 'Empty', key: providedKey ? 'Provided' : 'Empty' });

export const isSupabaseConfigured = Boolean(providedUrl && providedKey);

const supabaseUrl = providedUrl;
const supabaseAnonKey = providedKey;

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

export async function updateLocation(uid: string, lat: number, lng: number) {
  const { error } = await supabase
    .from('users')
    .update({ 
      lat, 
      lng, 
      updatedAt: new Date().toISOString() 
    })
    .eq('uid', uid);
  if (error) throw error;
}

export async function updateLocationVisibility(uid: string, isLocationVisible: boolean) {
  const { error } = await supabase
    .from('users')
    .update({ isLocationVisible })
    .eq('uid', uid);
  if (error) throw error;
}

export async function claimDiamond(uid: string, currentDiamonds: number) {
  const { error } = await supabase
    .from('users')
    .update({ 
      diamondCount: (currentDiamonds || 0) + 1, 
      lastDiamondClaimAt: new Date().toISOString() 
    })
    .eq('uid', uid);
  if (error) throw error;
}
