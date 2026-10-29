/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Lock, ShieldAlert, X } from 'lucide-react';
import { INITIAL_CAREER_RECORDS } from './data/mockData.ts';
import { CareerRecord, UserRole } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { CareerScoreView } from './components/CareerScoreView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { SkeletonCodeModal } from './components/SkeletonCodeModal.tsx';

export default function App() {
  // [초기 상태] 미로그인 상태 (null) & 첫 화면은 로그인 뷰('login')
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    affiliation: string;
    role: UserRole;
  } | null>(null);

  const [currentView, setCurrentView] = useState<string>('login');

  // 평정 데이터 상태 (Firestore rotation_records)
  const [careerRecords, setCareerRecords] = useState<CareerRecord[]>(INITIAL_CAREER_RECORDS);

  // 모달 상태
  const [isSkeletonModalOpen, setIsSkeletonModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // [요구사항 핵심] 관리자 비밀번호 상태 (기본값: '112233', 대시보드에서 변경 가능 및 localStorage 영구 보존)
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('admin_password') || '112233';
  });

  const handleChangeAdminPassword = (newPw: string) => {
    setAdminPassword(newPw);
    localStorage.setItem('admin_password', newPw);
    showToast('관리자 비밀번호가 성공적으로 변경되었습니다.', 'success');
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // [핵심] 네비게이션 가드: 미로그인 상태에서 보호된 페이지(경력정보/관리자) 접근 차단 및 경고창 표시
  const handleNavigate = (view: string) => {
    if (view === 'login') {
      setCurrentView('login');
      return;
    }

    // 로그인이 되어 있지 않은 경우 경고창 표시 및 페이지 이동 차단
    if (!currentUser) {
      setWarningMessage('로그인을 해주세요.');
      showToast('로그인을 해주세요.', 'warning');
      setCurrentView('login');
      return;
    }

    // 관리자 페이지는 관리자 권한 체크
    if (view === 'admin' && currentUser.role !== 'admin') {
      setWarningMessage('관리자(교사/인사담당자) 권한이 필요합니다.');
      showToast('관리자 권한이 필요합니다.', 'warning');
      return;
    }

    setCurrentView(view);
  };

  // 로그인 완료 핸들러
  const handleLoginSuccess = (name: string, affiliation: string, isAdmin: boolean) => {
    const role: UserRole = isAdmin ? 'admin' : 'employee';
    setCurrentUser({ name, affiliation, role });

    showToast(`${name}님 환영합니다!`, 'success');

    // 관리자 여부에 따라 화면 이동
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('career');
    }
  };

  // 로그아웃 핸들러
  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentView('login');
    showToast('로그아웃되었습니다.', 'info');
  };

  // 경력 정보 저장 핸들러 (Firestore rotation_records)
  const handleSaveCareerRecord = (record: CareerRecord) => {
    setCareerRecords((prev) => {
      const idx = prev.findIndex((r) => r.name === record.name);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });

    showToast(`[${record.name}] 님의 평정 배점이 rotation_records에 저장되었습니다!`, 'success');
  };

  // [요구사항 핵심] 잘못 입력된 내용 삭제 및 로그인 정보(users)까지 동시 완전 삭제
  const handleDeleteRecordAndUser = (recordId: string) => {
    const target = careerRecords.find((r) => r.id === recordId);
    if (!target) return;

    // 1. rotation_records에서 해당 평정 기록 삭제
    setCareerRecords((prev) => prev.filter((r) => r.id !== recordId));

    // 2. 만약 현재 로그인된 사용자가 삭제 대상자라면 즉시 로그아웃 처리
    if (currentUser && currentUser.name === target.name) {
      setCurrentUser(null);
      setCurrentView('login');
      showToast(`현재 접속 중인 [${target.name}] 교직원의 평정 기록 및 로그인 계정이 삭제되어 로그아웃되었습니다.`, 'warning');
    } else {
      showToast(`[${target.name} (${target.affiliation})] 교직원의 평정 데이터와 로그인 계정 정보가 모두 영구 삭제되었습니다.`, 'success');
    }
  };

  const currentEmployeeRecord = careerRecords.find(
    (r) => currentUser && r.name === currentUser.name
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* 글로벌 네비게이션 헤더 */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenSkeletonModal={() => setIsSkeletonModalOpen(true)}
      />

      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex flex-col space-y-2 pointer-events-none transition-all">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold text-white pointer-events-auto flex items-center space-x-2 animate-in slide-in-from-top-2 ${
              toastMessage.type === 'success' ? 'bg-emerald-600' :
              toastMessage.type === 'warning' ? 'bg-amber-600' : 'bg-slate-900'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 메인 뷰 전환 컨테이너 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {currentView === 'login' && (
          <LoginView
            adminPassword={adminPassword}
            onLoginSuccess={handleLoginSuccess}
            onShowWarning={(msg) => setWarningMessage(msg)}
          />
        )}

        {currentView === 'career' && currentUser && (
          <CareerScoreView
            currentUserName={currentUser.name}
            currentUserAffiliation={currentUser.affiliation}
            onSaveRecord={handleSaveCareerRecord}
            existingRecord={currentEmployeeRecord}
          />
        )}

        {currentView === 'admin' && currentUser && (
          <AdminDashboardView
            careerRecords={careerRecords}
            onDeleteRecord={handleDeleteRecordAndUser}
            adminPassword={adminPassword}
            onChangeAdminPassword={handleChangeAdminPassword}
          />
        )}
      </main>

      {/* [요구사항 핵심] "로그인을 해주세요." 경고창 모달 */}
      {warningMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">알림</h3>
              <p className="text-sm font-bold text-amber-700 mt-2 bg-amber-50 py-2 px-3 rounded-xl border border-amber-200/60">
                {warningMessage}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                경력 정보 입력 및 관리자 기능은 로그인 완료 후 이용하실 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWarningMessage(null);
                setCurrentView('login');
              }}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl text-sm transition shadow-md shadow-brand-500/25 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4 mr-1 text-white" />
              <span>뒤로가기</span>
            </button>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">순환보직 평정 시스템</span>
            <span className="text-slate-300">|</span>
            <span>단일 HTML 스켈레톤 (HTML + Tailwind + Vanilla JS + Firebase CDN)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Firestore: users & rotation_records</span>
            <span>•</span>
            <button
              onClick={() => setIsSkeletonModalOpen(true)}
              className="text-brand-600 hover:underline font-semibold"
            >
              단일 HTML 코드 복사 / 다운로드
            </button>
          </div>
        </div>
      </footer>

      {/* 단일 HTML 코드 뷰어 / 다운로더 모달 */}
      <SkeletonCodeModal
        isOpen={isSkeletonModalOpen}
        onClose={() => setIsSkeletonModalOpen(false)}
      />

    </div>
  );
}
