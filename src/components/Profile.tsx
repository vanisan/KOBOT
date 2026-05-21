import { UserProfile } from '../types';
import { User, Settings, Edit3 } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
}

export function Profile({ user }: ProfileProps) {
  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-black p-6">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ваш профіль</h1>
        <button className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className={`w-28 h-28 ${user.avatarColor} rounded-full flex items-center justify-center mb-4 relative shadow-lg shadow-black/50`}>
          <User size={48} className="text-white/80" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-white">
            <Edit3 size={14} />
          </button>
        </div>
        <h2 className="text-2xl font-bold">{user.codename}, {user.age}</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Про себе</h3>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {user.bio || 'Розкажіть трохи про себе, щоб привернути більше уваги.'}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Місто</h3>
          <p className="text-neutral-300 font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Кобеляки (Локація активна)
          </p>
        </div>
      </div>
    </div>
  );
}
