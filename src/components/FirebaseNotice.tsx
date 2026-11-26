import React from 'react';
import { AlertCircle, FileKey } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

export const FirebaseNotice: React.FC = () => {
  if (isFirebaseConfigured()) return null;

  return (
    <div className="firebase-notice-banner">
      <div className="notice-icon-box">
        <AlertCircle size={24} className="text-amber-600" />
      </div>
      <div className="notice-content">
        <h4 className="notice-title">
          <FileKey size={16} /> Firebase 설정이 필요합니다 (.env.local)
        </h4>
        <p className="notice-text">
          현재 <code>.env.local</code> 파일에 임시 키가 설정되어 있습니다. Firebase Console의
          <strong> [프로젝트 설정] &gt; [일반] &gt; [내 앱] &gt; [웹 앱 SDK 설정]</strong>에서
          발급받은 실제 키 값을 <code>.env.local</code>에 붙여넣어 주세요.
        </p>
      </div>
    </div>
  );
};
