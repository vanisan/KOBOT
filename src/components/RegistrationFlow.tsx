import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { MapPin, User, ChevronRight } from 'lucide-react';
import { loginWithGoogle, loginAnonymous } from '../db';
import { auth, db } from '../db';

interface RegistrationFlowProps {
  onComplete: (profile: Omit<UserProfile, 'uid'>) => void;
  uid: string | null; // null if not yet signed in
}

const colors = [
  'bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
  'bg-rose-500', 'bg-orange-500', 'bg-slate-700', 'bg-zinc-800'
];

export function RegistrationFlow({ onComplete, uid }: RegistrationFlowProps) {
  const [step, setStep] = useState(uid ? 2 : 1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    codename: '',
    age: 18,
    bio: '',
    interests: [],
    avatarColor: 'bg-indigo-500',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uid && step === 1) {
      setStep(2);
      setLoading(false);
    }
  }, [uid, step]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser?.first_name && !profile.codename) {
        setProfile(p => ({ ...p, codename: tgUser.first_name || '' }));
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    setLoading(true);
    try {
      await loginAnonymous();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete(profile as Omit<UserProfile, 'uid'>);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-6 justify-center max-w-md mx-auto w-full">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="mb-8 text-center text-neutral-400 text-sm">
          {step === 1 ? 'Авторизація' : `Крок ${step - 1} з 2`}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <MapPin className="text-indigo-500" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center tracking-tight">Anonym KBL</h1>
            <p className="text-neutral-400 text-center leading-relaxed">
              Анонімна мережа знайомств у Кобеляках. Ніхто не дізнається, хто ви, поки ви самі не розкажете.
            </p>

            <div className="space-y-4 pt-8">
              <button 
                onClick={handleTelegramLogin}
                disabled={loading}
                className="w-full bg-[#2AABEE] hover:bg-[#229ED9] disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg"
              >
                {loading ? 'Завантаження...' : 'Увійти через Telegram'}
              </button>
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center transition-colors"
              >
                Увійти через Google
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-8">Створення образу</h2>
            
            <div className="space-y-2 mt-8">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Ваш псевдонім</label>
              <input 
                type="text" 
                placeholder="Наприклад: Лис, Мандрівник..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                value={profile.codename}
                onChange={e => setProfile({...profile, codename: e.target.value})}
              />
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Вік</label>
              <input 
                type="number" 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                value={profile.age}
                onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 18})}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-8">Деталі профілю</h2>
            
            <div className="flex justify-center mb-8">
              <div className={`w-24 h-24 ${profile.avatarColor} rounded-full flex items-center justify-center shadow-lg shadow-black/50`}>
                <User size={40} className="text-white/80" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex justify-between">
                <span>Колір аватара</span>
              </label>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setProfile({...profile, avatarColor: color})}
                    className={`w-10 h-10 rounded-full ${color} transition-transform ${
                      profile.avatarColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-6">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Коротко про вас</label>
              <textarea 
                rows={3}
                placeholder="Що вас цікавить? Чим захоплюєтесь?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
            </div>
          </div>
        )}

        {step !== 1 && (
          <button 
            onClick={handleNext}
            disabled={(step === 2 && !profile.codename?.trim()) || loading}
            className="mt-12 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Завантаження...' : step === 3 ? 'Почати знайомства' : 'Далі'}
            {!loading && step !== 3 && <ChevronRight size={20} className="ml-1" />}
          </button>
        )}
      </motion.div>
    </div>
  );
}
