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
import { auth, db } from './db';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<MapUser | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    // Встановлюємо параметри Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Розгортаємо на весь екран
      tg.setHeaderColor('#000000'); // Колір шапки (чорний, під дизайн)
      tg.setBackgroundColor('#000000');
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthUid(firebaseUser.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as MapUser);
          } else {
            setUser(null); // needs registration
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setAuthUid(null);
        setUser(null);
      }
      setLoadingApp(false);
    });
    return unsub;
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
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', authUid), toSave);
      setUser(toSave as MapUser);
    } catch (e) {
      console.error(e);
    }
  };

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
