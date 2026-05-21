import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { User, ChevronRight } from 'lucide-react';
import { loginWithUsername, registerWithUsername } from '../db';

interface RegistrationFlowProps {
  onComplete: (profile: Omit<UserProfile, 'uid'>) => void;
  uid: string | null;
}

const colors = [
  'bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
  'bg-rose-500', 'bg-orange-500', 'bg-slate-700', 'bg-zinc-800'
];

export function RegistrationFlow({ onComplete, uid }: RegistrationFlowProps) {
  const [step, setStep] = useState(0); // 0 = Auth, 1 = Profile details
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    codename: '',
    age: 18,
    bio: '',
    interests: [],
    avatarColor: 'bg-indigo-500',
  });

  useEffect(() => {
    if (uid && step === 0) {
      setStep(1);
    }
  }, [uid, step]);

  const isValidAuth = () => {
    const rx = /^[a-zA-Z0-9]{6,12}$/;
    return rx.test(username) && rx.test(password);
  };
  
  const handleAuth = async () => {
    setErrorMsg('');
    if (!isValidAuth()) {
      setErrorMsg('Логін і пароль повинні містити лише англійські літери та цифри, від 6 до 12 символів.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithUsername(username, password);
        // App.tsx onAuthStateChanged will handle the rest, but we wait
      } else {
        await registerWithUsername(username, password);
        setStep(1);
        setProfile(p => ({ ...p, codename: username }));
      }
    } catch (e: any) {
      console.error(e);
      let msg = 'Сталася помилка.';
      if (e.message?.includes('Failed to fetch')) {
        msg = "Не вдалося підключитися (Failed to fetch). Перевірте налаштування CORS та стан проекту в Supabase.";
      } else if (e.message?.includes('Invalid login format') || e.message?.includes('Invalid login credentials')) {
        msg = 'Неправильний логін/пароль. Також переконайтеся, що ви зареєстровані, і в Supabase (Authentication -> Providers -> Email) ВИМКНЕНО "Confirm email".';
      } else if (e.message?.includes('already registered')) {
        msg = 'Цей логін вже зайнятий.';
      } else {
        msg = e.message;
      }
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleNextSetup = () => {
    onComplete(profile as Omit<UserProfile, 'uid'>);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-6 justify-center max-w-md mx-auto w-full">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-white">Anonym KBL</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex gap-2 p-1 bg-neutral-900 rounded-xl">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLogin ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                  onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                >
                  Увійти
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isLogin ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                  onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                >
                  Реєстрація
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Логін</label>
                  <input 
                    type="text" 
                    placeholder="Логін (6-12 латинських букв/цифр)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Пароль</label>
                  <input 
                    type="password" 
                    placeholder="Пароль (6-12 латинських букв/цифр)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
                    {errorMsg}
                  </div>
                )}

                <button 
                  onClick={handleAuth}
                  disabled={loading || !username || !password}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {loading ? 'Зачекайте...' : isLogin ? 'Увійти' : 'Зареєструватись'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center space-y-6"
          >
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

            <div className="space-y-2 pt-4">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Псевдонім</label>
              <input 
                type="text" 
                placeholder="Як до вас звертатись?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                value={profile.codename}
                onChange={e => setProfile({...profile, codename: e.target.value})}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Вік</label>
              <input 
                type="number" 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                value={profile.age}
                onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 18})}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Коротко про вас</label>
              <textarea 
                rows={3}
                placeholder="Що вас цікавить? Чим захоплюєтесь?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
            </div>

            <button 
              onClick={handleNextSetup}
              disabled={!profile.codename?.trim()}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/20"
            >
              Почати знайомства
              <ChevronRight size={20} className="ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
