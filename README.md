# 🌈 마음 날씨 다이어리 (학생 정서 모니터링 웹 앱)

초등학생도 쉽고 즐겁게 사용할 수 있는 따뜻하고 아기자기한 감정 일기 & 정서 모니터링 웹 애플리케이션입니다.  
학생이 자신의 이름을 입력하고 감정(행복, 평온, 불안, 슬픔, 화남, 피곤)을 선택한 뒤, 마음을 자유롭게 그림으로 그려 Firebase(Cloud Storage & Firestore)에 저장할 수 있습니다.

---

## 🛠️ 기술 스택
- **프론트엔드**: React 19, TypeScript, Vite
- **백엔드/클라우드**: Firebase (Firestore Database, Cloud Storage)
- **아이콘 & 효과**: Lucide React, Canvas Confetti
- **스타일링**: 따뜻한 파스텔톤 커스텀 CSS, 반응형 디자인, 터치/펜/마우스 지원 HTML5 Canvas

---

## 📦 1. 설치된 패키지

이미 설치가 완료되어 있으나, 새로운 환경에서 실행할 경우 아래 명령어로 설치합니다:

```bash
npm install firebase lucide-react canvas-confetti @types/canvas-confetti
```

---

## 🔑 2. 환경 변수 설정 (`.env.local`)

프로젝트 루트 경로에 `.env.local` 파일이 생성되어 있습니다.  
Firebase 콘솔에서 발급받은 실제 설정값으로 수정해 주세요:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> **참고**: `.env.local`은 `.gitignore`에 등록되어 있어 Git 저장소에 커밋되지 않으므로 안전합니다.

---

## 🚀 3. 로컬 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 빌드 테스트
npm run build

# 코드 린트 검사
npm run lint
```

---

## 🔥 4. Firebase Console 필수 설정 안내

### 1) Firebase 웹 앱 설정값 확인 위치
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 후 좌측 상단 톱니바퀴 ⚙️ **[프로젝트 설정]** 클릭
3. **[일반]** 탭 하단의 **[내 앱]** 목록에서 웹 앱(`< / >`) 선택
4. `firebaseConfig` 객체 안에 있는 값들을 확인하여 `.env.local`에 복사 & 붙여넣기

---

### 2) Firestore Database 보안 규칙 (Rules)
학생들이 로그인 없이 감정과 그림 URL을 등록하고 읽을 수 있도록 규칙을 설정합니다:

1. Firebase Console > 좌측 메뉴 **Firestore Database** 클릭
2. 상단 **[규칙 (Rules)]** 탭 클릭
3. 아래와 같이 규칙을 설정하고 **[게시]** 버튼을 클릭합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /emotion_records/{document=**} {
      // 읽기 및 쓰기 허용 (개발 및 테스트용)
      allow read, write: if true;
    }
  }
}
```

> 💡 **운영 환경 권한 관리 팁**: 추후 학생 인증 기능 추가 시 `allow write: if request.auth != null;` 또는 특정 교사 계정만 읽을 수 있도록 세분화할 수 있습니다.

---

### 3) Cloud Storage 보안 규칙 (Rules)
그림 파일(`.jpg`)을 안전하게 업로드하고 다운로드할 수 있도록 Storage 규칙을 설정합니다:

1. Firebase Console > 좌측 메뉴 **Storage** 클릭
2. 상단 **[규칙 (Rules)]** 탭 클릭
3. 아래와 같이 규칙을 설정하고 **[게시]** 버튼을 클릭합니다:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /drawings/{allPaths=**} {
      // JPG 이미지 업로드 및 읽기 허용
      allow read, write: if true;
    }
  }
}
```

---

### 4) Cloud Storage 버킷 주소 형식 확인
- 최신 Firebase 프로젝트의 경우 Storage Bucket 주소가 `your-project.firebasestorage.app` 또는 `your-project.appspot.com` 형태입니다.
- Firebase 콘솔의 웹 앱 설정에 표시된 `storageBucket` 문자열을 그대로 `.env.local`의 `VITE_FIREBASE_STORAGE_BUCKET`에 넣어주세요.

---

## ✨ 5. 주요 기능 안내

1. **학생 이름 입력**:
   - 친근한 동물 캐릭터와 함께 학생의 학번/이름을 입력합니다.
2. **6가지 감정 선택지**:
   - `행복` (따사로운 햇살 ☀️)
   - `평온` (살랑살랑 봄바람 🍃)
   - `불안` (안개 자욱한 아침 🌫️)
   - `슬픔` (주룩주룩 비 오는 날 🌧️)
   - `화남` (우르르 쾅쾅 천둥번개 ⚡)
   - `피곤` (스르륵 깜깜한 밤 🌙)
3. **그림 그리기 스튜디오 (HTML5 Canvas)**:
   - 12가지 파스텔/비비드 컬러 팔레트 & 나만의 색상 선택기
   - 브러시 굵기 4단계 조절 (얇게, 보통, 두껍게, 넓게)
   - 펜 ✏️ / 지우개 🧼 모드 전환
   - 실행 취소(Undo) 및 전체 지우기(Clear)
   - 순수 흰색 바탕의 고화질 **JPG 변환** 보장 (투명 영역이 검게 변하는 현상 방지)
4. **Firebase 연동**:
   - 그림 이미지는 **Cloud Storage (`drawings/...jpg`)** 에 업로드
   - 학생 이름, 감정 이모지, 이미지 URL, 한 마디 메모, 타임스탬프는 **Firestore (`emotion_records`)** 에 저장
5. **축하 효과 & 모아보기 갤러리**:
   - 제출 완료 시 파스텔 폭죽(Confetti) 연출
   - 상단 **"우리 반 마음 모아보기"** 탭을 통해 실시간으로 반 친구들의 마음 기록을 감정별로 필터링하고 검색하며 크게 볼 수 있는 교사용/반 전체 갤러리 제공
