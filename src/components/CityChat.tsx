import { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapUser, CityChatMessage } from '../types';
import { Send, User } from 'lucide-react';

export function CityChat({ currentUser }: { currentUser: MapUser }) {
  const [messages, setMessages] = useState<CityChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'cityChat'), orderBy('createdAt', 'asc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CityChatMessage));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      text: text.trim(),
      userId: currentUser.uid,
      codename: currentUser.codename,
      avatarColor: currentUser.avatarColor,
      createdAt: serverTimestamp(),
    };

    setText('');
    try {
      await addDoc(collection(db, 'cityChat'), payload);
    } catch (err) {
      console.error("Помилка відправки", err);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-black">
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">Чат міста</h2>
          <p className="text-xs text-neutral-400">Кобеляки</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUser.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full ${msg.avatarColor} flex-shrink-0 flex items-center justify-center`}>
                    <User size={16} className="text-white/80" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-neutral-800 text-neutral-200 rounded-bl-none'}`}>
                  {!isMe && <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">{msg.codename}</div>}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 pb-safe">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input 
            type="text" 
            placeholder="Написати місту..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
