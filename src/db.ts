import { createClient } from '@supabase/supabase-js';

const providedUrl = import.meta.env.VITE_SUPABASE_URL;
const providedKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config Check:', { url: !!providedUrl, key: !!providedKey });

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

export async function claimDailyLike(uid: string, currentAvailableLikes: number) {
  const { error } = await supabase
    .from('users')
    .update({ 
      availableLikesToGive: (currentAvailableLikes || 0) + 1, 
      lastLikeClaimAt: new Date().toISOString() 
    })
    .eq('uid', uid);
  if (error) throw error;
}

export async function giveLike(senderUid: string, receiverUid: string, senderAvailableLikes: number, receiverReceivedLikes: number) {
  const { error: err1 } = await supabase.from('users').update({ availableLikesToGive: senderAvailableLikes - 1 }).eq('uid', senderUid);
  if (err1) throw err1;
  const { error: err2 } = await supabase.from('users').update({ receivedLikes: (receiverReceivedLikes || 0) + 1 }).eq('uid', receiverUid);
  if (err2) throw err2;
}

export async function updateName(uid: string, codename: string) {
  const { error } = await supabase
    .from('users')
    .update({ 
      codename,
      lastNameChangeAt: new Date().toISOString()
    })
    .eq('uid', uid);
  if (error) throw error;
}

export async function updateAvatar(uid: string, avatarUrl: string) {
  const { error } = await supabase
    .from('users')
    .update({ avatarUrl })
    .eq('uid', uid);
  if (error) throw error;
}
