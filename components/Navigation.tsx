import React from 'react';
import { Tab } from '../types';
import { Sparkles, Smile, Music2, User, Star } from 'lucide-react';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { tab: Tab.TODAY, label: '투데이', icon: <Sparkles size={22} /> },
    { tab: Tab.MOOD, label: '분위기', icon: <Smile size={22} /> },
    { tab: Tab.GENRE, label: '장르', icon: <Music2 size={22} /> },
    { tab: Tab.FOR_YOU, label: 'AI 추천', icon: <User size={22} /> },
    { tab: Tab.MY_LIST, label: '보관함', icon: <Star size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] pb-safe">
      <nav className="max-w-md mx-auto flex justify-between items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 ${
                isActive ? '-translate-y-1' : ''
              }`}
            >
              <div className={`
                p-2 rounded-2xl mb-1 transition-all duration-300
                ${isActive 
                  ? 'bg-violet-100 text-violet-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 bg-transparent'
                }
              `}>
                {React.cloneElement(item.icon as React.ReactElement, { 
                  strokeWidth: isActive ? 2.5 : 2,
                  size: 24
                })}
              </div>
              <span className={`text-[11px] font-bold ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;