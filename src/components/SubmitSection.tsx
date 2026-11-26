import React from 'react';
import { Send, Loader2, MessageSquareHeart } from 'lucide-react';

interface SubmitSectionProps {
  note: string;
  onNoteChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitProgressText: string;
  errorMessage?: string | null;
}

export const SubmitSection: React.FC<SubmitSectionProps> = ({
  note,
  onNoteChange,
  onSubmit,
  isSubmitting,
  submitProgressText,
  errorMessage,
}) => {
  return (
    <section className="step-card submit-card">
      <div className="step-header">
        <div className="step-number">4단계</div>
        <h2 className="step-title">
          <MessageSquareHeart className="step-icon" size={24} />
          선생님께 마음 전하기
        </h2>
      </div>
      <p className="step-desc">
        그림과 함께 선생님께 남기고 싶은 이야기가 있다면 편하게 적어줘요. (선택)
      </p>

      <div className="note-box">
        <textarea
          className="note-textarea"
          placeholder="선생님, 오늘 친구와 놀이터에서 놀아서 정말 행복했어요! 또는 조금 걱정되는 일이 있어요..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          maxLength={300}
          disabled={isSubmitting}
        />
        <div className="char-count">{note.length} / 300자</div>
      </div>

      {errorMessage && (
        <div className="submit-error-banner">
          <p className="error-title">🚨 저장이 잘 안 되었어요</p>
          <p className="error-detail">{errorMessage}</p>
        </div>
      )}

      <button
        type="button"
        className="submit-button"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="spinner" size={22} />
            <span>{submitProgressText || '선생님께 전송 중...'}</span>
          </>
        ) : (
          <>
            <Send size={22} />
            <span>선생님께 내 마음 전송하기! 💌</span>
          </>
        )}
      </button>

      <p className="submit-help">
        💡 제출 버튼을 누르면 그림은 <strong>Firebase Storage</strong>에 JPG로 안전하게 저장되고,
        이름과 감정은 <strong>Firestore</strong>에 기록됩니다.
      </p>
    </section>
  );
};
