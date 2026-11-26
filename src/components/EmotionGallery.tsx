import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import type { EmotionRecord, EmotionKey } from '../types';
import { EMOTIONS, getEmotionConfig } from '../constants/emotions';
import {
  Sparkles,
  Calendar,
  X,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';

interface EmotionGalleryProps {
  onBackToWrite: () => void;
}

export const EmotionGallery: React.FC<EmotionGalleryProps> = ({ onBackToWrite }) => {
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(() => isFirebaseConfigured());
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<EmotionRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const q = query(
        collection(db, 'emotion_records'),
        orderBy('createdAt', 'desc')
      );

      // 실시간 Firestore 구독
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: EmotionRecord[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            let dateStr = data.createdDateString;
            if (!dateStr && data.createdAt?.toDate) {
              const d = data.createdAt.toDate();
              dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            }
            return {
              id: doc.id,
              studentName: data.studentName || '익명',
              emotion: data.emotion as EmotionKey,
              emotionEmoji: data.emotionEmoji || '😊',
              imageUrl: data.imageUrl || '',
              imageStoragePath: data.imageStoragePath || '',
              note: data.note || '',
              createdAt: data.createdAt,
              createdDateString: dateStr || '방금 전',
            };
          });
          setRecords(items);
          setLoading(false);
          setLoadError(null);
        },
        async (error) => {
          console.warn('실시간 구독 오류(인덱스 또는 보안규칙), 단발 쿼리로 폴백:', error);
          try {
            // orderBy 제거하고 단순 getDocs 시도
            const fallbackSnap = await getDocs(collection(db, 'emotion_records'));
            const items: EmotionRecord[] = fallbackSnap.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                studentName: data.studentName || '익명',
                emotion: data.emotion as EmotionKey,
                emotionEmoji: data.emotionEmoji || '😊',
                imageUrl: data.imageUrl || '',
                imageStoragePath: data.imageStoragePath || '',
                note: data.note || '',
                createdAt: data.createdAt,
                createdDateString: data.createdDateString || '최근',
              };
            });
            setRecords(items);
            setLoading(false);
          } catch (fallbackErr: any) {
            console.error('Firestore 읽기 실패:', fallbackErr);
            setLoadError(fallbackErr?.message || '데이터를 불러오지 못했습니다.');
            setLoading(false);
          }
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('갤러리 초기화 실패:', err);
      queueMicrotask(() => {
        setLoadError(err?.message || '갤러리를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
    }
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.emotion === filter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.note && r.note.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="gallery-container">
      {/* 갤러리 상단 소개 */}
      <div className="gallery-header-box">
        <div className="gallery-title-row">
          <h2 className="gallery-title">
            <Sparkles size={24} className="text-amber-500" />
            우리 반 마음 정원 🌷
          </h2>
          <button
            type="button"
            className="gallery-write-btn"
            onClick={onBackToWrite}
          >
            ✏️ 내 마음 그리러 가기
          </button>
        </div>
        <p className="gallery-desc">
          친구들이 솔직하게 남긴 오늘의 마음과 그림을 함께 모아보는 공간이에요.
        </p>

        {/* 필터 및 검색 바 */}
        <div className="gallery-controls">
          <div className="emotion-filter-bar">
            <button
              type="button"
              className={`filter-chip ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              🌈 전체 ({records.length})
            </button>
            {EMOTIONS.map((e) => {
              const count = records.filter((r) => r.emotion === e.key).length;
              return (
                <button
                  key={e.key}
                  type="button"
                  className={`filter-chip ${filter === e.key ? 'active' : ''}`}
                  onClick={() => setFilter(e.key)}
                >
                  <span>{e.emoji}</span>
                  <span>{e.key}</span>
                  {count > 0 && <span className="chip-count">{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="학생 이름이나 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 에러 메시지 알림 */}
      {loadError && (
        <div className="gallery-error-banner">
          <p>⚠️ Firestore에서 목록을 읽는 중 문제가 발생했습니다: {loadError}</p>
          <p className="text-xs">
            Firebase Console에서 Firestore 보안 규칙이 읽기를 허용하도록 설정되어 있는지 확인해 주세요.
          </p>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <div className="gallery-loading">
          <RefreshCw className="spinner" size={32} />
          <p>우리 반의 예쁜 마음들을 불러오는 중이에요...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* 빈 화면 */
        <div className="gallery-empty">
          <div className="empty-icon">🎨</div>
          <h3 className="empty-title">
            {records.length === 0
              ? '아직 등록된 마음 기록이 없어요!'
              : '선택한 조건에 맞는 기록이 없어요.'}
          </h3>
          <p className="empty-subtitle">
            {records.length === 0
              ? '오늘의 첫 번째 마음을 그리고 멋진 그림을 남겨볼까요?'
              : '다른 감정 필터를 누르거나 검색어를 지워보세요.'}
          </p>
          {records.length === 0 && (
            <button
              type="button"
              className="empty-action-btn"
              onClick={onBackToWrite}
            >
              💖 지금 마음 기록하러 가기
            </button>
          )}
        </div>
      ) : (
        /* 카드 그리드 */
        <div className="gallery-grid">
          {filteredRecords.map((item) => {
            const config = getEmotionConfig(item.emotion);
            return (
              <div
                key={item.id}
                className="record-card"
                onClick={() => setSelectedImage(item)}
              >
                {/* 상단: 학생 이름 & 감정 배지 */}
                <div className="card-top">
                  <div className="card-student">
                    <span className="card-avatar">🌸</span>
                    <strong className="card-name">{item.studentName}</strong>
                  </div>
                  <span
                    className="card-emotion-badge"
                    style={{
                      backgroundColor: config.badgeBg,
                      color: config.badgeColor,
                      borderColor: config.badgeBorder,
                    }}
                  >
                    <span>{config.emoji}</span>
                    <span>{item.emotion}</span>
                  </span>
                </div>

                {/* 그림 이미지 썸네일 */}
                <div className="card-image-box">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`${item.studentName}의 그림`}
                      className="card-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-no-image">그림 없음</div>
                  )}
                  <div className="card-hover-overlay">
                    <span>🔍 크게 보기</span>
                  </div>
                </div>

                {/* 한 마디 메모 */}
                {item.note && (
                  <p className="card-note">"{item.note}"</p>
                )}

                {/* 하단 날짜 */}
                <div className="card-bottom">
                  <span className="card-date">
                    <Calendar size={14} />
                    {item.createdDateString}
                  </span>
                  <span className="card-weather-tag">{config.weather}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 이미지 크게 보기 모달 */}
      {selectedImage && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-title-info">
                <h3>{selectedImage.studentName} 친구의 마음</h3>
                <span
                  className="card-emotion-badge"
                  style={{
                    backgroundColor: getEmotionConfig(selectedImage.emotion).badgeBg,
                    color: getEmotionConfig(selectedImage.emotion).badgeColor,
                    borderColor: getEmotionConfig(selectedImage.emotion).badgeBorder,
                  }}
                >
                  {getEmotionConfig(selectedImage.emotion).emoji} {selectedImage.emotion}
                </span>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedImage(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="lightbox-image-wrapper">
              <img
                src={selectedImage.imageUrl}
                alt={`${selectedImage.studentName}의 그림`}
                className="lightbox-img"
              />
            </div>

            {selectedImage.note && (
              <div className="lightbox-note">
                <strong>💌 남긴 한 마디:</strong>
                <p>{selectedImage.note}</p>
              </div>
            )}

            <div className="lightbox-footer">
              <span className="lightbox-date">
                작성 일시: {selectedImage.createdDateString}
              </span>
              <a
                href={selectedImage.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="lightbox-download-link"
              >
                <ExternalLink size={16} />
                원본 이미지 보기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
