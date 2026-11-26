import React from 'react';
import { Sparkles, RotateCcw, Eye, Heart } from 'lucide-react';
import type { EmotionKey } from '../types';
import { getEmotionConfig } from '../constants/emotions';

interface SuccessModalProps {
  studentName: string;
  emotion: EmotionKey;
  imageUrl: string;
  note?: string;
  onReset: () => void;
  onViewGallery: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  studentName,
  emotion,
  imageUrl,
  note,
  onReset,
  onViewGallery,
}) => {
  const emotionConfig = getEmotionConfig(emotion);

  return (
    <div className="modal-backdrop">
      <div className="success-modal-card">
        <div className="success-badge">
          <Sparkles className="sparkle-icon" size={20} />
          <span>전송 완료!</span>
          <Heart className="heart-icon" size={20} />
        </div>

        <h2 className="success-title">마음이 성공적으로 전달되었어요! 🎉</h2>
        <p className="success-subtitle">
          <strong>{studentName}</strong> 친구의 소중한 감정과 그림이 선생님께 잘 도착했단다.
        </p>

        {/* 결과 요약 카드 */}
        <div
          className="success-summary-box"
          style={{ background: emotionConfig.bgGradient }}
        >
          <div className="summary-emotion-row">
            <span className="summary-emoji">{emotionConfig.emoji}</span>
            <div className="summary-emotion-text">
              <span className="summary-emotion-name">
                {emotionConfig.label} ({emotion})
              </span>
              <span className="summary-weather">{emotionConfig.weather}</span>
            </div>
          </div>

          <div className="summary-image-wrapper">
            <img
              src={imageUrl}
              alt={`${studentName}의 그림`}
              className="summary-image"
            />
          </div>

          {note && (
            <div className="summary-note">
              <span className="summary-note-label">💌 남긴 한 마디:</span>
              <p className="summary-note-content">"{note}"</p>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="success-actions">
          <button
            type="button"
            className="btn-success-action secondary"
            onClick={onReset}
          >
            <RotateCcw size={18} />
            <span>새로운 마음 그리기</span>
          </button>
          <button
            type="button"
            className="btn-success-action primary"
            onClick={onViewGallery}
          >
            <Eye size={18} />
            <span>우리 반 모아보기 가기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
