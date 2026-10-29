/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock, LogIn, ShieldCheck, User, Users, X } from 'lucide-react';

interface LoginViewProps {
  adminPassword?: string;
  onLoginSuccess: (name: string, affiliation: string, isAdmin: boolean) => void;
  onShowWarning: (message: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ adminPassword = '112233', onLoginSuccess, onShowWarning }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState<string>('');
  const [affiliation, setAffiliation] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [isAdminCheckbox, setIsAdminCheckbox] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 이름, 학년/반, 비밀번호가 모두 입력되었는지 여부 (admin 계정은 소속 생략 가능하며 기본값 자동 적용)
  const isAdminTarget = name.trim().toLowerCase() === 'admin';
  const isLoginFormValid = name.trim().length > 0 && (isAdminTarget || affiliation.trim().length > 0) && password.trim().length > 0;
  const isSignupFormValid = isLoginFormValid && passwordConfirm.trim().length > 0 && password === passwordConfirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // [미입력 검증: 일반 회원은 이름, 소속, 비밀번호 필수 / admin 계정은 소속 생략 가능]
    if (!name.trim() || (!isAdminTarget && !affiliation.trim()) || !password.trim()) {
      onShowWarning('로그인을 해주세요.');
      return;
    }

    if (authMode === 'signup') {
      if (!passwordConfirm.trim()) {
        onShowWarning('비밀번호 확인을 입력해 주세요.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        onShowWarning('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    // [요구사항 핵심 2] 관리자 접속 조건: 아이디는 admin, 비밀번호는 112233 (또는 변경된 관리자 암호)
    const isTargetingAdmin = isAdminTarget || isAdminCheckbox;

    if (isTargetingAdmin) {
      if (!isAdminTarget) {
        const msg = "관리자 로그인은 아이디(이름)가 'admin'이어야 합니다.";
        setErrorMsg(msg);
        onShowWarning(msg);
        return;
      }

      const activeAdminPw = adminPassword || '112233';
      if (password !== activeAdminPw) {
        const msg = "관리자 비밀번호가 일치하지 않습니다.";
        setErrorMsg(msg);
        onShowWarning(msg);
        return;
      }

      // 소속은 사용자가 자유롭게 입력한 값(예: 교무부, 인사담당, 행정실 등)을 사용하며, 미입력 시 '교무부 (인사담당)'으로 자동 적용
      const adminAffiliation = affiliation.trim() || '교무부 (인사담당)';
      onLoginSuccess('admin', adminAffiliation, true);
      return;
    }

    // 일반 직원 로그인
    onLoginSuccess(name.trim(), affiliation.trim(), false);
  };

  const handleCancelSignup = () => {
    setAuthMode('login');
    setPasswordConfirm('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* 상단 비주얼 헤더 */}
        <div className="bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 p-7 text-white text-center relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {authMode === 'login' ? '순환보직 평정 시스템 로그인' : '순환보직 신규 회원가입'}
          </h2>
          <p className="text-brand-100 text-xs mt-1">
            {authMode === 'login'
              ? '이름과 학년/반(소속)으로 로그인하세요.'
              : '새로운 계정 정보를 입력하여 회원가입을 완료하세요.'}
          </p>
        </div>

        {/* 로그인 / 회원가입 전환 탭 */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-white text-brand-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-white text-brand-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            신규 회원가입
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 이름 */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                이름 <span className="text-rose-500">*</span>
              </label>
              {name.trim() && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> 입력됨
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요 (예: 홍길동 또는 admin)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* 2. 학년/반(소속) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                학년 / 반 (소속) {!isAdminTarget && <span className="text-rose-500">*</span>}
                {isAdminTarget && <span className="text-[11px] text-purple-600 font-semibold ml-1.5">(자유 입력 또는 비워둘 시 '교무부' 자동 지정)</span>}
              </label>
              {affiliation.trim() ? (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> 입력됨
                </span>
              ) : isAdminTarget ? (
                <span className="text-[10px] text-purple-600 font-medium">기본값 적용</span>
              ) : null}
            </div>
            <div className="relative">
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder={isAdminTarget ? "소속을 입력하세요 (예: 교무부, 인사팀 등 / 비워둘 시 자동 적용)" : "소속을 입력하세요 (예: 2학년 3반 또는 영업기획팀)"}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
              />
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* 3. 비밀번호 */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                비밀번호 <span className="text-rose-500">*</span>
              </label>
              {password.trim() && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> 입력됨
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* 회원가입 시: 비밀번호 확인 필드 */}
          {authMode === 'signup' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  비밀번호 확인 <span className="text-rose-500">*</span>
                </label>
                {passwordConfirm && password === passwordConfirm && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> 일치함
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* 관리자 로그인/가입 옵션 체크박스 */}
          <div className="py-0.5">
            <label className="flex items-center p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={isAdminCheckbox}
                onChange={(e) => setIsAdminCheckbox(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded-sm border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <div className="ml-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  관리자(교사 / 인사담당자)로 {authMode === 'login' ? '로그인' : '가입'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  아이디: admin, 비밀번호: 112233 (초기값) 입력 시 관리자 대시보드로 이동
                </span>
              </div>
            </label>
          </div>

          {/* =========================================================================
              [요구사항 핵심 1]
              - 이름, 학년/반, 비밀번호가 모두 입력되면 '로그인' 텍스트가 진하고 선명하게 표시됨
              - 버튼은 비밀번호 및 옵션 바로 아래에 배치
          ========================================================================= */}
          {authMode === 'login' ? (
            <div className="pt-1">
              <button
                type="submit"
                id="btn-login-submit"
                className={`w-full py-3.5 rounded-xl transition flex items-center justify-center space-x-2 text-sm cursor-pointer ${
                  isLoginFormValid
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black shadow-lg shadow-brand-500/30 scale-[1.01]'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold border border-slate-300'
                }`}
              >
                <LogIn className={`w-4 h-4 ${isLoginFormValid ? 'text-white' : 'text-slate-600'}`} />
                <span className={isLoginFormValid ? 'font-black text-white text-base tracking-wider drop-shadow-xs' : 'font-bold text-slate-700 text-sm'}>
                  로그인
                </span>
                {isLoginFormValid && <ArrowRight className="w-4 h-4 ml-0.5 text-white" />}
              </button>

              {!isLoginFormValid && (
                <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium">
                  ※ 이름, 학년/반(소속), 비밀번호를 모두 입력하면 로그인 버튼이 활성화됩니다.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleCancelSignup}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 text-sm cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>취소</span>
              </button>
              <button
                type="submit"
                id="btn-signup-submit"
                className={`w-full py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 text-sm cursor-pointer select-none ${
                  isSignupFormValid
                    ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black shadow-lg shadow-indigo-500/30 scale-[1.01]'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold border border-slate-300'
                }`}
              >
                <span className={`text-sm ${isSignupFormValid ? 'font-black text-white tracking-wide drop-shadow-xs' : 'font-bold text-slate-700'}`}>
                  가입하기
                </span>
                <ArrowRight className={`w-4 h-4 ml-0.5 ${isSignupFormValid ? 'text-white' : 'text-slate-600'}`} />
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
