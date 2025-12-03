import React from 'react';
import { Song } from '../types';
import { Mic, Star } from 'lucide-react';

interface SongCardProps {
  song: Song;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, index, isFavorite, onToggleFavorite }) => {
  return (
    <div 
      className="bg-white rounded-[2rem] p-5 mb-4 flex items-start gap-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards hover:shadow-lg transition-shadow"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
        <Mic size={24} strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 min-w-0 pr-8">
        <h3 className="text-lg font-black text-slate-800 truncate mb-1 leading-tight">
          {song.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 mb-3 truncate">
          {song.artist}
        </p>
        
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl mb-3 leading-relaxed border border-slate-100">
          "{song.reason}"
        </div>

        <div className="flex flex-wrap gap-1.5">
          {song.tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(song);
        }}
        className={`absolute top-5 right-5 p-2 rounded-full transition-all active:scale-90 ${
          isFavorite 
            ? 'text-yellow-400 bg-yellow-50' 
            : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
        }`}
      >
        <Star size={22} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
      </button>
    </div>
  );
};

export default SongCard;