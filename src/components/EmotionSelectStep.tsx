import React from 'react';
import { EMOTIONS } from '../constants/emotions';
import type { EmotionKey } from '../types';
import { CloudSun } from 'lucide-react';

interface EmotionSelectStepProps {
  selectedEmotion: EmotionKey | null;
  onSelect: (emotion: EmotionKey) => void;
  error?: string;
}

export const EmotionSelectStep: React.FC<EmotionSelectStepProps> = ({
  selectedEmotion,
  onSelect,
  error,
}) => {
  return (
    <section className="step-card">
      <div className="step-header">
        <div className="step-number">2단계</div>
        <h2 className="step-title">
          <CloudSun className="step-icon" size={24} />
          오늘 너의 마음 날씨는 어떠니?
        </h2>
      </div>
      <p className="step-desc">
        지금 느끼는 감정을 가장 잘 나타내는 카드를 하나 골라봐!
      </p>

      <div className="emotion-grid">
        {EMOTIONS.map((item) => {
          const isSelected = selectedEmotion === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`emotion-card ${isSelected ? 'selected' : ''}`}
              style={
                isSelected
                  ? {
                      borderColor: item.accentColor,
                      boxShadow: `0 8px 24px -4px ${item.accentColor}40`,
                    }
                  : undefined
              }
              onClick={() => onSelect(item.key)}
            >
              <div className="emotion-emoji-badge">{item.emoji}</div>
              <div className="emotion-info">
                <div className="emotion-name-row">
                  <span className="emotion-name">{item.key}</span>
                  <span
                    className="emotion-subbadge"
                    style={{
                      backgroundColor: item.badgeBg,
                      color: item.badgeColor,
                      borderColor: item.badgeBorder,
                    }}
                  >
                    {item.weather}
                  </span>
                </div>
                <p className="emotion-description">{item.description}</p>
              </div>
              <div className="emotion-check">
                <span className="check-circle">{isSelected ? '✓' : ''}</span>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="error-message">⚠️ {error}</p>}
    </section>
  );
};
