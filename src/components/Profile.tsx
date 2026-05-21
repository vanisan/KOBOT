import { UserProfile } from '../types';
import { User, Settings, Edit3, LogOut, Heart, Info, Loader2, MapPin, Check } from 'lucide-react';
import { logoutUser, claimDailyLike, updateLocationVisibility, updateName, updateAvatar } from '../db';
import { useState, useMemo, useRef } from 'react';

interface ProfileProps {
  user: UserProfile;
}

export function Profile({ user }: ProfileProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.codename);
  const [isSavingName, setIsSavingName] = useState(false);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const canEditName = useMemo(() => {
    if (!user.lastNameChangeAt) return true;
    const lastChange = new Date(user.lastNameChangeAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  }, [user.lastNameChangeAt]);

  const canClaimLike = useMemo(() => {
    if (!user.lastLikeClaimAt) return true;
    const lastClaim = new Date(user.lastLikeClaimAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60));
    return diffHours >= 24;
  }, [user.lastLikeClaimAt]);

  const handleClaimLike = async () => {
    if (!canClaimLike) return;
    setIsClaiming(true);
    try {
      await claimDailyLike(user.uid, user.availableLikesToGive || 0);
      window.location.reload(); 
    } catch (e: any) {
      console.error(e);
      if (e?.code === 'PGRST204') {
        alert('Помилка: Необхідно оновити структуру бази даних. Перезавантажте сторінку.');
      } else {
        alert('Помилка при отриманні лайку');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === user.codename) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await updateName(user.uid, newName.trim());
      window.location.reload();
    } catch(e) {
      console.error(e);
      alert('Помилка при зміні імені');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      alert('Розмір фото не повинен перевищувати 300 КБ');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        await updateAvatar(user.uid, base64String);
        window.location.reload();
      } catch (error: any) {
        console.error(error);
        if (error?.code === 'PGRST204') {
            alert('Помилка: Необхідно оновити структуру бази даних. Будь ласка, перезавантажте сторінку, щоб побачити інструкції.');
        } else {
            alert('Помилка при завантаженні фото');
        }
        setIsUploadingPhoto(false);
      }
    };
    reader.onerror = () => {
      alert('Помилка читання файлу');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleVisibility = async () => {
    setIsUpdatingVisibility(true);
    try {
      await updateLocationVisibility(user.uid, !user.isLocationVisible);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Помилка при зміні видимості');
    } finally {
      setIsUpdatingVisibility(false);
    }
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
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-28 h-28 ${!user.avatarUrl ? user.avatarColor : 'bg-neutral-800'} rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-black/50 cursor-pointer overflow-hidden group`}
        >
          {isUploadingPhoto ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-white/80" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Edit3 size={24} className="text-white" />
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        <div className="flex items-center gap-2 mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-white focus:outline-none"
                autoFocus
              />
              <button 
                onClick={handleSaveName}
                disabled={isSavingName}
                className="bg-indigo-600 p-1.5 rounded-lg text-white"
              >
                {isSavingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{user.codename}, {user.age}</h2>
              {canEditName && (
                <button onClick={() => setIsEditingName(true)} className="text-neutral-500 hover:text-white transition-colors">
                  <Edit3 size={16} />
                </button>
              )}
            </>
          )}
        </div>
        {!canEditName && !isEditingName && (
          <p className="text-[10px] text-neutral-500 mb-2">Ім'я можна змінювати раз на тиждень.</p>
        )}
        
        {/* Likes Status */}
        <div className="w-full max-w-[280px] mt-4 flex gap-3">
           <div className="flex-1 bg-neutral-900/80 rounded-2xl p-4 border border-rose-500/20 text-center">
              <Heart size={24} className="text-rose-500 mx-auto mb-2" fill="currentColor" />
              <div className="text-2xl font-black text-white">{user.receivedLikes || 0}</div>
              <div className="text-[10px] uppercase font-bold text-neutral-500 mt-1">Отримано</div>
           </div>
           <div className="flex-1 bg-neutral-900/80 rounded-2xl p-4 border border-indigo-500/20 text-center flex flex-col items-center justify-between">
              <div className="flex gap-1 mb-2">
                <Heart size={16} className="text-indigo-400" />
                <Heart size={16} className="text-indigo-400" />
              </div>
              <div className="text-xl font-bold text-white mb-2">{user.availableLikesToGive || 0} шт.</div>
              <button 
                  onClick={handleClaimLike}
                  disabled={!canClaimLike || isClaiming}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    canClaimLike 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isClaiming ? <Loader2 className="animate-spin mx-auto" size={12} /> : (
                    canClaimLike ? 'Отримати Лайк' : 'Доступно завтра'
                  )}
                </button>
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
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Ваші Реферали</h3>
             <span className="bg-neutral-800 text-white px-2 py-0.5 rounded text-xs font-bold">{user.referralsCount || 0}</span>
          </div>
          <p className="text-neutral-400 text-xs mb-3">Поділіться кодом з друзями, щоб побудувати свою мережу.</p>
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
      </div>
    </div>
  );
}
