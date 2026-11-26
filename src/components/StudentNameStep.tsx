import React from 'react';
import { User, Smile } from 'lucide-react';

interface StudentNameStepProps {
  name: string;
  onChange: (val: string) => void;
  error?: string;
}

const AVATAR_SUGGESTIONS = ['🐣', '🐰', '🐻', '🐱', '🐶', '🐼', '🦊', '🦁'];

export const StudentNameStep: React.FC<StudentNameStepProps> = ({
  name,
  onChange,
  error,
}) => {
  return (
    <section className="step-card">
      <div className="step-header">
        <div className="step-number">1단계</div>
        <h2 className="step-title">
          <Smile className="step-icon" size={24} />
          반가워요! 네 이름을 알려줘
        </h2>
      </div>
      <p className="step-desc">
        누가 그린 마음인지 선생님이 알아볼 수 있게 이름을 예쁘게 적어줘요.
      </p>

      <div className="name-input-wrapper">
        <div className="input-box">
          <User className="input-icon" size={20} />
          <input
            type="text"
            className={`student-name-input ${error ? 'input-error' : ''}`}
            placeholder="예) 3학년 2반 김하늘"
            value={name}
            onChange={(e) => onChange(e.target.value)}
            maxLength={20}
          />
        </div>
        {error && <p className="error-message">⚠️ {error}</p>}
      </div>

      <div className="avatar-preview">
        <span className="avatar-label">나를 닮은 귀여운 친구:</span>
        <div className="avatar-list">
          {AVATAR_SUGGESTIONS.map((emoji, idx) => (
            <span key={idx} className="avatar-chip">
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
