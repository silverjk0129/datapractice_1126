export type EmotionKey = '행복' | '평온' | '불안' | '슬픔' | '화남' | '피곤';

export interface EmotionOption {
  key: EmotionKey;
  label: string;
  emoji: string;
  weather: string;
  description: string;
  bgGradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  accentColor: string;
}

export interface EmotionSubmission {
  studentName: string;
  emotion: EmotionKey;
  emotionEmoji: string;
  imageUrl: string;
  imageStoragePath: string;
  note?: string;
  createdAt: unknown; // Firestore Timestamp
  createdDateString?: string;
}

export interface EmotionRecord extends EmotionSubmission {
  id: string;
}
