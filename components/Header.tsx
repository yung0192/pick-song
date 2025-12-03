import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          <span>🎤</span> 
          <span>Pick Song</span>
        </h1>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
};

export default Header;