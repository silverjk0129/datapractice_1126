import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import {
  Pen,
  Eraser,
  Undo2,
  Trash2,
  Sparkles,
  Download,
} from 'lucide-react';

export interface DrawingCanvasHandle {
  getJpgBlob: () => Promise<Blob>;
  hasDrawing: () => boolean;
  clearCanvas: () => void;
}

interface DrawingCanvasProps {
  emotionThemeColor?: string;
  onDrawingChange?: (hasDrawn: boolean) => void;
}

const PALETTE = [
  { name: '검정', hex: '#262626' },
  { name: '연필 회색', hex: '#64748B' },
  { name: '딸기 빨강', hex: '#EF4444' },
  { name: '당근 주황', hex: '#F97316' },
  { name: '병아리 노랑', hex: '#FACC15' },
  { name: '새싹 연두', hex: '#84CC16' },
  { name: '숲속 초록', hex: '#10B981' },
  { name: '하늘 파랑', hex: '#38BDF8' },
  { name: '바다 남색', hex: '#3B82F6' },
  { name: '보라 꽃잎', hex: '#A855F7' },
  { name: '달콤 분홍', hex: '#EC4899' },
  { name: '초콜릿 갈색', hex: '#854D0E' },
];

const BRUSH_SIZES = [
  { label: '얇게', size: 4 },
  { label: '보통', size: 10 },
  { label: '두껍게', size: 20 },
  { label: '넓게', size: 36 },
];

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ onDrawingChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#262626');
    const [brushSize, setBrushSize] = useState(10);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [hasDrawn, setHasDrawn] = useState(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    // 캔버스 초기화 (흰색 배경)
    const initCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // 캔버스 해상도 맞추기
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 흰색 배경 채우기 (JPEG 저장 시 검은색 배경 방지)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // 초기 상태를 히스토리에 저장
      const initialImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialImage]);
      setHasDrawn(false);
      onDrawingChange?.(false);
    }, [onDrawingChange]);

    useEffect(() => {
      initCanvas();
      const handleResize = () => {
        // 화면 크기 변경 시 내용 보존하면서 크기 재조정은 복잡하므로 최초에 잘 맞춤
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [initCanvas]);

    // 히스토리 스냅샷 저장
    const pushHistory = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => {
        const next = [...prev.slice(-15), current];
        return next;
      });
      setHasDrawn(true);
      onDrawingChange?.(true);
    }, [onDrawingChange]);

    // 좌표 계산
    const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // 그리기 시작
    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const pos = getCoordinates(e);
      lastPosRef.current = pos;
      setIsDrawing(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    };

    // 그리기 진행
    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !lastPosRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentPos = getCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = brushSize;
      ctx.stroke();

      lastPosRef.current = currentPos;
    };

    // 그리기 종료
    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // 이미 해제된 경우 무시
      }
      setIsDrawing(false);
      lastPosRef.current = null;
      pushHistory();
    };

    // 실행 취소 (Undo)
    const handleUndo = () => {
      const canvas = canvasRef.current;
      if (!canvas || history.length <= 1) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newHistory = [...history];
      newHistory.pop(); // 현재 상태 제거
      const previousState = newHistory[newHistory.length - 1];

      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);

      const stillHasDrawn = newHistory.length > 1;
      setHasDrawn(stillHasDrawn);
      onDrawingChange?.(stillHasDrawn);
    };

    // 전체 지우기
    const handleClear = () => {
      if (window.confirm('그린 그림을 모두 지우고 새로 그릴까요?')) {
        initCanvas();
      }
    };

    // JPG Blob 변환 (순수 흰색 배경 보장)
    const getJpgBlob = useCallback(async (): Promise<Blob> => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('캔버스를 찾을 수 없습니다.');
      }

      // JPG 저장을 위한 오프스크린 캔버스 생성
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext('2d');

      if (!exportCtx) {
        throw new Error('캔버스 컨텍스트를 생성할 수 없습니다.');
      }

      // 흰색 배경 확실히 칠하기 (투명도가 검은색으로 변환되는 것 방지)
      exportCtx.fillStyle = '#FFFFFF';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 원본 그림 그리기
      exportCtx.drawImage(canvas, 0, 0);

      return new Promise<Blob>((resolve, reject) => {
        exportCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('JPG 파일 생성에 실패했습니다.'));
            }
          },
          'image/jpeg',
          0.92
        );
      });
    }, []);

    // 로컬 다운로드 기능 (학생이 자기 그림 저장하고 싶을 때)
    const handleDownload = async () => {
      try {
        const blob = await getJpgBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `내마음그림_${new Date().toISOString().slice(0, 10)}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('다운로드 오류:', err);
      }
    };

    // 부모 컴포넌트에 메소드 노출
    useImperativeHandle(ref, () => ({
      getJpgBlob,
      hasDrawing: () => hasDrawn,
      clearCanvas: () => initCanvas(),
    }));

    return (
      <div className="drawing-container">
        {/* 상단 툴바: 도구, 굵기, 실행취소 */}
        <div className="canvas-toolbar">
          <div className="tool-group">
            <button
              type="button"
              className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="연필로 그리기"
            >
              <Pen size={18} />
              <span>펜</span>
            </button>
            <button
              type="button"
              className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="지우개로 지우기"
            >
              <Eraser size={18} />
              <span>지우개</span>
            </button>
          </div>

          {/* 브러시 굵기 */}
          <div className="brush-size-group">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.size}
                type="button"
                className={`brush-size-btn ${brushSize === b.size ? 'active' : ''}`}
                onClick={() => setBrushSize(b.size)}
                title={b.label}
              >
                <span
                  className="brush-dot"
                  style={{
                    width: `${Math.min(22, Math.max(6, b.size))}px`,
                    height: `${Math.min(22, Math.max(6, b.size))}px`,
                    backgroundColor: tool === 'eraser' ? '#94A3B8' : color,
                  }}
                />
                <span className="brush-label">{b.label}</span>
              </button>
            ))}
          </div>

          {/* 작업 도구: 취소, 전체삭제, 저장 */}
          <div className="action-group">
            <button
              type="button"
              className="action-btn"
              onClick={handleUndo}
              disabled={history.length <= 1}
              title="한 단계 되돌리기"
            >
              <Undo2 size={16} />
              <span>되돌리기</span>
            </button>
            <button
              type="button"
              className="action-btn danger"
              onClick={handleClear}
              title="전체 지우기"
            >
              <Trash2 size={16} />
              <span>다 지우기</span>
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={handleDownload}
              title="내 기기에 저장하기"
            >
              <Download size={16} />
              <span>내 폰/PC 저장</span>
            </button>
          </div>
        </div>

        {/* 색상 팔레트 */}
        <div className="palette-container">
          <div className="palette-colors">
            {PALETTE.map((p) => (
              <button
                key={p.hex}
                type="button"
                className={`color-btn ${color === p.hex && tool === 'pen' ? 'selected' : ''}`}
                style={{ backgroundColor: p.hex }}
                onClick={() => {
                  setColor(p.hex);
                  setTool('pen');
                }}
                title={p.name}
              />
            ))}
            {/* 커스텀 색상 선택 */}
            <label className="custom-color-picker" title="더 많은 색 고르기">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setTool('pen');
                }}
              />
              <Sparkles size={16} className="sparkle-icon" />
            </label>
          </div>
        </div>

        {/* 실제 캔버스 영역 */}
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            style={{ touchAction: 'none' }}
          />
          {!hasDrawn && (
            <div className="canvas-watermark">
              <span>✏️ 여기에 자유롭게 네 마음을 그려봐!</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
