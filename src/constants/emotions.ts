import type { EmotionKey, EmotionOption } from '../types';

export const EMOTIONS: EmotionOption[] = [
  {
    key: '행복',
    label: '행복해요',
    emoji: '🥰',
    weather: '따사로운 햇살 ☀️',
    description: '기분이 아주 좋고 매일매일 웃음이 나와요!',
    bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    badgeBg: '#FEF9C3',
    badgeBorder: '#FDE047',
    badgeColor: '#854D0E',
    accentColor: '#F59E0B',
  },
  {
    key: '평온',
    label: '평온해요',
    emoji: '🌿',
    weather: '살랑살랑 봄바람 🍃',
    description: '마음이 차분하고 편안해서 좋아요.',
    bgGradient: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    badgeBg: '#DCFCE7',
    badgeBorder: '#86EFAC',
    badgeColor: '#166534',
    accentColor: '#10B981',
  },
  {
    key: '불안',
    label: '불안해요',
    emoji: '🫧',
    weather: '안개 자욱한 아침 🌫️',
    description: '가슴이 두근거리고 어딘가 걱정돼요.',
    bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    badgeBg: '#F3E8FF',
    badgeBorder: '#D8B4FE',
    badgeColor: '#6B21A8',
    accentColor: '#8B5CF6',
  },
  {
    key: '슬픔',
    label: '슬퍼요',
    emoji: '💧',
    weather: '주룩주룩 비 오는 날 🌧️',
    description: '눈물이 핑 돌고 마음이 훌쩍거려요.',
    bgGradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    badgeBg: '#E0F2FE',
    badgeBorder: '#7DD3FC',
    badgeColor: '#075985',
    accentColor: '#0284C7',
  },
  {
    key: '화남',
    label: '화나요',
    emoji: '🔥',
    weather: '우르르 쾅쾅 천둥번개 ⚡',
    description: '속이 답답하고 화가 불끈 솟아올라요.',
    bgGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
    badgeBg: '#FFE4E6',
    badgeBorder: '#FDA4AF',
    badgeColor: '#9F1239',
    accentColor: '#E11D48',
  },
  {
    key: '피곤',
    label: '피곤해요',
    emoji: '🥱',
    weather: '스르륵 깜깜한 밤 🌙',
    description: '몸에 힘이 없고 푹 쉬고 잠들고 싶어요.',
    bgGradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    badgeBg: '#F1F5F9',
    badgeBorder: '#CBD5E1',
    badgeColor: '#334155',
    accentColor: '#64748B',
  },
];

export const getEmotionConfig = (key: EmotionKey): EmotionOption => {
  const found = EMOTIONS.find((e) => e.key === key);
  return (
    found || {
      key: '행복',
      label: '행복해요',
      emoji: '😊',
      weather: '맑음 ☀️',
      description: '기분이 좋아요!',
      bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      badgeBg: '#FEF9C3',
      badgeBorder: '#FDE047',
      badgeColor: '#854D0E',
      accentColor: '#F59E0B',
    }
  );
};
