import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini AI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// In-memory cache to store recommendations
const recommendationCache = new Map<string, Song[]>();

export const getSongRecommendations = async (
  category: 'today' | 'mood' | 'genre' | 'artist' | 'custom',
  query?: string,
  excludeList: string[] = [], // List of "Title - Artist" to exclude
  ignoreCache: boolean = false
): Promise<Song[]> => {
  if (!ai) {
    console.error("API Key is missing");
    return getFallbackSongs();
  }

  // Generate cache key based on category and query.
  // We only cache the "initial" page (where excludeList is empty).
  const cacheKey = `${category}:${query || ''}`;

  // Return cached result if available, valid, and not ignored
  if (!ignoreCache && excludeList.length === 0 && recommendationCache.has(cacheKey)) {
    // console.log(`[GeminiService] Cache Hit for ${cacheKey}`);
    return recommendationCache.get(cacheKey)!;
  }

  const model = "gemini-2.5-flash";
  let prompt = "";

  // Convert exclusion list to string to inform the model
  const excludeStr = excludeList.length > 0 
    ? `다음 노래들은 이미 추천했으니 제외하고 추천해줘: ${excludeList.join(", ")}.`
    : "";

  switch (category) {
    case 'today':
      prompt = `대한민국 노래방에서 오늘 부르기 좋은 인기 곡 5개를 추천해줘. 최신 유행곡이나 스테디셀러 위주로. ${excludeStr}`;
      break;
    case 'mood':
      prompt = `기분이 '${query}'일 때 대한민국 노래방에서 부르기 좋은 노래 5곡을 추천해줘. 분위기에 딱 맞는 곡으로 선정해줘. ${excludeStr}`;
      break;
    case 'genre':
      prompt = `장르가 '${query}'인 대한민국 노래방 인기 곡 5개를 추천해줘. ${excludeStr}`;
      break;
    case 'artist':
      prompt = `가수 '${query}'의 노래 중 노래방에서 가장 인기 있는 곡 5개를 추천해줘. ${excludeStr}`;
      break;
    case 'custom':
      prompt = `사용자가 다음과 같은 스타일의 노래를 좋아해: "${query}". 이 취향을 분석해서 대한민국 노래방에서 부르기 좋은 노래 5곡을 추천해줘. ${excludeStr}`;
      break;
  }

  const systemInstruction = `
    You are a professional Karaoke DJ in Korea. 
    Recommend songs that are popular in Korean karaoke (Noraebang).
    Ensure the artist and title are accurate in Korean.
    Provide a short, witty reason why this song is good for the specific request.
    Return the response in strictly valid JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Song title in Korean" },
              artist: { type: Type.STRING, description: "Artist name in Korean" },
              reason: { type: Type.STRING, description: "Short reason for recommendation (max 50 chars)" },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "2-3 hashtags related to the song vibe e.g. #HighNote #Sad" 
              }
            },
            required: ["title", "artist", "reason", "tags"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return getFallbackSongs();
    
    const songs = JSON.parse(jsonText) as Song[];

    // Update cache only for the initial page (when not excluding songs)
    if (excludeList.length === 0 && songs.length > 0) {
      recommendationCache.set(cacheKey, songs);
    }

    return songs;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackSongs();
  }
};

// Fallback data in case of API failure or missing key
const getFallbackSongs = (): Song[] => [
  {
    title: "응급실",
    artist: "izi",
    reason: "노래방 영원한 1위, 남자들의 국룰 곡!",
    tags: ["#이별", "#락발라드", "#국룰"]
  },
  {
    title: "소주 한 잔",
    artist: "임창정",
    reason: "술 한잔 생각나는 날 무조건 불러야 함.",
    tags: ["#술", "#고음", "#감성"]
  },
  {
    title: "첫눈처럼 너에게 가겠다",
    artist: "에일리",
    reason: "겨울 감성 끝판왕, 가창력 뽐내기 좋음.",
    tags: ["#도깨비", "#겨울", "#발라드"]
  }
];