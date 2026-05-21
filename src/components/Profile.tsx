import { UserProfile } from '../types';
import { User, Settings, Edit3, LogOut, Heart, Star, Gem, Info, Loader2, MapPin, MapPinOff } from 'lucide-react';
import { logoutUser, claimDiamond, updateLocationVisibility } from '../db';
import { useState, useMemo } from 'react';

interface ProfileProps {
  user: UserProfile;
}

export function Profile({ user }: ProfileProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  // Calculate Ratings
  const { heartCount, starCount, diamondCount, daysSinceReg, nextDiamondAvailableAt } = useMemo(() => {
    if (!user.createdAt) return { heartCount: 0, starCount: 0, diamondCount: 0, daysSinceReg: 0, nextDiamondAvailableAt: null };

    const start = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const daysSinceReg = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const heartCount = Math.min(5, daysSinceReg);
    const starCount = Math.min(5, user.referralsShown || 0);
    const currentDiamonds = user.diamondCount || 0;

    let nextDiamondAvailableAt = null;
    if (user.lastDiamondClaimAt) {
      const lastClaim = new Date(user.lastDiamondClaimAt);
      const nextClaim = new Date(lastClaim);
      nextClaim.setDate(nextClaim.getDate() + 30);
      nextDiamondAvailableAt = nextClaim;
    } else {
      // If never claimed, can claim if they have 5 stars (sequential rule check)
      // or just assume they can claim the first one immediately if they meet other criteria
    }

    return { 
      heartCount, 
      starCount, 
      diamondCount: currentDiamonds, 
      daysSinceReg,
      nextDiamondAvailableAt 
    };
  }, [user]);

  const canClaimDiamond = useMemo(() => {
    const now = new Date();
    if (diamondCount >= 5) return false;
    
    // Check 30 day rule
    if (nextDiamondAvailableAt && now < nextDiamondAvailableAt) return false;

    // Check if reached max stars (optional sequential check)
    if (starCount < 5) return false;

    return true;
  }, [diamondCount, nextDiamondAvailableAt, starCount]);

  const handleClaimDiamond = async () => {
    if (!canClaimDiamond) return;
    setIsClaiming(true);
    try {
      await claimDiamond(user.uid, diamondCount);
      // Wait for refresh or reload
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      alert('Помилка при поповненні алмазів');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleToggleVisibility = async () => {
    setIsUpdatingVisibility(true);
    try {
      await updateLocationVisibility(user.uid, !user.isLocationVisible);
      // We don't need window.reload if App.tsx listens to profile changes, 
      // but simpler for now to just reload to ensure state sync if not using realtime subs
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Помилка при зміні видимості');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const renderRating = (count: number, icon: any, activeColor: string, max = 5) => {
    return (
      <div className="flex gap-1 justify-center">
        {[...Array(max)].map((_, i) => (
          <div key={i} className={i < count ? activeColor : 'text-neutral-800'}>
            {icon}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-black p-6">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ваш профіль</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={() => logoutUser()} className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-rose-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className={`w-28 h-28 ${user.avatarColor} rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-black/50`}>
          <User size={48} className="text-white/80" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-white">
            <Edit3 size={14} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2">{user.codename}, {user.age}</h2>
        
        {/* Rating Section */}
        <div className="w-full max-w-[240px] mt-2 space-y-4">
          <div className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Рейтинг Активності</span>
              <span className="text-[10px] text-neutral-500">{heartCount}/5 днів</span>
            </div>
            {renderRating(heartCount, <Heart size={18} fill={heartCount > 0 ? "currentColor" : "none"} />, "text-rose-500")}
          </div>

          <div className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Реферальна Мережа</span>
              <span className="text-[10px] text-neutral-500">{starCount}/5 друзів</span>
            </div>
            {renderRating(starCount, <Star size={18} fill={starCount > 0 ? "currentColor" : "none"} />, "text-amber-400")}
          </div>

          <div className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Статус Кобеляки</span>
              <span className="text-[10px] text-neutral-500">{diamondCount}/5 алмазів</span>
            </div>
            {renderRating(diamondCount, <Gem size={18} fill={diamondCount > 0 ? "currentColor" : "none"} />, "text-indigo-400")}
            
            {starCount === 5 && (
              <div className="mt-3">
                <button 
                  onClick={handleClaimDiamond}
                  disabled={!canClaimDiamond || isClaiming}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    canClaimDiamond 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isClaiming ? <Loader2 className="animate-spin mx-auto" size={14} /> : (
                    nextDiamondAvailableAt && new Date() < nextDiamondAvailableAt 
                      ? `Наступний алмаз: ${nextDiamondAvailableAt.toLocaleDateString()}`
                      : 'Отримати Алмаз'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Про себе</h3>
            <Info size={14} className="text-neutral-600" />
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {user.bio || 'Розкажіть трохи про себе, щоб привернути більше уваги.'}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-2">
              <MapPin size={14} className={user.isLocationVisible ? "text-emerald-500" : "text-neutral-600"} />
              Точна Геолокація
            </h3>
            <button 
              onClick={handleToggleVisibility}
              disabled={isUpdatingVisibility}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                user.isLocationVisible ? 'bg-emerald-600' : 'bg-neutral-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                user.isLocationVisible ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className="text-neutral-400 text-xs">
            {user.isLocationVisible 
              ? "Ваше точне місцезнаходження відображається на карті іншим користувачам." 
              : "На карті показується лише місто. Увімкніть, щоб друзі могли вас знайти."}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Запросити друзів</h3>
          <p className="text-neutral-400 text-xs mb-3">Кожен реферал приносить 1 ⭐ у ваш рейтинг.</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={`https://kobelyaki.app/ref/${user.uid.slice(0, 8)}`}
              className="flex-1 bg-black border border-neutral-800 rounded-xl px-3 py-2 text-[10px] text-neutral-500 font-mono focus:outline-none"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://kobelyaki.app/ref/${user.uid.slice(0, 8)}`);
                alert('Посилання скопійовано!');
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Копіювати
            </button>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Місто</h3>
          <p className="text-neutral-300 font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Кобеляки (Локація активна)
          </p>
        </div>

        <div className="p-4 flex flex-col items-center">
          <p className="text-[10px] text-neutral-600 uppercase font-black tracking-[0.2em] mb-1">ID Користувача</p>
          <code className="text-[10px] text-neutral-700 bg-neutral-900/50 px-2 py-1 rounded select-all">
            {user.uid.slice(0, 8)}...{user.uid.slice(-4)}
          </code>
        </div>
      </div>
    </div>
  );
}
