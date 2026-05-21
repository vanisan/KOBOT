import { useState, useEffect } from 'react';
import { UserProfile, MapUser } from './types';
import { RegistrationFlow } from './components/RegistrationFlow';
import { Navigation } from './components/Navigation';
import { Discover } from './components/Discover';
import { MapTab } from './components/MapTab';
import { Profile } from './components/Profile';
import { CityChat } from './components/CityChat';
import { supabase, isSupabaseConfigured } from './db';

export default function App() {
  const [user, setUser] = useState<MapUser | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App useEffect started');
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured');
      setAuthError('Не вказані ключі доступу до Supabase. Додайте VITE_SUPABASE_URL та VITE_SUPABASE_ANON_KEY у змінні середовища.');
      setLoadingApp(false);
      return;
    }
    const handleSession = async (sessionUser: any) => {
      console.log('handleSession called', sessionUser?.id || 'No user');
      try {
        if (sessionUser) {
          setAuthUid(sessionUser.id);
          const { data, error } = await supabase.from('users').select('*').eq('uid', sessionUser.id).single();
          if (error && error.code !== 'PGRST116') {
             console.error('Fetch user error', error);
          }
          if (data) {
            setUser(data as MapUser);
          } else {
            setUser(null);
          }
        } else {
          setAuthUid(null);
          setUser(null);
        }
      } catch (e: any) {
        console.error('handleSession error', e);
        if (e.message?.includes('Failed to fetch')) {
          setAuthError(`Не вдалося з'єднатися (Failed to fetch). Перевірте CORS у Supabase або чи працює ваш проект.`);
        } else {
          setAuthError(`Помилка: ${e.message || 'Невідома помилка'}`);
        }
      } finally {
        console.log('handleSession finished, loadingApp set to false');
        setLoadingApp(false);
      }
    };

    console.log('Checking session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('getSession result', { hasSession: !!session, error });
      if (error) {
        setAuthError(`Помилка: ${error.message}`);
        setLoadingApp(false);
      } else {
        handleSession(session?.user);
      }
    }).catch((e: any) => {
      console.error("fetch session error", e);
      setAuthError(`Не вдалося з'єднатися з Supabase (Failed to fetch). Переконайтеся, що ваш проект не призупинено, і URL Preview додано до CORS / Site URL налаштувань у Supabase.`);
      setLoadingApp(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRegistrationComplete = async (profileData: Omit<UserProfile, 'uid'>) => {
    if (!authUid) return;
    try {
      const newUser: UserProfile = {
        uid: authUid,
        ...profileData,
      };
      
      const toSave = {
        ...newUser,
        isOnline: true,
        createdAt: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('users').upsert(toSave);
      if (error) throw error;
      
      setUser(toSave as MapUser);
    } catch (e) {
      console.error(e);
    }
  };

  if (authError) {
    return (
      <div className="flex h-screen bg-black items-center justify-center p-6 text-center">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl w-full max-w-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Авторизація недоступна</h2>
          <p className="text-sm text-neutral-400 mb-6">{authError}</p>
        </div>
      </div>
    );
  }

  if (loadingApp) {
    return <div className="flex h-screen bg-black items-center justify-center text-indigo-500">Завантаження...</div>;
  }

  // If user hasn't completed registration flow
  if (!user) {
    return <RegistrationFlow onComplete={handleRegistrationComplete} uid={authUid} />;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans antialiased">
      <main className="flex-1 overflow-hidden">
        {activeTab === 'discover' && <Discover />}
        {activeTab === 'map' && <MapTab currentUser={user} />}
        {activeTab === 'chats' && <CityChat currentUser={user} />}
        {activeTab === 'profile' && <Profile user={user} />}
      </main>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
