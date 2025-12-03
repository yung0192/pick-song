export interface Song {
  title: string;
  artist: string;
  reason: string;
  tags: string[];
}

export enum Tab {
  TODAY = 'TODAY',
  MOOD = 'MOOD',
  GENRE = 'GENRE',
  ARTIST = 'ARTIST',
  FOR_YOU = 'FOR_YOU',
  MY_LIST = 'MY_LIST',
}

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface GenreOption {
  id: string;
  label: string;
  color: string;
}

export const MOODS: MoodOption[] = [
  { id: 'exciting', label: '신나는', emoji: '🎉', color: 'from-pink-500 to-rose-500' },
  { id: 'sad', label: '슬픈/이별', emoji: '💧', color: 'from-blue-500 to-cyan-500' },
  { id: 'romance', label: '설레는/고백', emoji: '💕', color: 'from-red-400 to-pink-400' },
  { id: 'stress', label: '스트레스 해소', emoji: '🔥', color: 'from-orange-500 to-red-600' },
  { id: 'calm', label: '잔잔한/위로', emoji: '🍃', color: 'from-teal-400 to-emerald-500' },
  { id: 'duet', label: '듀엣/함께', emoji: '🎤', color: 'from-purple-500 to-indigo-500' },
];

export const GENRES: GenreOption[] = [
  { id: 'ballad', label: '발라드', color: 'bg-blue-600' },
  { id: 'dance', label: '댄스', color: 'bg-pink-600' },
  { id: 'hiphop', label: '힙합/랩', color: 'bg-slate-600' },
  { id: 'rock', label: '록/밴드', color: 'bg-red-700' },
  { id: 'rnb', label: 'R&B/Soul', color: 'bg-purple-600' },
  { id: 'trot', label: '트로트', color: 'bg-yellow-600' },
  { id: 'pop', label: 'POP', color: 'bg-indigo-600' },
  { id: 'indie', label: '인디', color: 'bg-teal-600' },
];