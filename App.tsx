import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SongCard from './components/SongCard';
import { Tab, Song, MOODS, GENRES, MoodOption, GenreOption } from './types';
import { getSongRecommendations } from './services/geminiService';
import { Search, Loader2, Sparkles, RefreshCw, Plus, Star, Mic2, Heart, X, Check, Clock, Trash2, History } from 'lucide-react';

// --- Types & Constants ---
const FONT_SIZES = [
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '18px' },
  { label: '아주 크게', value: '20px' },
];

// --- Sub-components (Refactored) ---

const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentSize: number;
  onSizeChange: (index: number) => void;
}> = ({ isOpen, onClose, currentSize, onSizeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">글자 크기 설정</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {FONT_SIZES.map((size, index) => (
            <button
              key={index}
              onClick={() => onSizeChange(index)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                currentSize === index
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span style={{ fontSize: size.value }}>{size.label}</span>
              {currentSize === index && <Check size={20} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-5 mb-4 flex items-center gap-4 shadow-sm border border-slate-100">
    <div className="w-14 h-14 bg-slate-100 rounded-2xl animate-pulse shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="h-5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
      <div className="h-4 bg-slate-100 rounded-full w-1/3 animate-pulse" />
      <div className="h-10 bg-slate-50 rounded-2xl w-full mt-2 animate-pulse" />
    </div>
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.TODAY);
  const [songs, setSongs] = useState<Song[]>([]);
  
  // Persistence States
  const [favorites, setFavorites] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('pickSongFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pickSongSearchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [userProfile, setUserProfile] = useState<string>(() => {
    return localStorage.getItem('pickSongUserProfile') || '';
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Font Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  
  const lastRequest = useRef<{ category: string, query?: string } | null>(null);

  // --- Effects ---
  
  // Font Size Effect
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSizeIndex].value;
  }, [fontSizeIndex]);

  // Save Favorites
  useEffect(() => {
    localStorage.setItem('pickSongFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save Search History
  useEffect(() => {
    localStorage.setItem('pickSongSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Save User Profile
  useEffect(() => {
    localStorage.setItem('pickSongUserProfile', userProfile);
  }, [userProfile]);

  // Tab Change Logic
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSongs([]);
    setSelectedChip(null);
    setSearchQuery('');
    setIsSearchFocused(false);
    
    if (currentTab === Tab.TODAY) {
      fetchSongs('today');
    }
  }, [currentTab]);

  // --- Handlers ---

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.title === song.title && f.artist === song.artist);
      return isFav 
        ? prev.filter(f => !(f.title === song.title && f.artist === song.artist))
        : [...prev, song];
    });
  };

  const fetchSongs = useCallback(async (
    category: 'today' | 'mood' | 'genre' | 'artist' | 'custom', 
    query?: string,
    isLoadMore = false,
    forceRefresh = false
  ) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      if (!forceRefresh) setSongs([]);
    }

    lastRequest.current = { category, query };
    const excludeList = isLoadMore ? songs.map(s => `${s.title} - ${s.artist}`) : [];
    
    const result = await getSongRecommendations(category, query, excludeList, forceRefresh);
    
    setSongs(prev => isLoadMore ? [...prev, ...result] : result);
    setLoading(false);
    setLoadingMore(false);
  }, [songs]);

  const handleChipClick = (type: 'mood' | 'genre', item: MoodOption | GenreOption) => {
    setSelectedChip(item.id);
    fetchSongs(type, item.label);
  };

  const updateSearchHistory = (term: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(t => t !== term);
      return [term, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setSearchHistory(prev => prev.filter(t => t !== term));
  };

  const handleSearch = (e: React.FormEvent, termOverride?: string) => {
    e.preventDefault();
    const term = termOverride || searchQuery;
    if (term.trim()) {
      fetchSongs('artist', term);
      updateSearchHistory(term);
      setIsSearchFocused(false);
      setSearchQuery(term);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile.trim()) fetchSongs('custom', userProfile);
  };

  // --- Render Sections ---

  const renderToday = () => (
    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 rounded-[2rem] shadow-lg shadow-violet-200 mb-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      <h2 className="text-2xl font-black mb-2 flex items-center gap-2 relative z-10">
        <Sparkles className="text-yellow-300 fill-yellow-300" /> 오늘의 추천곡
      </h2>
      <p className="text-violet-100 font-medium relative z-10">
        오늘 노래방에서 뭐 부르지? 고민 해결!
      </p>
    </div>
  );

  const renderMoods = () => (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {MOODS.map((mood) => (
        <button
          key={mood.id}
          onClick={() => handleChipClick('mood', mood)}
          className={`
            p-5 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-3 shadow-sm border
            ${selectedChip === mood.id
              ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-500 ring-offset-2'
              : 'bg-white border-slate-100 hover:border-violet-100 hover:shadow-md'
            }
          `}
        >
          <span className="text-4xl filter drop-shadow-sm">{mood.emoji}</span>
          <span className={`text-sm font-bold ${selectedChip === mood.id ? 'text-violet-700' : 'text-slate-600'}`}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );

  const renderGenres = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-3">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleChipClick('genre', genre)}
            className={`
              py-3 rounded-2xl text-[11px] font-bold transition-all shadow-sm
              ${selectedChip === genre.id
                ? 'bg-slate-800 text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
              }
            `}
          >
            {genre.label}
          </button>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative">
          <h3 className="text-sm text-slate-500 font-bold mb-3 flex items-center gap-2">
            <Mic2 size={16} /> 가수 검색
          </h3>
          <form onSubmit={handleSearch} className="flex gap-2 relative">
            <input
              type="text"
              placeholder="가수 이름 (예: 아이유)"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border-none text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="px-5 bg-slate-800 rounded-2xl text-white disabled:opacity-30 hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
            >
              <Search size={22} />
            </button>
          </form>

          {/* Search History Dropdown */}
          {isSearchFocused && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-6">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
                <History size={14} /> 최근 검색어
              </div>
              <ul>
                {searchHistory.map((term, idx) => (
                  <li key={idx}>
                    <button
                      onClick={(e) => handleSearch(e, term)}
                      className="w-full text-left px-5 py-3 hover:bg-violet-50 text-slate-600 hover:text-violet-700 flex items-center justify-between group transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-300 group-hover:text-violet-300" />
                        {term}
                      </span>
                      <span 
                        onClick={(e) => removeHistoryItem(e, term)}
                        className="p-1.5 rounded-full hover:bg-violet-100 text-slate-300 hover:text-violet-500"
                      >
                        <Trash2 size={14} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );

  const renderForYou = () => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
      <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Heart className="text-pink-500 fill-pink-500" size={22} /> AI 취향 저격
      </h2>
      <p className="text-xs text-slate-400 mb-4 bg-slate-50 p-3 rounded-xl">
        입력하신 취향은 자동으로 저장되어 다음 방문 시에도 유지됩니다.
      </p>
      <form onSubmit={handleCustomSubmit}>
        <textarea 
          value={userProfile}
          onChange={(e) => setUserProfile(e.target.value)}
          placeholder="어떤 스타일을 좋아하세요?&#13;&#10;(예: 고음이 시원한 락발라드, 분위기 띄우는 90년대 댄스곡)"
          className="w-full h-32 p-5 rounded-2xl bg-slate-50 border-none text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-400 mb-4 resize-none text-base leading-relaxed outline-none"
        />
        <button
          type="submit"
          disabled={!userProfile.trim() || loading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {userProfile ? '맞춤 추천 업데이트' : 'AI에게 추천받기'}
        </button>
      </form>
    </div>
  );

  const renderSongList = () => {
    if (loading && songs.length === 0) return Array(3).fill(0).map((_, i) => <LoadingSkeleton key={i} />);
    
    if (songs.length === 0) return null;

    return (
      <div className="space-y-2 mt-6">
        {currentTab !== Tab.TODAY && (
          <div className="flex items-center justify-between px-2 mb-4">
             <h3 className="font-bold text-slate-800 text-lg">추천 리스트</h3>
             <button 
               onClick={() => lastRequest.current && fetchSongs(lastRequest.current.category as any, lastRequest.current.query, false, true)}
               className="text-xs font-bold flex items-center gap-1.5 text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 hover:text-violet-600 hover:border-violet-100 transition-colors"
             >
               <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> 다시 추천
             </button>
          </div>
        )}
        
        {songs.map((song, index) => (
          <SongCard 
            key={`${song.title}-${song.artist}-${index}`} 
            song={song} 
            index={index} 
            isFavorite={favorites.some(f => f.title === song.title && f.artist === song.artist)}
            onToggleFavorite={toggleFavorite}
          />
        ))}

        <button
          onClick={() => lastRequest.current && fetchSongs(lastRequest.current.category as any, lastRequest.current.query, true)}
          disabled={loadingMore}
          className="w-full py-4 mt-6 rounded-[2rem] bg-white border border-slate-100 text-slate-500 hover:text-violet-600 hover:border-violet-100 hover:shadow-md transition-all flex items-center justify-center gap-2 font-bold"
        >
          {loadingMore ? <Loader2 className="animate-spin" /> : <><Plus size={18} /> 더 보기</>}
        </button>
      </div>
    );
  };

  const renderMyList = () => (
    <div className="space-y-4 pb-24">
      <div className="bg-yellow-50 p-6 rounded-[2rem] border border-yellow-100 mb-6">
          <h2 className="text-xl font-black text-yellow-500 mb-2 flex items-center gap-2">
            <Star className="fill-yellow-500" /> 나만의 리스트
          </h2>
          <p className="text-yellow-600/70 font-medium">
            내가 찜한 노래 {favorites.length}곡
          </p>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Star size={40} className="fill-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">보관함이 비어있어요.</p>
        </div>
      ) : (
        favorites.map((song, index) => (
          <SongCard 
            key={`${song.title}-${song.artist}-${index}`} 
            song={song} 
            index={index} 
            isFavorite={true}
            onToggleFavorite={toggleFavorite}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-24">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-md mx-auto px-5 py-6">
        {currentTab === Tab.TODAY && renderToday()}
        {currentTab === Tab.MOOD && renderMoods()}
        {currentTab === Tab.GENRE && renderGenres()}
        {currentTab === Tab.FOR_YOU && renderForYou()}
        {currentTab === Tab.MY_LIST ? renderMyList() : renderSongList()}
        
        {/* Empty State Helper */}
        {!loading && songs.length === 0 && currentTab !== Tab.MY_LIST && currentTab !== Tab.TODAY && !selectedChip && currentTab !== Tab.FOR_YOU && (
          <div className="text-center py-10 text-slate-400 text-sm">
            원하는 메뉴를 선택해주세요
          </div>
        )}
      </main>

      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSize={fontSizeIndex}
        onSizeChange={setFontSizeIndex}
      />
    </div>
  );
};

export default App;