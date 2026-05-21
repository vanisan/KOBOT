import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Heart, X, MapPin } from 'lucide-react';
import { MapUser } from '../types';
import { supabase } from '../db';

export function Discover() {
  const [users, setUsers] = useState<MapUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const uid = sessionData?.session?.user?.id;
        setCurrentUid(uid || null);

        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        if (data) {
          setUsers(data.filter(u => u.uid !== uid) as MapUser[]);
        }
      } catch (err) {
        console.error("fetchUsers error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const channel = supabase.channel('users_discover_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentUser = users.length > 0 ? users[0] : null;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentUser) return;
    
    if (direction === 'right') {
      setLiked([...liked, currentUser.uid]);
    }
    
    // Remove the user from stack
    setUsers(users.slice(1));
  };

  if (loading) {
    return <div className="flex h-screen bg-black items-center justify-center text-indigo-500">Пошук...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
          <MapPin className="text-neutral-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Поруч більше нікого немає</h2>
        <p className="text-neutral-500 text-sm">
          Зайдіть пізніше. Можливо, в Кобеляках з'явиться хтось новий.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 pb-0 bg-black overflow-hidden relative">
      <div className="flex-1 relative flex items-center justify-center w-full max-w-sm mx-auto">
        <AnimatePresence>
          <motion.div
            key={currentUser.uid}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 200 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute w-full aspect-[3/4] bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl"
          >
            <div className={`h-2/5 ${currentUser.avatarColor} flex items-center justify-center relative`}>
              {currentUser.isOnline && (
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold text-white/90 tracking-wider">Online</span>
                </div>
              )}
              <User size={80} className="text-white/50" />
            </div>

            <div className="p-6 h-3/5 flex flex-col">
              <div className="flex items-end justify-between mb-2">
                <h2 className="text-3xl font-bold tracking-tight">{currentUser.codename}</h2>
                <span className="text-xl font-medium text-neutral-400 mb-0.5">{currentUser.age}</span>
              </div>
              
              <div className="flex items-center space-x-1 mb-4 text-neutral-500 text-sm font-medium">
                <MapPin size={14} />
                <span>Кобеляки • ~2 км від вас</span>
              </div>

              <p className="text-neutral-300 leading-relaxed mb-6 flex-1 overflow-y-auto text-sm">
                {currentUser.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentUser.interests?.map(interest => (
                  <span key={interest} className="px-3 py-1 bg-neutral-800 rounded-full text-xs font-medium text-neutral-400">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-28 flex items-center justify-center space-x-6 pb-6">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-rose-500 focus:outline-none active:scale-95 transition-transform"
        >
          <X size={28} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white focus:outline-none shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
        >
          <Heart size={28} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
