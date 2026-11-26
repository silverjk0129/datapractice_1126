import React from 'react';
import { Heart, Sparkles, BookOpen, Palette } from 'lucide-react';

interface HeaderProps {
  currentTab: 'write' | 'gallery';
  onTabChange: (tab: 'write' | 'gallery') => void;
  recordCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  recordCount = 0,
}) => {
  return (
    <header className="app-header">
      <div className="header-badge">
        <Sparkles size={16} className="text-amber-500" />
        <span>우리 반 마음 돋보기</span>
        <Heart size={16} className="text-pink-500 fill-pink-500" />
      </div>
      <h1 className="header-title">🌈 마음 날씨 다이어리</h1>
      <p className="header-subtitle">
        오늘 네 마음속에는 어떤 날씨가 찾아왔니? 솔직하게 그림으로 들려줘!
      </p>

      {/* 모드 전환 탭 */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab-btn ${currentTab === 'write' ? 'active' : ''}`}
          onClick={() => onTabChange('write')}
        >
          <Palette size={18} />
          <span>오늘 마음 그리기</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${currentTab === 'gallery' ? 'active' : ''}`}
          onClick={() => onTabChange('gallery')}
        >
          <BookOpen size={18} />
          <span>우리 반 마음 모아보기</span>
          {recordCount > 0 && <span className="tab-counter">{recordCount}</span>}
        </button>
      </div>
    </header>
  );
};
