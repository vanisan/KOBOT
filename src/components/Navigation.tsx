import React from 'react';
import { User, HeartHandshake, Map as MapIcon, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const navItems = [
    { id: 'discover', icon: HeartHandshake, label: 'Пошук' },
    { id: 'map', icon: MapIcon, label: 'Карта' },
    { id: 'chats', icon: MessageCircle, label: 'Чати' },
    { id: 'profile', icon: User, label: 'Профіль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-indigo-500" : "text-neutral-500 hover:text-neutral-400"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
