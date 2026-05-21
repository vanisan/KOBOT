/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile, MapUser } from './types';
import { RegistrationFlow } from './components/RegistrationFlow';
import { Navigation } from './components/Navigation';
import { Discover } from './components/Discover';
import { MapTab } from './components/MapTab';
import { Profile } from './components/Profile';
import { CityChat } from './components/CityChat';
import { db } from './db';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<MapUser | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      // Встановлюємо параметри Telegram Web App
      const tg = (window as typeof window & { Telegram?: any }).Telegram?.WebApp;
      let targetUserId = null;

      if (tg) {
        setTimeout(() => {
          try {
            tg.ready();
            tg.expand(); // Розгортаємо на весь екран
            tg.setHeaderColor('#000000'); 
            tg.setBackgroundColor('#000000');
          } catch (e) {
            console.error('Telegram WebApp init error:', e);
          }
        }, 100);

        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.id) {
          targetUserId = tgUser.id.toString();
        }
      }

      // Якщо відкрили в браузері (не в Telegram), генеруємо тимчасовий ID для тестування
      if (!targetUserId) {
        targetUserId = localStorage.getItem('local_anonym_id');
        if (!targetUserId) {
          targetUserId = 'local_' + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('local_anonym_id', targetUserId);
        }
      }

      setAuthUid(targetUserId);

      try {
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (userDoc.exists()) {
          setUser(userDoc.data() as MapUser);
        } else {
          setUser(null); // needs registration
        }
      } catch (e: any) {
        console.error(e);
        const code = e?.code || '';
        if (code === 'auth/unauthorized-domain') {
          setAuthError(
            "Домен не авторизовано у Firebase! " +
            "Перейдіть до Firebase Console -> Authentication -> Settings -> Authorized domains " +
            "та додайте домен Vercel."
          );
        } else {
           setAuthError(`Помилка Firestore: ${e.message || 'Невідома помилка'}`);
        }
      } finally {
        setLoadingApp(false);
      }
    };

    initApp();
  }, []);

  const handleRegistrationComplete = async (profileData: Omit<UserProfile, 'uid'>) => {
    if (!authUid) return;
    try {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      const targetUserId = tgUser?.id ? tgUser.id.toString() : authUid;

      const newUser: UserProfile = {
        uid: targetUserId,
        telegramId: tgUser?.id ? tgUser.id.toString() : undefined,
        ...profileData,
      };
      
      const toSave = {
        ...newUser,
        isOnline: true,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', targetUserId), toSave);
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
