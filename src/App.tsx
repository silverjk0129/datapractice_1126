import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, storage, isFirebaseConfigured } from './firebase';
import type { EmotionKey } from './types';
import { Header } from './components/Header';
import { StudentNameStep } from './components/StudentNameStep';
import { EmotionSelectStep } from './components/EmotionSelectStep';
import { DrawingCanvas, type DrawingCanvasHandle } from './components/DrawingCanvas';
import { SubmitSection } from './components/SubmitSection';
import { SuccessModal } from './components/SuccessModal';
import { EmotionGallery } from './components/EmotionGallery';
import { FirebaseNotice } from './components/FirebaseNotice';
import { Paintbrush } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'write' | 'gallery'>('write');
  const [studentName, setStudentName] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey | null>(null);
  const [note, setNote] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);

  // 오류 및 유효성 검사
  const [nameError, setNameError] = useState('');
  const [emotionError, setEmotionError] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 제출 진행 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressText, setProgressText] = useState('');

  // 성공 모달 데이터
  const [successData, setSuccessData] = useState<{
    studentName: string;
    emotion: EmotionKey;
    imageUrl: string;
    note?: string;
  } | null>(null);

  // 등록된 레코드 수
  const [recordCount, setRecordCount] = useState(0);

  const canvasRef = useRef<DrawingCanvasHandle>(null);

  // Firestore 레코드 개수 모니터링 (배지용)
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    try {
      const unsub = onSnapshot(collection(db, 'emotion_records'), (snap) => {
        setRecordCount(snap.docs.length);
      }, (err) => {
        console.warn('레코드 카운트 구독 경고:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Firestore 초기화 전 카운트 패스:', err);
    }
  }, []);

  // 축하 폭죽 효과 (Confetti)
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#8B5CF6', '#0284C7', '#E11D48', '#EC4899'],
      });
    } catch {
      // Confetti 실패 시 무시
    }
  };

  // 폼 리셋
  const handleResetForm = () => {
    setStudentName('');
    setSelectedEmotion(null);
    setNote('');
    setNameError('');
    setEmotionError('');
    setSubmitError(null);
    setSuccessData(null);
    canvasRef.current?.clearCanvas();
  };

  // 전송 처리
  const handleSubmit = async () => {
    let hasValidationIssue = false;

    // 1. 이름 검증
    if (!studentName.trim()) {
      setNameError('이름을 꼭 적어주세요! 선생님이 누구인지 알 수 있어요.');
      hasValidationIssue = true;
    } else {
      setNameError('');
    }

    // 2. 감정 선택 검증
    if (!selectedEmotion) {
      setEmotionError('오늘의 감정을 하나 선택해 주세요!');
      hasValidationIssue = true;
    } else {
      setEmotionError('');
    }

    if (hasValidationIssue) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    // 3. 그림 여부 확인 (경고 후 진행 가능)
    const isDrawn = canvasRef.current?.hasDrawing() ?? hasDrawn;
    if (!isDrawn) {
      const proceedWithoutDrawing = window.confirm(
        '그림을 아직 그리지 않았어요! 이대로 선생님께 전송할까요?'
      );
      if (!proceedWithoutDrawing) {
        return;
      }
    }

    // 4. Firebase 설정 검사
    if (!isFirebaseConfigured()) {
      setSubmitError(
        'Firebase 설정이 아직 적용되지 않았습니다. .env.local 파일에 실제 Firebase 프로젝트 설정값을 입력해 주세요.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 5-1. 캔버스를 JPG Blob으로 변환
      setProgressText('🎨 예쁜 그림을 JPG 이미지로 만드는 중...');
      const jpgBlob = await canvasRef.current?.getJpgBlob();
      if (!jpgBlob) {
        throw new Error('그림 이미지를 생성하지 못했습니다.');
      }

      // 5-2. Cloud Storage에 JPG 업로드
      setProgressText('☁️ Firebase Storage에 그림 업로드 중...');
      const cleanName = studentName.trim().replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filePath = `drawings/${cleanName}_${timestamp}_${randomStr}.jpg`;

      const storageRef = ref(storage, filePath);
      const uploadResult = await uploadBytes(storageRef, jpgBlob, {
        contentType: 'image/jpeg',
        customMetadata: {
          studentName: studentName.trim(),
          emotion: selectedEmotion!,
        },
      });

      // 5-3. Storage 다운로드 URL 획득
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 5-4. Firestore에 학생 데이터 저장
      setProgressText('📝 Firestore에 마음 기록을 저장하는 중...');
      const now = new Date();
      const dateString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      await addDoc(collection(db, 'emotion_records'), {
        studentName: studentName.trim(),
        emotion: selectedEmotion,
        imageUrl: downloadUrl,
        imageStoragePath: filePath,
        note: note.trim(),
        createdAt: serverTimestamp(),
        createdDateString: dateString,
      });

      // 6. 성공 처리 및 축하
      triggerConfetti();
      setSuccessData({
        studentName: studentName.trim(),
        emotion: selectedEmotion!,
        imageUrl: downloadUrl,
        note: note.trim(),
      });
    } catch (err: any) {
      console.error('Firebase 저장 실패:', err);
      let message = err.message || '알 수 없는 오류가 발생했습니다.';
      if (err.code === 'storage/unauthorized' || err.code === 'permission-denied') {
        message =
          'Firebase 접근 권한이 없습니다. Firebase Console의 Firestore/Storage 보안 규칙(Rules)을 확인해 주세요.';
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
      setProgressText('');
    }
  };

  return (
    <div className="app-layout">
      {/* 귀여운 배경 장식 버블 */}
      <div className="bg-bubble bubble-1" />
      <div className="bg-bubble bubble-2" />
      <div className="bg-bubble bubble-3" />

      {/* 헤더 */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        recordCount={recordCount}
      />

      {/* Firebase 미설정 경고 안내 */}
      <FirebaseNotice />

      <main className="main-content">
        {currentTab === 'write' ? (
          <div className="write-flow">
            {/* 1단계: 학생 이름 입력 */}
            <StudentNameStep
              name={studentName}
              onChange={(val) => {
                setStudentName(val);
                if (val.trim()) setNameError('');
              }}
              error={nameError}
            />

            {/* 2단계: 감정 선택 (행복, 평온, 불안, 슬픔, 화남, 피곤) */}
            <EmotionSelectStep
              selectedEmotion={selectedEmotion}
              onSelect={(emotion) => {
                setSelectedEmotion(emotion);
                setEmotionError('');
              }}
              error={emotionError}
            />

            {/* 3단계: 그림 그리기 캔버스 */}
            <section className="step-card">
              <div className="step-header">
                <div className="step-number">3단계</div>
                <h2 className="step-title">
                  <Paintbrush className="step-icon" size={24} />
                  지금 마음을 그림으로 표현해봐
                </h2>
              </div>
              <p className="step-desc">
                단어로는 다 표현하기 힘든 네 마음을 색깔과 선으로 자유롭게 그려봐요.
              </p>

              <DrawingCanvas
                ref={canvasRef}
                onDrawingChange={setHasDrawn}
              />
            </section>

            {/* 4단계: 한 마디 및 전송 버튼 */}
            <SubmitSection
              note={note}
              onNoteChange={setNote}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitProgressText={progressText}
              errorMessage={submitError}
            />
          </div>
        ) : (
          /* 우리 반 마음 모아보기 (선생님 / 갤러리 뷰) */
          <EmotionGallery onBackToWrite={() => setCurrentTab('write')} />
        )}
      </main>

      {/* 전송 성공 모달 */}
      {successData && (
        <SuccessModal
          studentName={successData.studentName}
          emotion={successData.emotion}
          imageUrl={successData.imageUrl}
          note={successData.note}
          onReset={handleResetForm}
          onViewGallery={() => {
            setSuccessData(null);
            handleResetForm();
            setCurrentTab('gallery');
          }}
        />
      )}

      {/* 푸터 */}
      <footer className="app-footer">
        <p>🏫 우리 학교 따뜻한 정서 모니터링 시스템 • Powered by Firebase & React</p>
      </footer>
    </div>
  );
}
